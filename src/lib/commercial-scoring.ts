import type {
  BusinessProfile,
  CarrierAppetiteMatch,
  CommercialRiskScores,
  CoverageGap,
  RiskMitigationRecommendation,
  UnderwritingCasePreview,
} from "./commercial-types";
import type { ScoreExplanation } from "./types";

const MODEL_VERSION = "commercial-risk-0.1";
const RULES_VERSION = "commercial-rules-2026-07";

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

/** Deterministic commercial risk scores with explainable inputs. */
export function computeCommercialRiskScores(
  business: BusinessProfile,
): CommercialRiskScores {
  const missingData = [...business.missingFields];
  const explanations: ScoreExplanation[] = [];
  const assumptions: string[] = [
    "Scores are decision-support signals, not underwriting decisions or guarantees.",
    "Licensed producers and carrier underwriters remain responsible for binding and issuance.",
  ];

  const revenue = business.annualRevenue.value ?? 0;
  const payroll = business.annualPayroll.value ?? 0;
  const employees = business.employeeCount.value ?? 0;
  const locations = business.locations.length;
  const policies = business.policies.length;
  const losses = business.lossHistory.length;
  const lossDollars = business.lossHistory.reduce(
    (sum, l) => sum + (l.amount ?? 0),
    0,
  );

  // Higher = healthier / more adequate. underinsuredScore is inverted risk of gap.
  let coverageAdequacy = 42;
  if (policies >= 3) coverageAdequacy += 18;
  else if (policies >= 1) coverageAdequacy += 8;
  if (business.policies.some((p) => p.line === "general_liability")) {
    coverageAdequacy += 10;
  }
  if (business.policies.some((p) => p.line === "workers_compensation")) {
    coverageAdequacy += 8;
  }
  if (business.policies.some((p) => p.line === "commercial_property")) {
    coverageAdequacy += 6;
  }
  if (employees > 0 && !business.policies.some((p) => p.line === "workers_compensation")) {
    coverageAdequacy -= 14;
    missingData.push("workers_compensation_policy");
  }
  if (revenue > 1_000_000 && !business.policies.some((p) => p.line === "umbrella")) {
    coverageAdequacy -= 8;
  }
  coverageAdequacy = clamp(coverageAdequacy);

  explanations.push({
    scoreKey: "coverageAdequacyScore",
    label: "Coverage adequacy",
    value: coverageAdequacy,
    rationale:
      "Based on present commercial lines relative to payroll, employee count, and revenue band.",
    inputs: [
      `policies=${policies}`,
      `employees=${employees || "unknown"}`,
      `revenue=${revenue || "unknown"}`,
    ],
    missingData: missingData.slice(0, 6),
    assumptions: assumptions.slice(0, 2),
  });

  let underinsured = 100 - coverageAdequacy;
  if (losses >= 2) underinsured += 8;
  if (lossDollars > 50_000) underinsured += 10;
  underinsured = clamp(underinsured);

  explanations.push({
    scoreKey: "underinsuredScore",
    label: "Underinsured exposure",
    value: underinsured,
    rationale:
      "Inverse of coverage adequacy, increased by recent loss frequency and severity when present.",
    inputs: [
      `coverageAdequacy=${coverageAdequacy}`,
      `lossEvents=${losses}`,
      `lossDollars=${lossDollars}`,
    ],
  });

  let businessHealth = 55;
  if (revenue >= 500_000) businessHealth += 10;
  if (payroll > 0 && employees > 0) businessHealth += 8;
  if (locations >= 1) businessHealth += 5;
  if (business.hasCyberControls.value === true) businessHealth += 6;
  if (business.hasCyberControls.value === false) businessHealth -= 6;
  if (losses >= 3) businessHealth -= 12;
  if (business.overallConfidence < 0.5) businessHealth -= 8;
  businessHealth = clamp(businessHealth);

  explanations.push({
    scoreKey: "businessHealthScore",
    label: "Business health",
    value: businessHealth,
    rationale:
      "Operational completeness and control posture inferred from revenue, payroll, locations, cyber controls, and loss history.",
    inputs: [
      `revenue=${revenue || "unknown"}`,
      `payroll=${payroll || "unknown"}`,
      `locations=${locations}`,
      `cyberControls=${String(business.hasCyberControls.value)}`,
    ],
  });

  const overallRisk = clamp(
    Math.round(
      underinsured * 0.45 +
        (100 - coverageAdequacy) * 0.25 +
        (100 - businessHealth) * 0.3,
    ),
  );

  explanations.push({
    scoreKey: "overallRiskScore",
    label: "Overall risk",
    value: overallRisk,
    rationale:
      "Weighted blend of underinsured exposure, coverage gaps, and business-health pressure. Higher means more attention before renewal.",
    inputs: [
      `underinsured=${underinsured}`,
      `coverageAdequacy=${coverageAdequacy}`,
      `businessHealth=${businessHealth}`,
    ],
  });

  const confidence = clamp(
    Math.round(
      (business.overallConfidence * 70 +
        (policies > 0 ? 15 : 0) +
        (employees > 0 && payroll > 0 ? 15 : 0)) ,
    ),
  ) / 100;

  return {
    overallRiskScore: overallRisk,
    coverageAdequacyScore: coverageAdequacy,
    underinsuredScore: underinsured,
    businessHealthScore: businessHealth,
    explanations,
    assumptions,
    missingData: Array.from(new Set(missingData)),
    confidence,
    supportingDocumentIds: business.policies
      .map((p) => p.documentId)
      .filter((id): id is string => Boolean(id)),
    modelVersion: MODEL_VERSION,
    rulesVersion: RULES_VERSION,
  };
}

