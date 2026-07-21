import type {
  AdvisorProfile,
  CarrierProfile,
  ConfidenceLevel,
  FieldConfidence,
  FinancialProfile,
  GoalsProfile,
  HouseholdProfile,
  InsuranceProfile,
  RetirementProfile,
  RiskProfile,
  UserProfile,
  UserRole,
} from "./types";

export function field<T>(
  value: T | null,
  confidence = 0,
  source?: string,
): FieldConfidence<T> {
  return {
    value,
    confidence,
    source,
    missing:
      value === null ||
      value === undefined ||
      (typeof value === "string" && value === ""),
  };
}

export function emptyHousehold(): HouseholdProfile {
  return {
    maritalStatus: field<"single" | "married" | "partnered" | "divorced" | "widowed">(null, 0),
    members: [],
    dependentsCount: field<number>(null, 0),
    state: field<string>(null, 0),
    ownsBusiness: field<boolean>(null, 0),
    hasMortgage: field<boolean>(null, 0),
    mortgageBalance: field<number>(null, 0),
  };
}

export function emptyFinancial(): FinancialProfile {
  return {
    annualIncome: field<number>(null, 0),
    liquidAssets: field<number>(null, 0),
    debtTotal: field<number>(null, 0),
    emergencyFundMonths: field<number>(null, 0),
  };
}

export function emptyInsurance(): InsuranceProfile {
  return {
    policyCount: field<number>(null, 0),
    policies: [],
    worriedAboutLapse: field<boolean>(null, 0),
  };
}

export function emptyGoals(): GoalsProfile {
  return {
    retirementPlanning: field<boolean>(null, 0),
    estatePlanning: field<boolean>(null, 0),
    maximizeCashValue: field<boolean>(null, 0),
    preventLapse: field<boolean>(null, 0),
    incomeReplacement: field<boolean>(null, 0),
    notes: [],
  };
}

export function emptyRisk(): RiskProfile {
  return {
    riskTolerance: field<"conservative" | "moderate" | "aggressive">(null, 0),
    primaryConcerns: [],
  };
}

export function emptyRetirement(): RetirementProfile {
  return {
    targetRetirementAge: field<number>(null, 0),
    currentAge: field<number>(null, 0),
    retirementIncomeGoal: field<number>(null, 0),
  };
}

export function emptyCarrier(): CarrierProfile {
  return {
    primaryCarrier: field<string>(null, 0),
    carriers: [],
  };
}

export function emptyAdvisor(): AdvisorProfile {
  return {
    hasAdvisor: field<boolean>(null, 0),
    advisorName: field<string>(null, 0),
    imoName: field<string>(null, 0),
  };
}

export function createEmptyProfile(
  userId: string,
  role: UserRole,
  displayName: string,
  email: string,
): UserProfile {
  return {
    id: `profile_${userId}`,
    userId,
    role,
    displayName,
    email,
    household: emptyHousehold(),
    financial: emptyFinancial(),
    insurance: emptyInsurance(),
    goals: emptyGoals(),
    risk: emptyRisk(),
    retirement: emptyRetirement(),
    carrier: emptyCarrier(),
    advisor: emptyAdvisor(),
    overallConfidence: 0,
    missingFields: computeMissingFields(emptyHousehold(), emptyFinancial(), emptyInsurance(), emptyGoals(), emptyRetirement()),
    onboardingComplete: false,
    updatedAt: new Date().toISOString(),
  };
}

export function confidenceLabel(score: number): ConfidenceLevel {
  if (score >= 0.8) return "high";
  if (score >= 0.5) return "medium";
  return "low";
}

export function computeMissingFields(
  household: HouseholdProfile,
  financial: FinancialProfile,
  insurance: InsuranceProfile,
  goals: GoalsProfile,
  retirement: RetirementProfile,
): string[] {
  const missing: string[] = [];
  if (household.maritalStatus.missing) missing.push("Marital status");
  if (household.dependentsCount.missing) missing.push("Dependents");
  if (household.state.missing) missing.push("State of residence");
  if (household.hasMortgage.missing) missing.push("Mortgage status");
  if (household.hasMortgage.value === true && household.mortgageBalance.missing) {
    missing.push("Mortgage balance");
  }
  if (financial.annualIncome.missing) missing.push("Annual income");
  if (insurance.policyCount.missing) missing.push("Number of policies");
  if (
    !goals.retirementPlanning.value &&
    !goals.estatePlanning.value &&
    !goals.maximizeCashValue.value &&
    !goals.preventLapse.value &&
    !goals.incomeReplacement.value
  ) {
    missing.push("Primary goals");
  }
  if (retirement.currentAge.missing) missing.push("Current age");
  return missing;
}

export function computeOverallConfidence(profile: UserProfile): number {
  const fields = [
    profile.household.maritalStatus.confidence,
    profile.household.dependentsCount.confidence,
    profile.household.state.confidence,
    profile.household.hasMortgage.confidence,
    profile.financial.annualIncome.confidence,
    profile.insurance.policyCount.confidence,
    profile.retirement.currentAge.confidence,
    Math.max(
      profile.goals.retirementPlanning.confidence,
      profile.goals.preventLapse.confidence,
      profile.goals.maximizeCashValue.confidence,
      profile.goals.estatePlanning.confidence,
      0,
    ),
  ];
  const avg = fields.reduce((a, b) => a + b, 0) / fields.length;
  return Math.round(avg * 100) / 100;
}

export function refreshProfileMeta(profile: UserProfile): UserProfile {
  const missingFields = computeMissingFields(
    profile.household,
    profile.financial,
    profile.insurance,
    profile.goals,
    profile.retirement,
  );
  return {
    ...profile,
    missingFields,
    overallConfidence: computeOverallConfidence(profile),
    updatedAt: new Date().toISOString(),
  };
}
