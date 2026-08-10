/**
 * Deterministic report-book model for the /demo Intelligence carousel.
 * Scores come only from computePolicyWellScores — never invented.
 * Simulated roster rows are tagged SIMULATED; workspace rows are LIVE.
 */

import { buildAdvisorRoster, type ClientRecord } from "@/lib/clients";
import { generateRecommendations, type Recommendation } from "@/lib/recommendations";
import { computePolicyWellScores } from "@/lib/scoring";
import type {
  IngestedDocument,
  InsurancePolicySummary,
  PolicyWellScores,
  UserProfile,
} from "@/lib/types";

export type DataProvenance = "live" | "simulated";

export type SignalStatus =
  | "healthy"
  | "monitor"
  | "attention"
  | "critical"
  | "unknown"
  | "na";

export type ReportMetricKey =
  | "funding"
  | "lapseRisk"
  | "cashValue"
  | "deathBenefit"
  | "mecHeadroom"
  | "loanExposure"
  | "reviewFreshness";

export const REPORT_METRIC_LABELS: Record<ReportMetricKey, string> = {
  funding: "Funding",
  lapseRisk: "Lapse Risk",
  cashValue: "Cash Value",
  deathBenefit: "Death Benefit",
  mecHeadroom: "MEC Headroom",
  loanExposure: "Loan Exposure",
  reviewFreshness: "Review Freshness",
};

export type GapType =
  | "Underfunded"
  | "Review overdue"
  | "Missing in-force illustration"
  | "Coverage gap"
  | "Beneficiary review"
  | "Loan exposure"
  | "Rider review"
  | "Insufficient data";

export type ReportPolicyRow = {
  id: string;
  clientId: string;
  clientName: string;
  policyName: string;
  productType: string;
  carrier: string;
  provenance: DataProvenance;
  documentId?: string;
  documentName?: string;
  currentPremium: number | null;
  targetPremium: number | null;
  cashValue: number | null;
  deathBenefit: number | null;
  faceAmount: number | null;
  loans: number | null;
  scores: PolicyWellScores | null;
  scored: boolean;
  signals: Record<ReportMetricKey, SignalStatus>;
  signalNotes: Partial<Record<ReportMetricKey, string>>;
  gaps: GapType[];
  daysSinceReview: number | null;
  recommendations: Recommendation[];
};

export type ReportBook = {
  rows: ReportPolicyRow[];
  liveCount: number;
  simulatedCount: number;
  generatedAt: string;
};

function num(v: number | null | undefined): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function statusFromScore(score: number | null, invert = false): SignalStatus {
  if (score == null) return "unknown";
  const s = invert ? 100 - score : score;
  if (s >= 80) return "healthy";
  if (s >= 65) return "monitor";
  if (s >= 45) return "attention";
  return "critical";
}

function resolvePolicyFields(
  profile: UserProfile,
  documents: IngestedDocument[],
): {
  policy: InsurancePolicySummary | null;
  document: IngestedDocument | null;
  currentPremium: number | null;
  targetPremium: number | null;
  cashValue: number | null;
  deathBenefit: number | null;
  faceAmount: number | null;
  loans: number | null;
  productType: string;
  carrier: string;
  policyName: string;
} {
  const policy = profile.insurance.policies[0] ?? null;
  const document = documents[0] ?? null;
  const ext = document?.extraction;

  const currentPremium =
    num(ext?.currentPremium.value) ?? num(policy?.currentPremium.value);
  const targetPremium =
    num(ext?.targetPremium.value) ?? num(policy?.targetPremium.value);
  const cashValue = num(ext?.cashValue.value) ?? num(policy?.cashValue.value);
  const deathBenefit =
    num(ext?.deathBenefit.value) ??
    num(policy?.deathBenefit.value) ??
    num(policy?.faceAmount.value);
  const faceAmount = num(ext?.faceAmount.value) ?? num(policy?.faceAmount.value);
  const loans = num(ext?.loans.value) ?? num(policy?.loans.value) ?? 0;

  return {
    policy,
    document,
    currentPremium,
    targetPremium,
    cashValue,
    deathBenefit,
    faceAmount,
    loans,
    productType:
      ext?.productType.value ??
      policy?.productType.value ??
      "Policy",
    carrier: ext?.carrier.value ?? policy?.carrier.value ?? "Unknown carrier",
    policyName:
      ext?.productName.value ??
      policy?.productName.value ??
      document?.filename ??
      "Unnamed policy",
  };
}

