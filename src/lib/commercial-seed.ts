import { provenanced } from "./commercial-fields";
import {
  computeAccountReadiness,
  generateDiligenceItems,
} from "./commercial-diligence";
import { ingestCommercialDocument } from "./commercial-extraction";
import {
  aggregateInsuranceProgram,
  sumProgramPremium,
} from "./commercial-policies";
import { field } from "./profile";
import type {
  BusinessProfile,
  CommercialAccount,
  CommercialAccountWorkspace,
  CommercialWorkspaceSnapshot,
} from "./commercial-types";
import {
  buildMitigations,
  buildUnderwritingPreview,
  computeCommercialRiskScores,
  detectCoverageGaps,
  matchCarrierAppetite,
} from "./commercial-scoring";
import { buildOverviewMetrics } from "./commercial-account-overview";

/** Illustrative commercial demo: Harbor Fabrication LLC. */
export function buildCommercialDemoBusiness(
  userId = "user_guest",
): BusinessProfile {
  const now = new Date().toISOString();
  return {
    id: "biz_harbor_fab",
    userId,
    legalName: "Harbor Fabrication LLC",
    dba: "Harbor Fab",
    naics: field("332710", 0.9, "demo_seed"),
    sic: field("3599", 0.7, "demo_seed"),
    industryDescription: field(
      "Machine shop / metal fabrication",
      0.92,
      "demo_seed",
    ),
    stateOfDomicile: field("TX", 0.95, "demo_seed"),
    yearEstablished: field(2014, 0.9, "demo_seed"),
    annualRevenue: field(2_400_000, 0.85, "demo_seed"),
    annualPayroll: field(780_000, 0.88, "demo_seed"),
    employeeCount: field(28, 0.9, "demo_seed"),
    locations: [
      {
        id: "loc_hq",
        label: "Primary plant",
        address: "1400 Industrial Blvd",
        city: "Houston",
        state: "TX",
        zip: "77001",
        employees: 24,
        squareFootage: 42000,
      },
      {
        id: "loc_yard",
        label: "Storage yard",
        address: "88 Crane Way",
        city: "Pasadena",
        state: "TX",
        zip: "77506",
        employees: 4,
        squareFootage: 12000,
      },
    ],
    vehiclesCount: field(6, 0.8, "demo_seed"),
    hasCyberControls: field(false, 0.7, "demo_seed"),
    contractualExposureNotes: [
      "Additional insured requirements on several GC contracts",
      "Hold-harmless language in two vendor MSAs",
    ],
    policies: [
      {
        id: "cpol_gl",
        line: "general_liability",
        carrier: field("Harbor Mutual", 0.9, "demo_seed"),
        productName: field("Commercial GL", 0.85, "demo_seed"),
        policyNumber: field("HM-GL-2025-8841", 0.9, "demo_seed"),
        limit: field(1_000_000, 0.9, "demo_seed"),
        aggregateLimit: field(2_000_000, 0.85, "demo_seed"),
        deductible: field(2500, 0.8, "demo_seed"),
        premium: field(18_400, 0.8, "demo_seed"),
        effectiveDate: field("2025-09-01", 0.9, "demo_seed"),
        expirationDate: field("2026-09-01", 0.9, "demo_seed"),
        status: "in_force",
        documentId: "doc_gl_demo",
      },
      {
        id: "cpol_prop",
        line: "commercial_property",
        carrier: field("Harbor Mutual", 0.88, "demo_seed"),
        productName: field("Commercial Property", 0.85, "demo_seed"),
        policyNumber: field("HM-PROP-2025-2210", 0.88, "demo_seed"),
        limit: field(3_500_000, 0.85, "demo_seed"),
        aggregateLimit: field<number>(null, 0),
        deductible: field(5000, 0.8, "demo_seed"),
        premium: field(22_100, 0.8, "demo_seed"),
        effectiveDate: field("2025-09-01", 0.9, "demo_seed"),
        expirationDate: field("2026-09-01", 0.9, "demo_seed"),
        status: "in_force",
        documentId: "doc_prop_demo",
      },
      {
        id: "cpol_auto",
        line: "commercial_auto",
        carrier: field("Harbor Mutual", 0.84, "demo_seed"),
        productName: field("Business Auto", 0.8, "demo_seed"),
        policyNumber: field("HM-CA-2025-1102", 0.84, "demo_seed"),
        limit: field(1_000_000, 0.85, "demo_seed"),
        deductible: field(1000, 0.8, "demo_seed"),
        premium: field(11_200, 0.8, "demo_seed"),
        effectiveDate: field("2025-09-01", 0.9, "demo_seed"),
        expirationDate: field("2026-09-01", 0.9, "demo_seed"),
        status: "in_force",
        documentId: "doc_auto_demo",
      },
    ],
    lossHistory: [
      {
        id: "loss_1",
        date: "2024-03-12",
        line: "general_liability",
        description: "Customer property damage during install",
        amount: 18_500,
        status: "closed",
        sourceDocumentId: "doc_loss_runs",
      },
      {
        id: "loss_2",
        date: "2025-11-02",
        line: "commercial_auto",
        description: "Rear-end collision - delivery van",
        amount: 9_200,
        status: "closed",
        sourceDocumentId: "doc_loss_runs",
      },
    ],
    certificatesExpiringSoon: 3,
    renewalWithinDays: 48,
    overallConfidence: 0.78,
    missingFields: [
      "workers_compensation_policy",
      "cyber_questionnaire",
      "vehicle_schedule_verified",
    ],
    updatedAt: now,
  };
}