export function detectCoverageGaps(business: BusinessProfile): CoverageGap[] {
  const gaps: CoverageGap[] = [];
  const lines = new Set(business.policies.map((p) => p.line));
  const employees = business.employeeCount.value ?? 0;
  const revenue = business.annualRevenue.value ?? 0;
  const vehicles = business.vehiclesCount.value ?? 0;

  if (employees > 0 && !lines.has("workers_compensation")) {
    gaps.push({
      id: "gap_wc",
      line: "workers_compensation",
      severity: "high",
      title: "Workers' compensation not on file",
      rationale:
        "Employee count is present without a workers' compensation policy in the workspace.",
      missingRequirements: ["workers_compensation_policy", "payroll_report"],
      confidence: 0.86,
    });
  }
  if (!lines.has("general_liability")) {
    gaps.push({
      id: "gap_gl",
      line: "general_liability",
      severity: "high",
      title: "General liability not on file",
      rationale:
        "Most operating businesses need GL; none was extracted from uploaded commercial policies.",
      missingRequirements: ["general_liability_policy"],
      confidence: 0.8,
    });
  }
  if (vehicles > 0 && !lines.has("commercial_auto")) {
    gaps.push({
      id: "gap_auto",
      line: "commercial_auto",
      severity: "medium",
      title: "Commercial auto may be missing",
      rationale: "Vehicle count is set without a commercial auto policy on file.",
      missingRequirements: ["vehicle_schedule", "commercial_auto_policy"],
      confidence: 0.78,
    });
  }
  if (revenue >= 1_000_000 && !lines.has("umbrella")) {
    gaps.push({
      id: "gap_umbrella",
      line: "umbrella",
      severity: "medium",
      title: "Umbrella / excess may be underinsured",
      rationale:
        "Revenue band suggests reviewing umbrella limits relative to primary GL.",
      missingRequirements: ["umbrella_quote_or_policy"],
      confidence: 0.64,
    });
  }
  if (business.hasCyberControls.value === false && !lines.has("cyber")) {
    gaps.push({
      id: "gap_cyber",
      line: "cyber",
      severity: "medium",
      title: "Cyber exposure without cyber coverage",
      rationale:
        "Cyber controls marked incomplete and no cyber policy was detected.",
      missingRequirements: ["cyber_questionnaire", "cyber_policy"],
      confidence: 0.7,
    });
  }
  return gaps;
}

export function buildMitigations(
  business: BusinessProfile,
  gaps: CoverageGap[],
): RiskMitigationRecommendation[] {
  const items: RiskMitigationRecommendation[] = gaps.slice(0, 4).map((g, i) => ({
    id: `mit_${g.id}`,
    title: `Address ${g.title.toLowerCase()}`,
    summary: g.rationale,
    priority: g.severity,
    humanReviewStatus: "pending",
    assumptions: [
      "Recommendation is educational decision support pending licensed review.",
    ],
    confidence: g.confidence,
  }));

  if ((business.renewalWithinDays ?? 999) <= 90) {
    items.push({
      id: "mit_renewal",
      title: "Start renewal readiness review",
      summary: `Renewal appears within ${business.renewalWithinDays} days. Gather loss runs, payroll, and updated schedules before market submission.`,
      priority: "high",
      humanReviewStatus: "pending",
      assumptions: ["Renewal window inferred from policy expiration fields."],
      confidence: 0.82,
    });
  }

  if (business.certificatesExpiringSoon > 0) {
    items.push({
      id: "mit_coi",
      title: "Refresh expiring certificates",
      summary: `${business.certificatesExpiringSoon} certificate(s) flagged as expiring soon.`,
      priority: "medium",
      humanReviewStatus: "pending",
      assumptions: ["Certificate tracking is illustrative until COI ingest is verified."],
      confidence: 0.75,
    });
  }

  return items;
}