function buildSignals(args: {
  scores: PolicyWellScores | null;
  currentPremium: number | null;
  targetPremium: number | null;
  cashValue: number | null;
  deathBenefit: number | null;
  loans: number | null;
  worriedAboutLapse: boolean;
  hasVerifiedDoc: boolean;
}): {
  signals: Record<ReportMetricKey, SignalStatus>;
  signalNotes: Partial<Record<ReportMetricKey, string>>;
} {
  const {
    scores,
    currentPremium,
    targetPremium,
    cashValue,
    deathBenefit,
    loans,
    worriedAboutLapse,
    hasVerifiedDoc,
  } = args;

  const signalNotes: Partial<Record<ReportMetricKey, string>> = {};
  const signals: Record<ReportMetricKey, SignalStatus> = {
    funding: "unknown",
    lapseRisk: "unknown",
    cashValue: "unknown",
    deathBenefit: "unknown",
    mecHeadroom: "na",
    loanExposure: "unknown",
    reviewFreshness: "unknown",
  };

  if (currentPremium != null && targetPremium != null && targetPremium > 0) {
    const ratio = currentPremium / targetPremium;
    if (ratio >= 1) signals.funding = "healthy";
    else if (ratio >= 0.85) signals.funding = "monitor";
    else if (ratio >= 0.7) signals.funding = "attention";
    else signals.funding = "critical";
    const gapPct = Math.round((1 - ratio) * 100);
    signalNotes.funding =
      gapPct > 0
        ? `Current annual funding is ${gapPct}% below the illustrated target premium.`
        : "Current funding meets or exceeds the illustrated target premium.";
  }

  if (scores) {
    signals.lapseRisk = statusFromScore(scores.reviewPriorityScore, true);
    signalNotes.lapseRisk = worriedAboutLapse
      ? "Household flagged lapse concern; review priority is elevated."
      : `Review priority score ${scores.reviewPriorityScore}/100 from deterministic engine.`;

    signals.cashValue = statusFromScore(scores.retirementScore);
    signalNotes.cashValue = scores.explanations.find(
      (e) => e.scoreKey === "retirementScore",
    )?.rationale;

    signals.deathBenefit = statusFromScore(
      Math.min(scores.protectionScore, scores.mortgageScore),
    );
    signalNotes.deathBenefit = scores.explanations.find(
      (e) => e.scoreKey === "protectionScore",
    )?.rationale;
  } else if (cashValue != null) {
    signals.cashValue = cashValue > 0 ? "monitor" : "unknown";
  }

  if (deathBenefit == null && scores == null) {
    signals.deathBenefit = "unknown";
  }

  // MEC / TAMRA headroom is not in extracted fields — never invent.
  signals.mecHeadroom = "na";
  signalNotes.mecHeadroom =
    "MEC / TAMRA headroom requires illustration schedule fields not present in this record.";

  if (loans == null) {
    signals.loanExposure = "unknown";
  } else if (loans <= 0) {
    signals.loanExposure = "healthy";
    signalNotes.loanExposure = "No outstanding policy loan on file.";
  } else if (cashValue != null && cashValue > 0) {
    const loanRatio = loans / cashValue;
    if (loanRatio < 0.1) signals.loanExposure = "monitor";
    else if (loanRatio < 0.25) signals.loanExposure = "attention";
    else signals.loanExposure = "critical";
    signalNotes.loanExposure = `Outstanding loan $${loans.toLocaleString()} against cash value $${cashValue.toLocaleString()}.`;
  } else {
    signals.loanExposure = "attention";
    signalNotes.loanExposure = `Outstanding loan $${loans.toLocaleString()}; cash value unavailable.`;
  }

  if (!hasVerifiedDoc) {
    signals.reviewFreshness = "attention";
    signalNotes.reviewFreshness =
      "No verified in-force illustration on file for this policy.";
  } else if (scores && scores.reviewPriorityScore >= 60) {
    signals.reviewFreshness = "attention";
    signalNotes.reviewFreshness =
      "Deterministic review priority is elevated — schedule an updated review.";
  } else {
    signals.reviewFreshness = "monitor";
    signalNotes.reviewFreshness =
      "Verified document on file; continue annual review cadence.";
  }

  return { signals, signalNotes };
}

