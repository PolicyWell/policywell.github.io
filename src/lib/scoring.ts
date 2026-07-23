import type {
  IngestedDocument,
  PolicyWellScores,
  ScoreExplanation,
  UserProfile,
} from "./types";

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

/**
 * Deterministic PolicyWell Score engine.
 * Scores are explainable and based on documented assumptions - not LLM output.
 */
export function computePolicyWellScores(
  profile: UserProfile,
  documents: IngestedDocument[] = [],
): PolicyWellScores {
  const income = profile.financial.annualIncome.value ?? 0;
  const mortgage = profile.household.hasMortgage.value
    ? profile.household.mortgageBalance.value ?? 0
    : 0;
  const dependents = profile.household.dependentsCount.value ?? 0;
  const primary = documents[0]?.extraction ?? profile.insurance.policies[0];

  const face =
    (primary && "faceAmount" in primary
      ? primary.faceAmount.value
      : null) ??
    profile.insurance.policies[0]?.faceAmount.value ??
    0;
  const cash =
    (primary && "cashValue" in primary
      ? primary.cashValue.value
      : null) ??
    profile.insurance.policies[0]?.cashValue.value ??
    0;
  const target =
    (primary && "targetPremium" in primary
      ? primary.targetPremium.value
      : null) ??
    profile.insurance.policies[0]?.targetPremium.value ??
    0;
  const current =
    (primary && "currentPremium" in primary
      ? primary.currentPremium.value
      : null) ??
    profile.insurance.policies[0]?.currentPremium.value ??
    0;
  const death =
    (primary && "deathBenefit" in primary
      ? primary.deathBenefit.value
      : null) ??
    profile.insurance.policies[0]?.deathBenefit.value ??
    face;
  const loans =
    (primary && "loans" in primary ? primary.loans.value : null) ??
    profile.insurance.policies[0]?.loans.value ??
    0;

  const assumptions = [
    "Income replacement target = 10× annual income (industry heuristic).",
    "Mortgage protection target = 100% of outstanding mortgage balance.",
    "Policy health penalizes funding below target premium and outstanding loans.",
    "Beneficiary score rewards spouse/dependent documentation in household profile.",
    "Scores use extracted document values when verified or available; else profile fields.",
    "Individual feedback does not automatically change scoring logic.",
  ];

  // Protection: coverage vs dependents-adjusted need
  const protectionNeed = income > 0 ? income * 10 + dependents * 50_000 : dependents * 100_000;
  const protectionScore = protectionNeed > 0
    ? clamp((death / protectionNeed) * 100)
    : face > 0
      ? 60
      : 25;

  // Retirement: cash value path relative to income
  const retirementTarget = income > 0 ? income * 2 : 100_000;
  let retirementScore = retirementTarget > 0 ? clamp((cash / retirementTarget) * 100) : 40;
  if (profile.goals.retirementPlanning.value) {
    retirementScore = clamp(retirementScore + 5);
  }

  // Mortgage protection
  const mortgageScore = !profile.household.hasMortgage.value
    ? 100
    : mortgage > 0
      ? clamp((death / mortgage) * 100)
      : 40;

  // Income replacement
  const incomeReplacementScore = income > 0
    ? clamp((death / (income * 10)) * 100)
    : 35;

  // Beneficiary readiness
  const hasSpouse = profile.household.members.some((m) => m.relationship === "spouse");
  const hasKids = profile.household.members.some((m) => m.relationship === "child") || dependents > 0;
  let beneficiaryScore = 40;
  if (hasSpouse) beneficiaryScore += 30;
  if (hasKids) beneficiaryScore += 20;
  if (profile.household.maritalStatus.value) beneficiaryScore += 10;
  beneficiaryScore = clamp(beneficiaryScore);

  // Policy health
  let policyHealthScore = 50;
  if (face > 0) policyHealthScore += 10;
  if (current > 0 && target > 0) {
    const fundingRatio = current / target;
    if (fundingRatio >= 1) policyHealthScore += 25;
    else if (fundingRatio >= 0.85) policyHealthScore += 15;
    else if (fundingRatio >= 0.7) policyHealthScore += 5;
    else policyHealthScore -= 15;
  }
  if (loans > 0) policyHealthScore -= clamp((loans / Math.max(cash, 1)) * 40, 0, 30);
  if (profile.insurance.worriedAboutLapse.value) policyHealthScore -= 10;
  if (documents.some((d) => d.verified)) policyHealthScore += 5;
  policyHealthScore = clamp(policyHealthScore);

  // Review priority (higher = needs attention sooner)
  let reviewPriorityScore = 30;
  if (profile.insurance.worriedAboutLapse.value) reviewPriorityScore += 25;
  if (current > 0 && target > 0 && current < target * 0.85) reviewPriorityScore += 20;
  if (loans > 0) reviewPriorityScore += 10;
  if (policyHealthScore < 50) reviewPriorityScore += 15;
  if (profile.missingFields.length > 3) reviewPriorityScore += 10;
  reviewPriorityScore = clamp(reviewPriorityScore);

  const overallIntelligenceScore = clamp(
    protectionScore * 0.2 +
      retirementScore * 0.1 +
      mortgageScore * 0.15 +
      incomeReplacementScore * 0.15 +
      beneficiaryScore * 0.1 +
      policyHealthScore * 0.2 +
      (100 - reviewPriorityScore) * 0.1,
  );

  const explanations: ScoreExplanation[] = [
    {
      scoreKey: "protectionScore",
      label: "Protection Score",
      value: protectionScore,
      rationale: `Death benefit $${death.toLocaleString()} vs estimated need $${Math.round(protectionNeed).toLocaleString()}.`,
      inputs: [`deathBenefit=${death}`, `income=${income}`, `dependents=${dependents}`],
    },
    {
      scoreKey: "retirementScore",
      label: "Retirement Score",
      value: retirementScore,
      rationale: `Cash value $${cash.toLocaleString()} vs heuristic retirement buffer $${retirementTarget.toLocaleString()}.`,
      inputs: [`cashValue=${cash}`, `income=${income}`],
    },
    {
      scoreKey: "mortgageScore",
      label: "Mortgage Score",
      value: mortgageScore,
      rationale: profile.household.hasMortgage.value
        ? `Coverage vs mortgage balance $${mortgage.toLocaleString()}.`
        : "No mortgage on file - full mortgage protection score.",
      inputs: [`mortgage=${mortgage}`, `deathBenefit=${death}`],
    },
    {
      scoreKey: "incomeReplacementScore",
      label: "Income Replacement Score",
      value: incomeReplacementScore,
      rationale: "Compares death benefit to 10× income replacement target.",
      inputs: [`deathBenefit=${death}`, `income=${income}`],
    },
    {
      scoreKey: "beneficiaryScore",
      label: "Beneficiary Score",
      value: beneficiaryScore,
      rationale: "Based on documented spouse/dependent household context.",
      inputs: [`hasSpouse=${hasSpouse}`, `hasKids=${hasKids}`],
    },
    {
      scoreKey: "policyHealthScore",
      label: "Policy Health Score",
      value: policyHealthScore,
      rationale: "Funding vs target premium, loans, lapse concern, and document verification.",
      inputs: [`currentPremium=${current}`, `targetPremium=${target}`, `loans=${loans}`],
    },
    {
      scoreKey: "reviewPriorityScore",
      label: "Review Priority Score",
      value: reviewPriorityScore,
      rationale: "Higher means an advisor/policyholder review should happen sooner.",
      inputs: [`worriedAboutLapse=${!!profile.insurance.worriedAboutLapse.value}`, `fundingGap=${current > 0 && target > 0 ? target - current : 0}`],
    },
    {
      scoreKey: "overallIntelligenceScore",
      label: "Overall Intelligence Score",
      value: overallIntelligenceScore,
      rationale: "Weighted blend of protection, funding health, and household readiness.",
      inputs: ["weighted_composite"],
    },
  ];

  return {
    protectionScore,
    retirementScore,
    mortgageScore,
    incomeReplacementScore,
    beneficiaryScore,
    policyHealthScore,
    reviewPriorityScore,
    overallIntelligenceScore,
    explanations,
    assumptions,
  };
}
