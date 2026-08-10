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

/** Commercial lines — V1 program aggregation LOBs. */
export const COMMERCIAL_LINES = [
  "commercial_property",
  "general_liability",
  "workers_compensation",
  "commercial_auto",
  "umbrella",
  "excess",
  "cyber",
  "d_and_o",
  "e_and_o",
  "crime",
  "fiduciary",
  "environmental",
  "marine",
  "builders_risk",
  "professional_liability",
  "specialty",
  // Legacy aliases retained for Harbor Fab / scoring compatibility
  "epli",
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
  commercial_property: "Property",
  general_liability: "General liability",
  workers_compensation: "Workers' compensation",
  commercial_auto: "Commercial auto",
  umbrella: "Umbrella",
  excess: "Excess",
  cyber: "Cyber",
  d_and_o: "D&O",
  e_and_o: "E&O",
  crime: "Crime",
  fiduciary: "Fiduciary",
  environmental: "Environmental",
  marine: "Marine",
  builders_risk: "Builders risk",
  professional_liability: "Professional liability",
  specialty: "Specialty",
  epli: "EPLI",
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

/** Upload classification for Commercial V1 (broker-facing labels). */
export const COMMERCIAL_DOC_CLASSIFICATIONS = [
  "policy",
  "loss_run",
  "financial_statement",
  "statement_of_values",
  "application",
  "vehicle_schedule",
  "property_schedule",
  "claims_document",
  "contract",
  "cyber_questionnaire",
  "environmental_questionnaire",
  "other",
] as const;

export type CommercialDocClassification =
  (typeof COMMERCIAL_DOC_CLASSIFICATIONS)[number];

export const COMMERCIAL_DOC_LABELS: Record<CommercialDocClassification, string> =
  {
    policy: "Policy",
    loss_run: "Loss Run",
    financial_statement: "Financial Statement",
    statement_of_values: "Statement of Values",
    application: "Application",
    vehicle_schedule: "Vehicle Schedule",
    property_schedule: "Property Schedule",
    claims_document: "Claims Document",
    contract: "Contract",
    cyber_questionnaire: "Cyber Questionnaire",
    environmental_questionnaire: "Environmental Questionnaire",
    other: "Other",
  };

/** @deprecated Prefer CommercialDocClassification — kept for upload/ingest compat. */
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
  | "financial_statement"
  | "contract"
  | "environmental_questionnaire"
  | "other_commercial";

/**
 * Material extracted values retain provenance.
 * Never invent missing values — leave value null and mark missing.
 */
export interface ProvenancedField<T> {
  value: T | null;
  confidence: number;
  sourceDocumentId: string | null;
  sourceDocumentName?: string | null;
  pageNumber: number | null;
  sourceExcerpt: string | null;
  missing?: boolean;
}

export type CommercialAccountStatus =
  | "prospect"
  | "diligence"
  | "submission_ready"
  | "in_market"
  | "quoted"
  | "bound"
  | "renewal"
  | "inactive";

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
  policyNumber?: FieldConfidence<string>;
  limit: FieldConfidence<number>;
  aggregateLimit?: FieldConfidence<number>;
  deductible: FieldConfidence<number>;
  premium: FieldConfidence<number>;
  effectiveDate: FieldConfidence<string>;
  expirationDate: FieldConfidence<string>;
  status?: "in_force" | "expired" | "pending" | "cancelled";
  documentId?: string;
}