function buildGaps(
  signals: Record<ReportMetricKey, SignalStatus>,
  scores: PolicyWellScores | null,
  recommendations: Recommendation[],
  hasVerifiedDoc: boolean,
  loans: number | null,
): GapType[] {
  const gaps: GapType[] = [];
  if (
    signals.funding === "attention" ||
    signals.funding === "critical"
  ) {
    gaps.push("Underfunded");
  }
  if (
    signals.reviewFreshness === "attention" ||
    signals.reviewFreshness === "critical"
  ) {
    gaps.push("Review overdue");
  }
  if (!hasVerifiedDoc) gaps.push("Missing in-force illustration");
  if (scores && scores.protectionScore < 60) gaps.push("Coverage gap");
  if (scores && scores.beneficiaryScore < 70) gaps.push("Beneficiary review");
  if ((loans ?? 0) > 0) gaps.push("Loan exposure");
  if (recommendations.some((r) => r.id === "rec_verify_docs")) {
    gaps.push("Insufficient data");
  }
  if (
    recommendations.some((r) => /rider/i.test(r.title)) &&
    !gaps.includes("Rider review")
  ) {
    gaps.push("Rider review");
  }
  return gaps;
}

/** Deterministic stand-in for “days since review” when no review date exists. */
function deriveDaysSinceReview(
  scores: PolicyWellScores | null,
  hasVerifiedDoc: boolean,
): number | null {
  if (!hasVerifiedDoc && !scores) return null;
  if (!scores) return hasVerifiedDoc ? 90 : null;
  // Map review priority to an implied staleness without inventing calendar dates.
  return Math.round(30 + scores.reviewPriorityScore * 3.5);
}

export function clientRecordToRow(
  client: ClientRecord,
  provenance: DataProvenance,
): ReportPolicyRow {
  const fields = resolvePolicyFields(client.profile, client.documents);
  const canScore =
    fields.currentPremium != null ||
    fields.faceAmount != null ||
    fields.deathBenefit != null ||
    client.documents.length > 0;

  const scores = canScore
    ? computePolicyWellScores(client.profile, client.documents)
    : null;

  const recommendations = generateRecommendations(
    client.profile,
    client.documents,
  );
  const hasVerifiedDoc = client.documents.some((d) => d.verified);
  const { signals, signalNotes } = buildSignals({
    scores,
    currentPremium: fields.currentPremium,
    targetPremium: fields.targetPremium,
    cashValue: fields.cashValue,
    deathBenefit: fields.deathBenefit,
    loans: fields.loans,
    worriedAboutLapse: !!client.profile.insurance.worriedAboutLapse.value,
    hasVerifiedDoc,
  });

  return {
    id: `${client.id}:${fields.policy?.id ?? fields.document?.id ?? "policy"}`,
    clientId: client.id,
    clientName: client.label,
    policyName: fields.policyName,
    productType: fields.productType,
    carrier: fields.carrier,
    provenance,
    documentId: fields.document?.id ?? fields.policy?.documentId,
    documentName: fields.document?.filename,
    currentPremium: fields.currentPremium,
    targetPremium: fields.targetPremium,
    cashValue: fields.cashValue,
    deathBenefit: fields.deathBenefit,
    faceAmount: fields.faceAmount,
    loans: fields.loans,
    scores,
    scored: scores != null,
    signals,
    signalNotes,
    gaps: buildGaps(
      signals,
      scores,
      recommendations,
      hasVerifiedDoc,
      fields.loans,
    ),
    daysSinceReview: deriveDaysSinceReview(scores, hasVerifiedDoc),
    recommendations,
  };
}

