import { computePolicyWellScores } from "./scoring";
import type { IngestedDocument, UserProfile } from "./types";

export type RecommendationStatus = "pending" | "approved" | "rejected";

export interface Recommendation {
  id: string;
  title: string;
  rationale: string;
  inputs: string[];
  confidence: number;
  status: RecommendationStatus;
  createdAt: string;
  decidedAt?: string;
}

function rec(
  id: string,
  title: string,
  rationale: string,
  inputs: string[],
  confidence: number,
): Recommendation {
  return {
    id,
    title,
    rationale,
    inputs,
    confidence,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
}

/**
 * Deterministic rule-based recommendations (Manual §4: Reasoning →
 * Recommendations). Every recommendation starts pending and requires
 * explicit human approval before it can appear in a client report.
 */
export function generateRecommendations(
  profile: UserProfile,
  documents: IngestedDocument[],
): Recommendation[] {
  const scores = computePolicyWellScores(profile, documents);
  const out: Recommendation[] = [];
  const ext = documents[0]?.extraction;

  const current = ext?.currentPremium.value ?? null;
  const target = ext?.targetPremium.value ?? null;
  if (current != null && target != null && current < target) {
    out.push(
      rec(
        "rec_fund_to_target",
        `Increase planned premium toward target ($${current.toLocaleString()} → $${target.toLocaleString()})`,
        "Funding below target premium reduces projected policy durability and elevates lapse risk under documented assumptions.",
        [`currentPremium=${current}`, `targetPremium=${target}`, `policyHealthScore=${scores.policyHealthScore}`],
        0.85,
      ),
    );
  }

  const loans = ext?.loans.value ?? 0;
  if (loans > 0) {
    out.push(
      rec(
        "rec_loan_review",
        `Review outstanding policy loan ($${loans.toLocaleString()}) repayment strategy`,
        "Policy loans accrue interest against cash value and can create taxable boot in a 1035 exchange.",
        [`loans=${loans}`, `cashValue=${ext?.cashValue.value ?? 0}`],
        0.8,
      ),
    );
  }

  if (scores.protectionScore < 60) {
    out.push(
      rec(
        "rec_coverage_gap",
        "Discuss coverage gap against household protection need",
        `Protection score is ${scores.protectionScore}/100 versus the 10× income heuristic plus dependent adjustment.`,
        [`protectionScore=${scores.protectionScore}`],
        0.75,
      ),
    );
  }

  if (scores.beneficiaryScore < 70) {
    out.push(
      rec(
        "rec_beneficiary",
        "Confirm beneficiary designations match household profile",
        `Beneficiary score is ${scores.beneficiaryScore}/100 — household context is incomplete or undocumented.`,
        [`beneficiaryScore=${scores.beneficiaryScore}`],
        0.7,
      ),
    );
  }

  if (documents.length > 0 && documents.some((d) => !d.verified)) {
    out.push(
      rec(
        "rec_verify_docs",
        "Complete human verification of extracted policy values",
        "Unverified extractions should not be trusted for planning decisions.",
        [`unverified=${documents.filter((d) => !d.verified).length}`],
        0.95,
      ),
    );
  }

  if (profile.missingFields.length > 0) {
    out.push(
      rec(
        "rec_complete_profile",
        `Complete missing profile fields (${profile.missingFields.join(", ")})`,
        "Context gaps reduce the quality and confidence of every downstream answer.",
        profile.missingFields.map((f) => `missing=${f}`),
        0.9,
      ),
    );
  }

  if (scores.reviewPriorityScore >= 60) {
    out.push(
      rec(
        "rec_schedule_review",
        "Schedule policy review within 30 days",
        `Review priority is ${scores.reviewPriorityScore}/100 — elevated by funding gaps, loans, or lapse concern.`,
        [`reviewPriorityScore=${scores.reviewPriorityScore}`],
        0.85,
      ),
    );
  }

  return out;
}

export function decideRecommendation(
  recs: Recommendation[],
  id: string,
  status: Exclude<RecommendationStatus, "pending">,
): Recommendation[] {
  return recs.map((r) =>
    r.id === id ? { ...r, status, decidedAt: new Date().toISOString() } : r,
  );
}

/** Only human-approved recommendations may reach client-facing output. */
export function approvedForReport(recs: Recommendation[]): Recommendation[] {
  return recs.filter((r) => r.status === "approved");
}
