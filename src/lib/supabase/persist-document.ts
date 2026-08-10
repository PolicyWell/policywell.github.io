import type { Database } from "./database.types";
import type { TypedSupabaseClient } from "./client";

export const POLICY_DOCUMENTS_BUCKET = "policy-documents";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type DocumentType = Database["public"]["Enums"]["document_type"];

export function isSupabaseAuthUserId(id: string): boolean {
  return UUID_RE.test(id);
}

/** Sanitize a filename for Storage object keys (no path segments). */
export function sanitizeStorageFilename(filename: string): string {
  const base = filename.split(/[/\\]/).pop()?.trim() || "document.bin";
  return base.replace(/[^\w.\-()+ ]+/g, "_").slice(0, 180) || "document.bin";
}

/**
 * Storage RLS expects:
 * `{owner_user_id}/{case_id}/{document_id}/{filename}`
 */
export function buildPolicyDocumentStoragePath(input: {
  ownerUserId: string;
  caseId: string;
  documentId: string;
  filename: string;
}): string {
  const { ownerUserId, caseId, documentId } = input;
  if (
    !isSupabaseAuthUserId(ownerUserId) ||
    !isSupabaseAuthUserId(caseId) ||
    !isSupabaseAuthUserId(documentId)
  ) {
    throw new Error(
      "Storage path requires UUID owner, case, and document ids.",
    );
  }
  return `${ownerUserId}/${caseId}/${documentId}/${sanitizeStorageFilename(input.filename)}`;
}

export function guessDocumentType(filename: string): DocumentType {
  const n = filename.toLowerCase();
  if (/in[\s_-]?force/.test(n)) return "inforce_illustration";
  if (n.includes("illustration")) return "original_illustration";
  if (n.includes("statement")) return "annual_statement";
  if (n.includes("application") || /\bapp\b/.test(n)) return "application";
  if (n.includes("amendment")) return "amendment";
  if (n.includes("underwriting")) return "underwriting_document";
  if (n.includes("loss") && n.includes("run")) return "loss_run";
  if (n.includes("commercial")) return "commercial_policy";
  if (n.includes("contract") || n.includes("policy")) return "policy_contract";
  return "unknown";
}

export async function sha256Hex(data: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export type PersistDocumentInput = {
  supabase: TypedSupabaseClient;
  ownerUserId: string;
  file: Blob;
  filename: string;
  mimeType?: string | null;
  caseType?: Database["public"]["Enums"]["insurance_case_type"];
  displayName?: string;
};

export type PersistDocumentSuccess = {
  ok: true;
  documentId: string;
  caseId: string;
  storagePath: string;
  ingestionId: string;
  sha256: string;
};

export type PersistDocumentFailure = {
  ok: false;
  error: string;
};

/**
 * Persist a fed document into Storage + public.documents + public.ingestions.
 * Inserts into `documents` with status `uploaded`, which refreshes site_stats.
 */
export async function persistDocumentToSupabase(
  input: PersistDocumentInput,
): Promise<PersistDocumentSuccess | PersistDocumentFailure> {
  const { supabase, ownerUserId, file, filename } = input;
  if (!isSupabaseAuthUserId(ownerUserId)) {
    return {
      ok: false,
      error:
        "A real Supabase Auth user is required to save documents to the live database.",
    };
  }

  try {
    const caseId = await ensureOwnerCase(supabase, ownerUserId, {
      caseType: input.caseType ?? "life",
      displayName: input.displayName ?? "Household",
    });
    if (!caseId) {
      return { ok: false, error: "Could not create or load an insurance case." };
    }

    const documentId = crypto.randomUUID();
    const storagePath = buildPolicyDocumentStoragePath({
      ownerUserId,
      caseId,
      documentId,
      filename,
    });
    const bytes = await file.arrayBuffer();
    const sha256 = await sha256Hex(bytes);
    const mimeType =
      input.mimeType?.trim() ||
      (typeof file.type === "string" && file.type ? file.type : null);

    const { error: uploadError } = await supabase.storage
      .from(POLICY_DOCUMENTS_BUCKET)
      .upload(storagePath, bytes, {
        contentType: mimeType || "application/octet-stream",
        upsert: false,
      });
    if (uploadError) {
      return { ok: false, error: uploadError.message };
    }

    const { error: docError } = await supabase.from("documents").insert({
      id: documentId,
      case_id: caseId,
      uploaded_by: ownerUserId,
      storage_bucket: POLICY_DOCUMENTS_BUCKET,
      storage_path: storagePath,
      original_filename: sanitizeStorageFilename(filename),
      mime_type: mimeType,
      document_type: guessDocumentType(filename),
      sha256,
      status: "uploaded",
    });
    if (docError) {
      await supabase.storage.from(POLICY_DOCUMENTS_BUCKET).remove([storagePath]);
      return { ok: false, error: docError.message };
    }

    const { data: ingestion, error: ingestionError } = await supabase
      .from("ingestions")
      .insert({
        case_id: caseId,
        document_id: documentId,
        status: "queued",
      })
      .select("id")
      .single();

    if (ingestionError || !ingestion) {
      return {
        ok: false,
        error: ingestionError?.message ?? "Failed to create ingestion job.",
      };
    }

    return {
      ok: true,
      documentId,
      caseId,
      storagePath,
      ingestionId: ingestion.id,
      sha256,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Document persist failed.",
    };
  }
}

async function ensureOwnerCase(
  supabase: TypedSupabaseClient,
  ownerUserId: string,
  opts: {
    caseType: Database["public"]["Enums"]["insurance_case_type"];
    displayName: string;
  },
): Promise<string | null> {
  const { data: existing, error: readError } = await supabase
    .from("insurance_cases")
    .select("id")
    .eq("owner_user_id", ownerUserId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (readError) {
    throw new Error(readError.message);
  }
  if (existing?.id) return existing.id;

  const { data: created, error: insertError } = await supabase
    .from("insurance_cases")
    .insert({
      owner_user_id: ownerUserId,
      case_type: opts.caseType,
      display_name: opts.displayName,
      status: "created",
    })
    .select("id")
    .single();

  if (insertError) {
    throw new Error(insertError.message);
  }
  return created?.id ?? null;
}
