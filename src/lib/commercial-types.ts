import type { FieldConfidence, ScoreExplanation } from "./types";

/** Personal lines already supported by PolicyWell. */
export const PERSONAL_LINES = [
  "life",
  "annuity",
  "disability",
  "long_term_care",
  "medicare",
  "health",
] as const;

/** Commercial lines added as modular LOB extensions. */
export const COMMERCIAL_LINES = [
  "general_liability",
  "workers_compensation",
  "commercial_property",
  "commercial_auto",
  "cyber",
  "professional_liability",
  "umbrella",
  "epli",
  "d_and_o",
] as const;

export type PersonalLine = (typeof PERSONAL_LINES)[number];
export type CommercialLine = (typeof COMMERCIAL_LINES)[number];
export type LineOfBusiness = PersonalLine | CommercialLine;

export const LOB_LABELS: Record<LineOfBusiness, string> = {
  life: "Life",
  annuity: "Annuities",
  disability: "Disability",
  long_term_care: "Long-term care",
  medicare: "Medicare",
  health: "Health",
  general_liability: "General liability",
  workers_compensation: "Workers' compensation",
  commercial_property: "Commercial property",
  commercial_auto: "Commercial auto",
  cyber: "Cyber",
  professional_liability: "Professional liability",
  umbrella: "Umbrella",
  epli: "EPLI",
  d_and_o: "D&O",
};

export type EntityKind =
  | "individual_household"
  | "business"
  | "producer_advisor"
  | "agency"
  | "mga_imo"
  | "carrier";

export type HumanReviewStatus =
  | "not_required"
  | "pending"
  | "approved"
  | "rejected"
  | "needs_more_info";

export type CommercialDocumentKind =
  | "commercial_policy"
  | "commercial_application"
  | "loss_run"
  | "certificate"
  | "schedule_of_values"
  | "payroll_report"
  | "vehicle_schedule"
  | "property_schedule"
  | "cyber_questionnaire"
  | "claims_document"
  | "other_commercial";

export interface BusinessLocation {
  id: string;
  label: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  employees?: number | null;
  squareFootage?: number | null;
}

export interface CommercialPolicySummary {
  id: string;
  line: CommercialLine;
  carrier: FieldConfidence<string>;
  productName: FieldConfidence<string>;
  limit: FieldConfidence<number>;
  deductible: FieldConfidence<number>;
  premium: FieldConfidence<number>;
  effectiveDate: FieldConfidence<string>;
  expirationDate: FieldConfidence<string>;
  documentId?: string;
}

export interface ClaimOrLossEvent {
  id: string;
  date: string;
  line: CommercialLine | "other";
  description: string;
  amount: number | null;
  status: "open" | "closed" | "reserved";
  sourceDocumentId?: string;
}

export interface BusinessProfile {
  id: string;
  userId: string;
  legalName: string;
  dba?: string;
  naics: FieldConfidence<string>;
  sic: FieldConfidence<string>;
  industryDescription: FieldConfidence<string>;
  stateOfDomicile: FieldConfidence<string>;
  yearEstablished: FieldConfidence<number>;
  annualRevenue: FieldConfidence<number>;
  annualPayroll: FieldConfidence<number>;
  employeeCount: FieldConfidence<number>;
  locations: BusinessLocation[];
  vehiclesCount: FieldConfidence<number>;
  hasCyberControls: FieldConfidence<boolean>;
  contractualExposureNotes: string[];
  policies: CommercialPolicySummary[];
  lossHistory: ClaimOrLossEvent[];
  certificatesExpiringSoon: number;
  renewalWithinDays: number | null;
  overallConfidence: number;
  missingFields: string[];
  updatedAt: string;
}

export interface CommercialRiskScores {
  overallRiskScore: number;
  coverageAdequacyScore: number;
  underinsuredScore: number;
  businessHealthScore: number;
  explanations: ScoreExplanation[];
  assumptions: string[];
  missingData: string[];
  confidence: number;
  supportingDocumentIds: string[];
  modelVersion: string;
  rulesVersion: string;
}

export interface CoverageGap {
  id: string;
  line: CommercialLine;
  severity: "high" | "medium" | "low";
  title: string;
  rationale: string;
  missingRequirements: string[];
  confidence: number;
}

export interface RiskMitigationRecommendation {
  id: string;
  title: string;
  summary: string;
  priority: "high" | "medium" | "low";
  humanReviewStatus: HumanReviewStatus;
  assumptions: string[];
  confidence: number;
}

export interface CarrierAppetiteMatch {
  id: string;
  carrier: string;
  productOrCoverage: string;
  appetiteFit: "strong" | "moderate" | "limited" | "unlikely";
  eligibilityNotes: string[];
  estimatedPremiumRange?: { low: number; high: number; currency: string } | null;
  financialStrength?: { rating: string; source: string; asOf: string } | null;
  requiredEvidence: string[];
  matchReasons: string[];
  nonFitReasons: string[];
  confidence: number;
  dataFreshness: string;
  humanReviewStatus: HumanReviewStatus;
}

export interface UnderwritingCasePreview {
  id: string;
  entityKind: "personal" | "commercial";
  status: "intake" | "evaluating" | "needs_evidence" | "ready_for_review";
  preliminaryRiskTier: "preferred" | "standard" | "substandard" | "refer" | "decline_risk";
  likelyPathway: string;
  missingRequirements: string[];
  additionalEvidenceNeeded: string[];
  eligibilityConcerns: string[];
  referralOrDeclineRisk: string[];
  carrierAppetiteFitIds: string[];
  confidence: number;
  humanReviewStatus: HumanReviewStatus;
  assumptions: string[];
  disclaimer: string;
}

export interface CommercialWorkspaceSnapshot {
  business: BusinessProfile;
  scores: CommercialRiskScores;
  gaps: CoverageGap[];
  mitigations: RiskMitigationRecommendation[];
  appetiteMatches: CarrierAppetiteMatch[];
  underwritingPreview: UnderwritingCasePreview;
}