export function buildCommercialWorkspaceSnapshot(
  userId = "user_guest",
): CommercialWorkspaceSnapshot {
  const business = buildCommercialDemoBusiness(userId);
  const scores = computeCommercialRiskScores(business);
  const gaps = detectCoverageGaps(business);
  const mitigations = buildMitigations(business, gaps);
  const appetiteMatches = matchCarrierAppetite(business, gaps);
  const underwritingPreview = buildUnderwritingPreview(business, scores, gaps);
  return {
    business,
    scores,
    gaps,
    mitigations,
    appetiteMatches,
    underwritingPreview,
  };
}

/** Commercial Account Workspace seed (PolicyWell Commercial V1). */
export function buildCommercialDemoAccount(
  userId = "user_guest",
): CommercialAccount {
  const business = buildCommercialDemoBusiness(userId);
  const coverages = aggregateInsuranceProgram(business.policies);
  const premium = sumProgramPremium(coverages);

  const seedDocs = [
    ingestCommercialDocument({
      accountId: "acct_harbor_fab",
      userId,
      filename: "Harbor_GL_Policy_Declarations.pdf",
      classification: "policy",
      sourceChannel: "seed",
    }),
    ingestCommercialDocument({
      accountId: "acct_harbor_fab",
      userId,
      filename: "Harbor_Loss_Runs_5yr.pdf",
      classification: "loss_run",
      sourceChannel: "seed",
    }),
    ingestCommercialDocument({
      accountId: "acct_harbor_fab",
      userId,
      filename: "Harbor_Statement_of_Values.xlsx",
      classification: "statement_of_values",
      sourceChannel: "seed",
    }),
  ];

  // Intentionally omit WC, vehicle schedule, cyber questionnaire, financials, application
  // so diligence engine surfaces missing items for the demo.
  const base: CommercialAccount = {
    id: "acct_harbor_fab",
    userId,
    companyName: business.legalName,
    industry: business.industryDescription.value ?? "Commercial",
    headquarters: "1400 Industrial Blvd, Houston, TX 77001",
    annualRevenue: business.annualRevenue.value,
    employeeCount: business.employeeCount.value,
    locations: business.locations,
    currentPremium: premium,
    renewalDate: "2026-09-01",
    assignedProducer: "Jordan Lee",
    accountManager: "Sam Rivera",
    accountStatus: "diligence",
    lastUpdated: business.updatedAt,
    policies: business.policies,
    coverages,
    lossHistory: business.lossHistory,
    lossRunDiscrepancies: [
      {
        id: "lrd_1",
        title: "Auto claim amount mismatch",
        description:
          "Loss run shows $9,200 closed auto claim; prior carrier bordereau listed $9,850 reserved. Needs reconciliation before submission.",
        status: "unresolved",
        sourceDocumentId: seedDocs[1]?.id,
      },
    ],
    documents: seedDocs,
    diligenceItems: [],
    readiness: {
      score: 0,
      maxScore: 100,
      label: "not_ready",
      missingCritical: 0,
      missingHigh: 0,
      openItems: 0,
      explanations: [],
      disclaimer:
        "Account Readiness is not an underwriting score, risk rating, or eligibility determination.",
    },
    potentialCoverageIssues: detectCoverageGaps(business).map((g) => g.title),
    extracted: {
      companyName: provenanced(business.legalName, {
        confidence: 0.95,
        sourceDocumentId: seedDocs[0]?.id ?? null,
        sourceDocumentName: seedDocs[0]?.filename,
        pageNumber: 1,
        sourceExcerpt: "Named Insured: Harbor Fabrication LLC",
      }),
      industry: provenanced(business.industryDescription.value, {
        confidence: 0.92,
        sourceDocumentId: seedDocs[0]?.id ?? null,
        sourceDocumentName: seedDocs[0]?.filename,
        pageNumber: 1,
        sourceExcerpt: "Industry: Machine shop / metal fabrication",
      }),
      headquarters: provenanced("1400 Industrial Blvd, Houston, TX 77001", {
        confidence: 0.9,
        sourceDocumentId: seedDocs[0]?.id ?? null,
        sourceDocumentName: seedDocs[0]?.filename,
        pageNumber: 1,
        sourceExcerpt: "Headquarters: 1400 Industrial Blvd, Houston, TX 77001",
      }),
      annualRevenue: provenanced(business.annualRevenue.value, {
        confidence: 0.85,
        sourceDocumentId: seedDocs[0]?.id ?? null,
        sourceDocumentName: seedDocs[0]?.filename,
        pageNumber: 1,
        sourceExcerpt: "Annual Revenue: $2,400,000",
      }),
      employeeCount: provenanced(business.employeeCount.value, {
        confidence: 0.9,
        sourceDocumentId: seedDocs[0]?.id ?? null,
        sourceDocumentName: seedDocs[0]?.filename,
        pageNumber: 1,
        sourceExcerpt: "Employees: 28",
      }),
      currentPremium: provenanced(premium, {
        confidence: 0.8,
        sourceDocumentId: seedDocs[0]?.id ?? null,
        sourceDocumentName: seedDocs[0]?.filename,
        pageNumber: 1,
        sourceExcerpt: "Annual Premium: $18,400",
      }),
      renewalDate: provenanced("2026-09-01", {
        confidence: 0.9,
        sourceDocumentId: seedDocs[0]?.id ?? null,
        sourceDocumentName: seedDocs[0]?.filename,
        pageNumber: 1,
        sourceExcerpt: "Expiration Date: 2026-09-01",
      }),
    },
    businessProfileId: business.id,
  };

  const diligenceItems = generateDiligenceItems(base, []);
  const readiness = computeAccountReadiness(diligenceItems);
  return { ...base, diligenceItems, readiness };
}

export function buildCommercialAccountWorkspace(
  userId = "user_guest",
): CommercialAccountWorkspace {
  const account = buildCommercialDemoAccount(userId);
  const riskSnapshot = buildCommercialWorkspaceSnapshot(userId);
  const activity = [
    {
      id: "act_seed",
      at: account.lastUpdated,
      label: "Loaded Harbor Fabrication commercial demo account",
    },
    ...account.documents.map((d) => ({
      id: `act_${d.id}`,
      at: d.uploadedAt,
      label: `Seed document · ${d.filename}`,
    })),
  ];
  return {
    account,
    overview: buildOverviewMetrics(account),
    riskSnapshot,
    activity,
  };
}