/** Illustrative appetite matches - never guaranteed eligibility or premium. */
export function matchCarrierAppetite(
  business: BusinessProfile,
  gaps: CoverageGap[],
): CarrierAppetiteMatch[] {
  const industry = business.industryDescription.value ?? "general business";
  const state = business.stateOfDomicile.value ?? "unknown";
  const hasWcGap = gaps.some((g) => g.line === "workers_compensation");

  return [
    {
      id: "appetite_harbor",
      carrier: "Harbor Mutual (illustrative)",
      productOrCoverage: "Businessowners / GL package",
      appetiteFit: hasWcGap ? "limited" : "moderate",
      eligibilityNotes: [
        "Appetite examples are illustrative decision support only.",
        `State of domicile on file: ${state}.`,
      ],
      estimatedPremiumRange: null,
      financialStrength: {
        rating: "A- (illustrative)",
        source: "PolicyWell demo pack",
        asOf: "2026-07-01",
      },
      requiredEvidence: [
        "ACORD application",
        "loss_runs_5yr",
        "payroll_report",
      ],
      matchReasons: [
        `Industry described as ${industry}`,
        "Primary GL / package fit for small-commercial operations",
      ],
      nonFitReasons: hasWcGap
        ? ["Workers' compensation not evidenced in workspace"]
        : ["None flagged from current incomplete file"],
      confidence: 0.58,
      dataFreshness: "2026-07-01",
      humanReviewStatus: "pending",
    },
    {
      id: "appetite_northline",
      carrier: "Northline Specialty (illustrative)",
      productOrCoverage: "Cyber + professional liability",
      appetiteFit:
        business.hasCyberControls.value === true ? "moderate" : "limited",
      eligibilityNotes: [
        "No premium estimate shown without grounded rating inputs.",
      ],
      estimatedPremiumRange: null,
      financialStrength: {
        rating: "A (illustrative)",
        source: "PolicyWell demo pack",
        asOf: "2026-06-15",
      },
      requiredEvidence: ["cyber_questionnaire", "claims_history"],
      matchReasons: ["Modular specialty appetite for cyber / E&O overlays"],
      nonFitReasons:
        business.hasCyberControls.value === false
          ? ["Cyber controls incomplete"]
          : [],
      confidence: 0.52,
      dataFreshness: "2026-06-15",
      humanReviewStatus: "pending",
    },
  ];
}

export function buildUnderwritingPreview(
  business: BusinessProfile,
  scores: CommercialRiskScores,
  gaps: CoverageGap[],
): UnderwritingCasePreview {
  const highGaps = gaps.filter((g) => g.severity === "high").length;
  let preliminaryRiskTier: UnderwritingCasePreview["preliminaryRiskTier"] =
    "standard";
  if (scores.overallRiskScore >= 75 || highGaps >= 2) {
    preliminaryRiskTier = "refer";
  } else if (scores.overallRiskScore >= 55) {
    preliminaryRiskTier = "substandard";
  } else if (scores.overallRiskScore <= 35 && highGaps === 0) {
    preliminaryRiskTier = "preferred";
  }

  return {
    id: `uw_${business.id}`,
    entityKind: "commercial",
    status: gaps.length ? "needs_evidence" : "ready_for_review",
    preliminaryRiskTier,
    likelyPathway:
      preliminaryRiskTier === "refer"
        ? "Producer review → carrier referral desk"
        : "Producer completion → standard carrier submission",
    missingRequirements: Array.from(
      new Set(gaps.flatMap((g) => g.missingRequirements)),
    ),
    additionalEvidenceNeeded: [
      "Recent loss runs (3–5 years)",
      "Current certificates of insurance",
      "Updated payroll and employee census",
    ],
    eligibilityConcerns:
      highGaps > 0
        ? ["Material coverage gaps may block clean market submission"]
        : [],
    referralOrDeclineRisk:
      scores.overallRiskScore >= 75
        ? ["Elevated overall risk score increases referral likelihood"]
        : [],
    carrierAppetiteFitIds: ["appetite_harbor", "appetite_northline"],
    confidence: scores.confidence,
    humanReviewStatus: "pending",
    assumptions: scores.assumptions,
    disclaimer:
      "Preliminary underwriting intelligence only. Not a bindable quote, eligibility guarantee, or carrier decision.",
  };
}
