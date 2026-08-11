import { resolveDemoAuth, supabaseForAuth } from "@/lib/v1/auth";
import {
  assertCaseAccess,
  loadPrimaryPolicy,
} from "@/lib/v1/case-queries";
import { answerLiveQuestion, type AskContext } from "@/lib/v1/ask";
import { jsonError, jsonOk } from "@/lib/v1/http";
import type { Json } from "@/lib/supabase/database.types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ caseId: string }> };

function asNumber(value: Json | undefined): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export async function POST(req: Request, context: RouteContext) {
  try {
    const { caseId } = await context.params;
    const auth = await resolveDemoAuth(req);
    const supabase = supabaseForAuth(auth);
    await assertCaseAccess(supabase, caseId, auth.userId);

    const body = (await req.json().catch(() => ({}))) as { question?: string };
    const question = body.question?.trim();
    if (!question) {
      return jsonError(new Error("question is required"), 400);
    }

    const policy = await loadPrimaryPolicy(supabase, caseId);
    if (!policy) {
      return jsonError(new Error("No policy on case — ingest an illustration first"), 404);
    }

    const { data: facts } = await supabase
      .from("policy_facts")
      .select("field_path, value_json")
      .eq("case_id", caseId);
    const factMap = new Map(
      (facts ?? []).map((f) => [f.field_path, f.value_json] as const),
    );

    const { data: ledger } = await supabase
      .from("policy_ledgers")
      .select(
        "policy_year, attained_age, annual_premium_outlay, guaranteed_accumulation_value, guaranteed_surrender_value, alternate_accumulation_value, alternate_surrender_value, illustrated_accumulation_value, illustrated_surrender_value, guaranteed_death_benefit, alternate_death_benefit, illustrated_death_benefit",
      )
      .eq("policy_id", policy.id)
      .order("policy_year", { ascending: true });

    const { data: document } = await supabase
      .from("documents")
      .select("document_type")
      .eq("case_id", caseId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const rateRaw = factMap.get("crediting.illustrated_rate");
    const illustratedCreditingRatePct =
      typeof rateRaw === "number"
        ? rateRaw
        : typeof rateRaw === "string"
          ? Number(rateRaw)
          : null;

    const ctx: AskContext = {
      insuredName: policy.insured_name,
      carrier: policy.carrier,
      product: policy.product,
      issueAge: policy.issue_age,
      deathBenefit:
        policy.death_benefit != null ? Number(policy.death_benefit) : null,
      monthlyPremium:
        policy.modal_premium != null ? Number(policy.modal_premium) : null,
      annualPremium:
        policy.annualized_premium != null
          ? Number(policy.annualized_premium)
          : null,
      noLapseAnnualPremium:
        policy.no_lapse_annual_premium != null
          ? Number(policy.no_lapse_annual_premium)
          : null,
      guidelineMaximumLevelPremium: asNumber(
        factMap.get("premium.guideline_maximum_level"),
      ),
      guaranteedCessationAge: asNumber(
        factMap.get("coverage.guaranteed_cessation_age"),
      ),
      midpointCessationAge: asNumber(
        factMap.get("coverage.midpoint_cessation_age"),
      ),
      illustratedDurationYears: asNumber(
        factMap.get("coverage.illustrated_duration_years"),
      ),
      documentType: document?.document_type ?? null,
      illustratedCreditingRatePct: Number.isFinite(illustratedCreditingRatePct)
        ? (illustratedCreditingRatePct as number)
        : null,
      ledger: ledger ?? [],
    };

    const result = answerLiveQuestion(question, ctx);
    return jsonOk(result);
  } catch (error) {
    return jsonError(error);
  }
}
