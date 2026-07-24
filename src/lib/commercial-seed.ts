import { field } from "./profile";
import type {
  BusinessProfile,
  CommercialWorkspaceSnapshot,
} from "./commercial-types";
import {
  buildMitigations,
  buildUnderwritingPreview,
  computeCommercialRiskScores,
  detectCoverageGaps,
  matchCarrierAppetite,
} from "./commercial-scoring";

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
        limit: field(1_000_000, 0.9, "demo_seed"),
        deductible: field(2500, 0.8, "demo_seed"),
        premium: field(18_400, 0.8, "demo_seed"),
        effectiveDate: field("2025-09-01", 0.9, "demo_seed"),
        expirationDate: field("2026-09-01", 0.9, "demo_seed"),
        documentId: "doc_gl_demo",
      },
      {
        id: "cpol_prop",
        line: "commercial_property",
        carrier: field("Harbor Mutual", 0.88, "demo_seed"),
        productName: field("Commercial Property", 0.85, "demo_seed"),
        limit: field(3_500_000, 0.85, "demo_seed"),
        deductible: field(5000, 0.8, "demo_seed"),
        premium: field(22_100, 0.8, "demo_seed"),
        effectiveDate: field("2025-09-01", 0.9, "demo_seed"),
        expirationDate: field("2026-09-01", 0.9, "demo_seed"),
        documentId: "doc_prop_demo",
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
