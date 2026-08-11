import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/supabase/database.types";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import { calculateFundingAnalysis } from "@/lib/v1/funding";
import {
  isLifeIllustration,
  parseLifeIllustrationText,
  type LifeIllustrationExtraction,
} from "@/lib/v1/life-illustration/parser";

export const POLICY_DOCUMENTS_BUCKET = "policy-documents";
export const PARSER_VERSION = "life-illustration-v1";

export type DemoAuthContext = {
  userId: string;
  accessToken: string | null;
  source: "session" | "bearer" | "demo";
};

export function getServiceRoleKey(): string | null {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    null
  );
}

export function createServiceSupabaseClient(): SupabaseClient<Database> {
  const env = getSupabasePublicEnv();
  const serviceKey = getServiceRoleKey();
  if (!env || !serviceKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  return createClient<Database>(env.url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function createUserSupabaseClient(
  accessToken: string,
): SupabaseClient<Database> {
  const env = getSupabasePublicEnv();
  if (!env) {
    throw new Error("Supabase public env is not configured.");
  }
  return createClient<Database>(env.url, env.publishableKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export type IngestDocumentInput = {
  caseId: string;
  userId: string;
  filename: string;
  mimeType: string | null;
  bytes: Buffer;
  textOverride?: string;
  /** Optional privileged client for private-bucket upload when user JWT lacks storage policies. */
  storageClient?: SupabaseClient<Database>;
};

export type IngestDocumentResult = {
  documentId: string;
  ingestionId: string;
  storagePath: string;
  documentType: string;
  policyId: string | null;
  steps: string[];
  extraction: LifeIllustrationExtraction | null;
  funding: ReturnType<typeof calculateFundingAnalysis> | null;
};

async function readDocumentText(
  bytes: Buffer,
  filename: string,
  textOverride?: string,
): Promise<string> {
  if (textOverride != null) return textOverride;
  const lower = filename.toLowerCase();
  if (lower.endsWith(".txt") || lower.endsWith(".md")) {
    return bytes.toString("utf8");
  }
  if (lower.endsWith(".json")) {
    const parsed = JSON.parse(bytes.toString("utf8")) as {
      text?: string;
      content?: string;
    };
    if (typeof parsed.text === "string") return parsed.text;
    if (typeof parsed.content === "string") return parsed.content;
    throw new Error("JSON fixture must include text or content string");
  }
  if (lower.endsWith(".pdf")) {
    const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default as (
      data: Buffer,
    ) => Promise<{ text: string }>;
    const parsed = await pdfParse(bytes);
    const text = parsed.text?.trim() ?? "";
    if (!text) {
      throw new Error("PDF contained no extractable text");
    }
    return text;
  }
  // Best-effort binary strip for odd text exports.
  const asString = bytes.toString("utf8");
  if (asString.includes("Carrier:") || asString.includes("LEDGER")) {
    return asString;
  }
  const printable = asString
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, " ")
    .replace(/\s+/g, " ");
  if (printable.includes("Carrier") || printable.includes("Illustration")) {
    return printable;
  }
  throw new Error(
    "Could not extract text from document. Use a PDF illustration, or a .txt/.json fixture.",
  );
}

export class LifeIllustrationIngestionService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async ingest(input: IngestDocumentInput): Promise<IngestDocumentResult> {
    const started = Date.now();
    const steps: string[] = [];
    const documentId = crypto.randomUUID();
    const storagePath = `${input.userId}/${input.caseId}/${documentId}/${input.filename}`;

    const storage = input.storageClient ?? this.supabase;
    const { error: uploadError } = await storage.storage
      .from(POLICY_DOCUMENTS_BUCKET)
      .upload(storagePath, input.bytes, {
        contentType: input.mimeType ?? "application/octet-stream",
        upsert: false,
      });
    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }
    steps.push("Uploaded securely");

    const { data: document, error: docError } = await this.supabase
      .from("documents")
      .insert({
        id: documentId,
        case_id: input.caseId,
        uploaded_by: input.userId,
        storage_bucket: POLICY_DOCUMENTS_BUCKET,
        storage_path: storagePath,
        original_filename: input.filename,
        mime_type: input.mimeType,
        document_type: "unknown",
        status: "processing",
      })
      .select("*")
      .single();
    if (docError || !document) {
      throw new Error(`documents insert failed: ${docError?.message ?? "unknown"}`);
    }

    const { data: ingestion, error: ingError } = await this.supabase
      .from("ingestions")
      .insert({
        case_id: input.caseId,
        document_id: documentId,
        status: "queued",
        parser_version: PARSER_VERSION,
      })
      .select("*")
      .single();
    if (ingError || !ingestion) {
      throw new Error(`ingestions insert failed: ${ingError?.message ?? "unknown"}`);
    }

    await this.supabase
      .from("insurance_cases")
      .update({ status: "ingesting" })
      .eq("id", input.caseId);

    await this.supabase.from("audit_events").insert({
      user_id: input.userId,
      case_id: input.caseId,
      action: "document.uploaded",
      resource_type: "document",
      resource_id: documentId,
      metadata: {
        filename: input.filename,
        storage_path: storagePath,
        ingestion_id: ingestion.id,
      },
    });

    const text = await readDocumentText(input.bytes, input.filename, input.textOverride);
    if (!isLifeIllustration(text, input.filename)) {
      await this.supabase
        .from("ingestions")
        .update({
          status: "failed",
          error_code: "unsupported_document",
          error_message: "Life illustration not detected",
          completed_at: new Date().toISOString(),
          processing_ms: Date.now() - started,
        })
        .eq("id", ingestion.id);
      await this.supabase
        .from("documents")
        .update({ status: "failed" })
        .eq("id", documentId);
      throw new Error("Life illustration not detected in document");
    }
    steps.push("Life illustration detected");

    await this.supabase
      .from("ingestions")
      .update({
        status: "processing",
        started_at: new Date().toISOString(),
        model_name: "deterministic-parser",
      })
      .eq("id", ingestion.id);

    const extraction = parseLifeIllustrationText(text, input.filename);

    await this.supabase
      .from("documents")
      .update({
        document_type: extraction.documentType,
        status: "ready",
      })
      .eq("id", documentId);

    const { data: policy, error: policyError } = await this.supabase
      .from("policies")
      .insert({
        case_id: input.caseId,
        insured_name: extraction.insuredName,
        carrier: extraction.carrier,
        product: extraction.product,
        product_type: extraction.productType,
        issue_age: extraction.issueAge,
        risk_class: extraction.riskClass,
        tobacco_status: extraction.tobaccoStatus,
        death_benefit: extraction.deathBenefit,
        death_benefit_option: extraction.deathBenefitOption,
        premium_mode: extraction.monthlyPremium != null ? "monthly" : "annual",
        modal_premium: extraction.monthlyPremium,
        annualized_premium: extraction.annualPremium,
        no_lapse_annual_premium: extraction.noLapseAnnualPremium,
        policy_status: "illustrated",
      })
      .select("*")
      .single();
    if (policyError || !policy) {
      throw new Error(`policies insert failed: ${policyError?.message ?? "unknown"}`);
    }

    const factRows = extraction.facts.map((f) => ({
      case_id: input.caseId,
      document_id: documentId,
      policy_id: policy.id,
      field_path: f.field_path,
      value_json: f.value as Json,
      source_page: f.source_page,
      source_excerpt: f.source_excerpt,
      confidence: f.confidence,
      fact_type: "fact" as const,
      verification_status: "document_extracted" as const,
    }));

    if (factRows.length > 0) {
      const { error: factsError } = await this.supabase.from("policy_facts").insert(factRows);
      if (factsError) {
        throw new Error(`policy_facts insert failed: ${factsError.message}`);
      }
    }
    steps.push("Policy facts extracted");

    if (extraction.ledger.length > 0) {
      const ledgerRows = extraction.ledger.map((row) => ({
        policy_id: policy.id,
        document_id: documentId,
        ...row,
      }));
      const { error: ledgerError } = await this.supabase
        .from("policy_ledgers")
        .insert(ledgerRows);
      if (ledgerError) {
        throw new Error(`policy_ledgers insert failed: ${ledgerError.message}`);
      }
    }
    steps.push("Ledger parsed");

    const monthly =
      extraction.monthlyPremium ??
      (extraction.annualPremium != null ? extraction.annualPremium / 12 : 0);
    const funding = calculateFundingAnalysis({
      monthlyPremium: monthly,
      noLapseAnnualPremium: extraction.noLapseAnnualPremium ?? 0,
      guidelineMaximumLevelPremium: extraction.guidelineMaximumLevelPremium ?? 0,
    });

    const requiresInforce = extraction.documentType === "original_illustration";
    const { error: analysisError } = await this.supabase.from("policy_analyses").insert({
      case_id: input.caseId,
      policy_id: policy.id,
      analysis_type: "funding",
      result_json: funding as unknown as Json,
      requires_current_inforce_illustration: requiresInforce,
    });
    if (analysisError) {
      throw new Error(`policy_analyses insert failed: ${analysisError.message}`);
    }

    // Persist calculation facts with provenance pointing at derived math (not AI).
    const calcFacts = [
      {
        field_path: "analysis.annual_funding",
        value: funding.annualFunding,
      },
      {
        field_path: "analysis.amount_above_no_lapse",
        value: funding.amountAboveNoLapse,
      },
      {
        field_path: "analysis.funding_ratio",
        value: funding.fundingRatio,
      },
      {
        field_path: "analysis.remaining_guideline_room",
        value: funding.remainingGuidelineRoom,
      },
    ].map((f) => ({
      case_id: input.caseId,
      document_id: documentId,
      policy_id: policy.id,
      field_path: f.field_path,
      value_json: f.value as Json,
      source_page: null,
      source_excerpt: "Calculated in TypeScript from extracted premiums",
      confidence: 1,
      fact_type: "calculation" as const,
      verification_status: "document_extracted" as const,
    }));
    await this.supabase.from("policy_facts").insert(calcFacts);

    if (funding.fundingRatio != null && funding.fundingRatio < 1) {
      await this.supabase.from("opportunities").insert({
        case_id: input.caseId,
        policy_id: policy.id,
        type: "funding_shortfall",
        priority: "high",
        title: "Premium below no-lapse funding level",
        client_insight:
          "Current planned funding is below the no-lapse annual premium shown in the illustration.",
        producer_reason: `Funding ratio ${funding.fundingRatio.toFixed(2)} vs no-lapse premium.`,
        recommended_action:
          "Review planned premium vs no-lapse and guideline maximum premiums with an updated in-force illustration.",
        status: "open",
      });
    }

    await this.supabase
      .from("ingestions")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        processing_ms: Date.now() - started,
      })
      .eq("id", ingestion.id);

    await this.supabase
      .from("insurance_cases")
      .update({ status: "analyzed" })
      .eq("id", input.caseId);

    await this.supabase.from("audit_events").insert({
      user_id: input.userId,
      case_id: input.caseId,
      action: "ingestion.completed",
      resource_type: "ingestion",
      resource_id: ingestion.id,
      metadata: {
        document_id: documentId,
        policy_id: policy.id,
        parser_version: PARSER_VERSION,
        steps,
      },
    });

    steps.push("Policy analysis complete");

    return {
      documentId,
      ingestionId: ingestion.id,
      storagePath,
      documentType: extraction.documentType,
      policyId: policy.id,
      steps,
      extraction,
      funding,
    };
  }
}