/**
 * Build the demo report book.
 * Prefer LIVE workspace household when present; always include SIMULATED
 * advisor roster for book-of-business slides (explicitly tagged).
 */
export function buildReportBook(opts?: {
  liveProfile?: UserProfile | null;
  liveDocuments?: IngestedDocument[] | null;
}): ReportBook {
  const simulated = buildAdvisorRoster().map((c) =>
    clientRecordToRow(c, "simulated"),
  );

  const rows: ReportPolicyRow[] = [];
  const liveProfile = opts?.liveProfile;
  const liveDocuments = opts?.liveDocuments ?? [];

  if (liveProfile && (liveDocuments.length > 0 || liveProfile.insurance.policies.length > 0)) {
    const liveClient: ClientRecord = {
      id: liveProfile.userId || liveProfile.id,
      label: liveProfile.displayName || "Workspace household",
      summary: "Live workspace",
      profile: liveProfile,
      documents: liveDocuments,
    };
    const liveRow = clientRecordToRow(liveClient, "live");
    // Avoid duplicating the demo Alex household when workspace is still the seed.
    const isSeedAlex =
      liveRow.clientName.toLowerCase().includes("alex") &&
      liveRow.policyName.toLowerCase().includes("life protection");
    rows.push(liveRow);
    for (const sim of simulated) {
      if (isSeedAlex && sim.clientId === "client_alex") continue;
      rows.push(sim);
    }
  } else {
    rows.push(...simulated);
  }

  return {
    rows,
    liveCount: rows.filter((r) => r.provenance === "live").length,
    simulatedCount: rows.filter((r) => r.provenance === "simulated").length,
    generatedAt: new Date().toISOString(),
  };
}

/** Simulated illustration schedule derived only for demo funding viz — labeled. */
export function fundingBenchmarks(row: ReportPolicyRow): {
  current: number | null;
  noLapse: number | null;
  guidelineMax: number | null;
  tamra7Pay: number | null;
  fundingRatio: number | null;
  premiumHeadroom: number | null;
  status: SignalStatus;
  derived: boolean;
} {
  const current = row.currentPremium;
  const target = row.targetPremium;
  if (current == null || target == null || target <= 0) {
    return {
      current,
      noLapse: null,
      guidelineMax: null,
      tamra7Pay: null,
      fundingRatio: null,
      premiumHeadroom: null,
      status: "unknown",
      derived: false,
    };
  }

  // Deterministic schedule proxies from known target — always marked derived.
  const noLapse = Math.round(target * 0.75);
  const guidelineMax = Math.round(target * 1.35);
  const tamra7Pay = Math.round(target * 4.05);
  const fundingRatio = current / target;
  const premiumHeadroom = Math.max(0, guidelineMax - current);

  return {
    current,
    noLapse,
    guidelineMax,
    tamra7Pay,
    fundingRatio,
    premiumHeadroom,
    status: row.signals.funding,
    derived: true,
  };
}

export function gapSeverity(gap: GapType): "high" | "medium" | "low" {
  switch (gap) {
    case "Underfunded":
    case "Coverage gap":
    case "Loan exposure":
      return "high";
    case "Review overdue":
    case "Missing in-force illustration":
    case "Beneficiary review":
      return "medium";
    default:
      return "low";
  }
}

export function formatMoney(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

export function formatPct(n: number | null | undefined, digits = 0): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return `${(n * 100).toFixed(digits)}%`;
}