/** Normalized coverage row for program aggregation. */
export interface AggregatedCoverage {
  id: string;
  line: CommercialLine;
  label: string;
  carrier: ProvenancedField<string>;
  policyNumber: ProvenancedField<string>;
  productName: ProvenancedField<string>;
  occurrenceLimit: ProvenancedField<number>;
  aggregateLimit: ProvenancedField<number>;
  deductible: ProvenancedField<number>;
  annualPremium: ProvenancedField<number>;
  effectiveDate: ProvenancedField<string>;
  expirationDate: ProvenancedField<string>;
  status: "in_force" | "expired" | "pending" | "cancelled" | "not_on_file";
  documentId: string | null;
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

export type DiligenceSeverity = "critical" | "high" | "medium" | "low";
export type DiligenceCategory =
  | "loss_runs"
  | "statement_of_values"
  | "questionnaire"
  | "schedule"
  | "financials"
  | "policy"
  | "application"
  | "other";
export type DiligenceStatus =
  | "open"
  | "in_progress"
  | "resolved"
  | "waived"
  | "blocked";

export interface DiligenceItem {
  id: string;
  accountId: string;
  title: string;
  description: string;
  severity: DiligenceSeverity;
  category: DiligenceCategory;
  status: DiligenceStatus;
  assignedUserId: string | null;
  assignedUserName: string | null;
  dueDate: string | null;
  source: string;
  resolutionNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Account readiness measures completeness of information for broker review
 * and potential submission. It is NOT an underwriting score.
 */
export interface AccountReadinessScore {
  score: number;
  maxScore: 100;
  label: "not_ready" | "needs_work" | "nearly_ready" | "ready_for_review";
  missingCritical: number;
  missingHigh: number;
  openItems: number;
  explanations: string[];
  disclaimer: string;
}

export interface LossRunDiscrepancy {
  id: string;
  title: string;
  description: string;
  status: "unresolved" | "resolved" | "waived";
  sourceDocumentId?: string;
}

export interface CommercialDocument {
  id: string;
  accountId: string;
  userId: string;
  filename: string;
  classification: CommercialDocClassification;
  mimeType: string;
  uploadedAt: string;
  /** Private-by-default; never public CDN. */
  storageVisibility: "private";
  storagePath: string | null;
  ocrText: string;
  overallConfidence: number;
  verified: boolean;
  pageCount: number | null;
  extractedFields: Record<string, ProvenancedField<string | number | boolean>>;
  searchableText: string;
  sourceChannel: "upload" | "email" | "seed";
}

export interface CommercialAccount {
  id: string;
  userId: string;
  companyName: string;
  industry: string;
  headquarters: string;
  annualRevenue: number | null;
  employeeCount: number | null;
  locations: BusinessLocation[];
  currentPremium: number | null;
  renewalDate: string | null;
  assignedProducer: string | null;
  accountManager: string | null;
  accountStatus: CommercialAccountStatus;
  lastUpdated: string;
  policies: CommercialPolicySummary[];
  coverages: AggregatedCoverage[];
  lossHistory: ClaimOrLossEvent[];
  lossRunDiscrepancies: LossRunDiscrepancy[];
  documents: CommercialDocument[];
  diligenceItems: DiligenceItem[];
  readiness: AccountReadinessScore;
  potentialCoverageIssues: string[];
  /** Provenanced account fields from structured extraction. */
  extracted: {
    companyName: ProvenancedField<string>;
    industry: ProvenancedField<string>;
    headquarters: ProvenancedField<string>;
    annualRevenue: ProvenancedField<number>;
    employeeCount: ProvenancedField<number>;
    currentPremium: ProvenancedField<number>;
    renewalDate: ProvenancedField<string>;
  };
  /** Bridge to legacy commercial risk engines. */
  businessProfileId: string;
}

export type CommercialWorkspaceTab =
  | "overview"
  | "documents"
  | "policies"
  | "exposures"
  | "losses"
  | "diligence"
  | "coverage"
  | "submission"
  | "markets"
  | "quotes"
  | "proposal"
  | "tasks"
  | "activity"
  | "renewal";

export const COMMERCIAL_WORKSPACE_TABS: {
  id: CommercialWorkspaceTab;
  label: string;
  v1: boolean;
}[] = [
  { id: "overview", label: "Overview", v1: true },
  { id: "documents", label: "Documents", v1: true },
  { id: "policies", label: "Policies", v1: true },
  { id: "exposures", label: "Exposures", v1: true },
  { id: "losses", label: "Losses", v1: true },
  { id: "diligence", label: "Diligence", v1: true },
  { id: "coverage", label: "Coverage", v1: true },
  { id: "submission", label: "Submission", v1: false },
  { id: "markets", label: "Markets", v1: false },
  { id: "quotes", label: "Quotes", v1: false },
  { id: "proposal", label: "Proposal", v1: false },
  { id: "tasks", label: "Tasks", v1: true },
  { id: "activity", label: "Activity", v1: true },
  { id: "renewal", label: "Renewal", v1: true },
];

export interface CommercialOverviewMetrics {
  existingPolicies: number;
  annualPremium: number | null;
  renewalDate: string | null;
  accountReadiness: AccountReadinessScore;
  missingDiligenceItems: number;
  potentialCoverageIssues: string[];
  unresolvedLossRunDiscrepancies: number;
}

/** Legacy BusinessProfile — still used by commercial-scoring / agent. */
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
  preliminaryRiskTier:
    | "preferred"
    | "standard"
    | "substandard"
    | "refer"
    | "decline_risk";
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

export interface CommercialAccountWorkspace {
  account: CommercialAccount;
  overview: CommercialOverviewMetrics;
  riskSnapshot: CommercialWorkspaceSnapshot;
  activity: { id: string; at: string; label: string }[];
}
