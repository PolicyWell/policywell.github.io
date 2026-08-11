import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/supabase/database.types";
import { buildCashValueAnalysis } from "@/lib/v1/cashvalue";
import {
  calculateFundingAnalysis,
  calculateScenarioAnalysis,
} from "@/lib/v1/funding";
import { buildLapseResult } from "@/lib/v1/lapse";

type Db = SupabaseClient<Database>;

function factValue(
  facts: { field_path: string; value_json: Json }[],
  path: string,
): unknown {
  return facts.find((f) => f.field_path === path)?.value_json ?? null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export async function assertCaseAccess(
  supabase: Db,
  caseId: string,
  userId: string,
) {
  const { data, error } = await supabase
    .from("insurance_cases")
    .select("*")
    .eq("id", caseId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) {
    const err = new Error("Case not found");
    (err as Error & { status: number }).status = 404;
    throw err;
  }
  if (data.owner_user_id !== userId && data.assigned_producer_id !== userId) {
    const err = new Error("Forbidden");
    (err as Error & { status: number }).status = 403;
    throw err;
  }
  return data;
}

export async function loadPrimaryPolicy(supabase: Db, caseId: string) {
  const { data, error } = await supabase
    .from("policies")
    .select("*")
    .eq("case_id", caseId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function getCaseSummary(supabase: Db, caseId: string, userId: string) {
  const caseRow = await assertCaseAccess(supabase, caseId, userId);
  const policy = await loadPrimaryPolicy(supabase, caseId);
  const { data: facts } = await supabase
    .from("policy_facts")
    .select("field_path, value_json, source_page, confidence, verification_status")
    .eq("case_id", caseId);
  const { data: analysis } = await supabase
    .from("policy_analyses")
    .select("*")
    .eq("case_id", caseId)
    .eq("analysis_type", "funding")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const { data: documents } = await supabase
    .from("documents")
    .select("id, original_filename, document_type, status, created_at")
    .eq("case_id", caseId)
    .order("created_at", { ascending: false });

  return {
    case: caseRow,
    policy,
    documents: documents ?? [],
    facts: facts ?? [],
    funding: analysis?.result_json ?? null,
    requiresCurrentInforceIllustration:
      analysis?.requires_current_inforce_illustration ?? false,
  };
}

export async function getCaseFunding(supabase: Db, caseId: string, userId: string) {
  await assertCaseAccess(supabase, caseId, userId);
  const policy = await loadPrimaryPolicy(supabase, caseId);
  if (!policy) {
    const err = new Error("No policy on case — ingest an illustration first");
    (err as Error & { status: number }).status = 404;
    throw err;
  }

  const { data: facts } = await supabase
    .from("policy_facts")
    .select("field_path, value_json")
    .eq("case_id", caseId);

  const guideline =
    asNumber(factValue(facts ?? [], "premium.guideline_maximum_level")) ?? 0;
  const monthly =
    policy.modal_premium ??
    (policy.annualized_premium != null ? Number(policy.annualized_premium) / 12 : 0);

  const funding = calculateFundingAnalysis({
    monthlyPremium: Number(monthly),
    noLapseAnnualPremium: Number(policy.no_lapse_annual_premium ?? 0),
    guidelineMaximumLevelPremium: guideline,
  });

  return { policyId: policy.id, ...funding };
}

export async function getCaseLapse(supabase: Db, caseId: string, userId: string) {
  await assertCaseAccess(supabase, caseId, userId);
  const policy = await loadPrimaryPolicy(supabase, caseId);
  if (!policy) {
    const err = new Error("No policy on case — ingest an illustration first");
    (err as Error & { status: number }).status = 404;
    throw err;
  }

  const { data: facts } = await supabase
    .from("policy_facts")
    .select("field_path, value_json")
    .eq("case_id", caseId);
  const { data: document } = await supabase
    .from("documents")
    .select("document_type")
    .eq("case_id", caseId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    policyId: policy.id,
    ...buildLapseResult({
      guaranteedCoverageCessationAge: asNumber(
        factValue(facts ?? [], "coverage.guaranteed_cessation_age"),
      ),
      midpointCoverageCessationAge: asNumber(
        factValue(facts ?? [], "coverage.midpoint_cessation_age"),
      ),
      illustratedDurationYears: asNumber(
        factValue(facts ?? [], "coverage.illustrated_duration_years"),
      ),
      documentType: document?.document_type ?? null,
    }),
  };
}

export async function getCaseCashValue(
  supabase: Db,
  caseId: string,
  userId: string,
  age: number,
) {
  await assertCaseAccess(supabase, caseId, userId);
  const policy = await loadPrimaryPolicy(supabase, caseId);
  if (!policy) {
    const err = new Error("No policy on case — ingest an illustration first");
    (err as Error & { status: number }).status = 404;
    throw err;
  }

  const { data: rows, error } = await supabase
    .from("policy_ledgers")
    .select(
      "policy_year, attained_age, annual_premium_outlay, guaranteed_accumulation_value, guaranteed_surrender_value, guaranteed_death_benefit, alternate_accumulation_value, alternate_surrender_value, alternate_death_benefit, illustrated_accumulation_value, illustrated_surrender_value, illustrated_death_benefit",
    )
    .eq("policy_id", policy.id)
    .order("policy_year", { ascending: true });
  if (error) throw new Error(error.message);

  const { data: facts } = await supabase
    .from("policy_facts")
    .select("field_path, value_json")
    .eq("case_id", caseId)
    .eq("field_path", "crediting.illustrated_rate");

  const rateRaw = facts?.[0]?.value_json;
  const illustratedCreditingRatePct =
    typeof rateRaw === "number"
      ? rateRaw
      : typeof rateRaw === "string"
        ? Number(rateRaw)
        : null;

  return {
    policyId: policy.id,
    ...buildCashValueAnalysis(rows ?? [], age, {
      illustratedCreditingRatePct: Number.isFinite(illustratedCreditingRatePct)
        ? illustratedCreditingRatePct
        : null,
      fallbackAnnualPremium:
        policy.annualized_premium != null
          ? Number(policy.annualized_premium)
          : null,
    }),
  };
}

export async function postCaseScenario(
  supabase: Db,
  caseId: string,
  userId: string,
  monthlyPremium: number,
) {
  await assertCaseAccess(supabase, caseId, userId);
  const policy = await loadPrimaryPolicy(supabase, caseId);
  if (!policy) {
    const err = new Error("No policy on case — ingest an illustration first");
    (err as Error & { status: number }).status = 404;
    throw err;
  }

  const { data: facts } = await supabase
    .from("policy_facts")
    .select("field_path, value_json")
    .eq("case_id", caseId);
  const guideline =
    asNumber(factValue(facts ?? [], "premium.guideline_maximum_level")) ?? 0;
  const currentMonthly =
    policy.modal_premium ??
    (policy.annualized_premium != null ? Number(policy.annualized_premium) / 12 : 0);

  const scenario = calculateScenarioAnalysis({
    currentMonthlyPremium: Number(currentMonthly),
    newMonthlyPremium: monthlyPremium,
    guidelineMaximumLevelPremium: guideline,
  });

  await supabase.from("policy_analyses").insert({
    case_id: caseId,
    policy_id: policy.id,
    analysis_type: "scenario",
    result_json: scenario as unknown as Json,
    requires_current_inforce_illustration: true,
  });

  await supabase.from("audit_events").insert({
    user_id: userId,
    case_id: caseId,
    action: "scenario.created",
    resource_type: "policy_analysis",
    resource_id: policy.id,
    metadata: scenario as unknown as Json,
  });

  return { policyId: policy.id, ...scenario };
}
