export type UserRole =
  | "policyholder"
  | "advisor"
  | "imo"
  | "carrier"
  | "broker_dealer";

export type ConfidenceLevel = "high" | "medium" | "low";

export interface FieldConfidence<T> {
  value: T | null;
  confidence: number; // 0–1
  source?: string;
  missing?: boolean;
}

export interface HouseholdMember {
  id: string;
  name: string;
  relationship: "self" | "spouse" | "child" | "dependent" | "other";
  age?: number | null;
}

export interface HouseholdProfile {
  maritalStatus: FieldConfidence<"single" | "married" | "partnered" | "divorced" | "widowed">;
  members: HouseholdMember[];
  dependentsCount: FieldConfidence<number>;
  state: FieldConfidence<string>;
  ownsBusiness: FieldConfidence<boolean>;
  hasMortgage: FieldConfidence<boolean>;
  mortgageBalance: FieldConfidence<number>;
}

export interface FinancialProfile {
  annualIncome: FieldConfidence<number>;
  liquidAssets: FieldConfidence<number>;
  debtTotal: FieldConfidence<number>;
  emergencyFundMonths: FieldConfidence<number>;
}

export interface InsurancePolicySummary {
  id: string;
  carrier: FieldConfidence<string>;
  productName: FieldConfidence<string>;
  productType: FieldConfidence<string>;
  faceAmount: FieldConfidence<number>;
  cashValue: FieldConfidence<number>;
  targetPremium: FieldConfidence<number>;
  currentPremium: FieldConfidence<number>;
  deathBenefit: FieldConfidence<number>;
  issueAge: FieldConfidence<number>;
  loans: FieldConfidence<number>;
  riders: FieldConfidence<string[]>;
  documentId?: string;
}

export interface InsuranceProfile {
  policyCount: FieldConfidence<number>;
  policies: InsurancePolicySummary[];
  worriedAboutLapse: FieldConfidence<boolean>;
}

export interface GoalsProfile {
  retirementPlanning: FieldConfidence<boolean>;
  estatePlanning: FieldConfidence<boolean>;
  maximizeCashValue: FieldConfidence<boolean>;
  preventLapse: FieldConfidence<boolean>;
  incomeReplacement: FieldConfidence<boolean>;
  notes: string[];
}

export interface RiskProfile {
  riskTolerance: FieldConfidence<"conservative" | "moderate" | "aggressive">;
  primaryConcerns: string[];
}

export interface RetirementProfile {
  targetRetirementAge: FieldConfidence<number>;
  currentAge: FieldConfidence<number>;
  retirementIncomeGoal: FieldConfidence<number>;
}

export interface CarrierProfile {
  primaryCarrier: FieldConfidence<string>;
  carriers: string[];
}

export interface AdvisorProfile {
  hasAdvisor: FieldConfidence<boolean>;
  advisorName: FieldConfidence<string>;
  imoName: FieldConfidence<string>;
}

export interface UserProfile {
  id: string;
  userId: string;
  role: UserRole;
  displayName: string;
  email: string;
  household: HouseholdProfile;
  financial: FinancialProfile;
  insurance: InsuranceProfile;
  goals: GoalsProfile;
  risk: RiskProfile;
  retirement: RetirementProfile;
  carrier: CarrierProfile;
  advisor: AdvisorProfile;
  overallConfidence: number;
  missingFields: string[];
  onboardingComplete: boolean;
  updatedAt: string;
}

export type DocumentKind =
  | "policy"
  | "illustration"
  | "annual_statement"
  | "in_force_ledger"
  | "carrier_quote"
  | "1035_form"
  | "other";

export interface ExtractedPolicyData {
  carrier: FieldConfidence<string>;
  productName: FieldConfidence<string>;
  productType: FieldConfidence<string>;
  issueAge: FieldConfidence<number>;
  faceAmount: FieldConfidence<number>;
  cashValue: FieldConfidence<number>;
  targetPremium: FieldConfidence<number>;
  currentPremium: FieldConfidence<number>;
  deathBenefit: FieldConfidence<number>;
  coi: FieldConfidence<number>;
  loans: FieldConfidence<number>;
  riders: FieldConfidence<string[]>;
  assumptions: string[];
}

export interface IngestedDocument {
  id: string;
  userId: string;
  filename: string;
  kind: DocumentKind;
  mimeType: string;
  uploadedAt: string;
  ocrText: string;
  extraction: ExtractedPolicyData;
  overallConfidence: number;
  verified: boolean;
  searchableText: string;
}

export interface PolicyWellScores {
  protectionScore: number;
  retirementScore: number;
  mortgageScore: number;
  incomeReplacementScore: number;
  beneficiaryScore: number;
  policyHealthScore: number;
  reviewPriorityScore: number;
  overallIntelligenceScore: number;
  explanations: ScoreExplanation[];
  assumptions: string[];
}

export interface ScoreExplanation {
  scoreKey: keyof Omit<PolicyWellScores, "explanations" | "assumptions">;
  label: string;
  value: number;
  rationale: string;
  inputs: string[];
}

export type FeedbackKind = "accurate" | "needs_correction" | "not_helpful";

export interface FeedbackEntry {
  id: string;
  userId: string;
  recommendationId: string;
  kind: FeedbackKind;
  correction?: string;
  createdAt: string;
}

export interface AnalysisEvent {
  id: string;
  at: string;
  title: string;
  detail: string;
  confidence?: number;
}

export interface AgentReport {
  clientSummary: string;
  advisorSummary: string;
  questions: string[];
  warnings: string[];
  recommendedFollowUp: string[];
  generatedAt: string;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface OnboardingMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  at: string;
}

export interface OnboardingState {
  messages: OnboardingMessage[];
  profile: UserProfile;
  complete: boolean;
}
