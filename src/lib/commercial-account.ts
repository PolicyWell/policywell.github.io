import { buildOverviewMetrics } from "./commercial-account-overview";
import {
  computeAccountReadiness,
  generateDiligenceItems,
  updateDiligenceItem,
} from "./commercial-diligence";
import {
  ingestCommercialDocument,
  mergeExtractedIntoAccountFields,
} from "./commercial-extraction";
import {
  aggregateInsuranceProgram,
  sumProgramPremium,
} from "./commercial-policies";
import { field } from "./profile";
import type {
  BusinessProfile,
  CommercialAccount,
  CommercialAccountWorkspace,
  CommercialDocument,
  DiligenceItem,
} from "./commercial-types";
import {
  buildMitigations,
  buildUnderwritingPreview,
  computeCommercialRiskScores,
  detectCoverageGaps,
  matchCarrierAppetite,
} from "./commercial-scoring";

function accountToBusinessProfile(account: CommercialAccount): BusinessProfile {
  return {
    id: account.businessProfileId || account.id,
    userId: account.userId,
    legalName: account.companyName,
    industryDescription: field<string>(account.industry, 0.8, "account"),
    naics: field<string>(null, 0),
    sic: field<string>(null, 0),
    stateOfDomicile: field<string>(
      account.headquarters.split(",").pop()?.trim().slice(0, 2) ?? null,
      0.4,
      "account",
    ),
    yearEstablished: field<number>(null, 0),
    annualRevenue: field<number>(
      account.annualRevenue,
      account.annualRevenue != null ? 0.8 : 0,
    ),
    annualPayroll: field<number>(null, 0),
    employeeCount: field<number>(
      account.employeeCount,
      account.employeeCount != null ? 0.8 : 0,
    ),
    locations: account.locations,
    vehiclesCount: field<number>(
      account.documents.some((d) => d.classification === "vehicle_schedule")
        ? 1
        : null,
      0.3,
    ),
    hasCyberControls: field<boolean>(
      account.documents.some((d) => d.classification === "cyber_questionnaire")
        ? true
        : false,
      0.5,
    ),
    contractualExposureNotes: [],
    policies: account.policies,
    lossHistory: account.lossHistory,
    certificatesExpiringSoon: 0,
    renewalWithinDays: account.renewalDate
      ? Math.max(
          0,
          Math.round(
            (new Date(account.renewalDate).getTime() - Date.now()) /
              (1000 * 60 * 60 * 24),
          ),
        )
      : null,
    overallConfidence: account.readiness.score / 100,
    missingFields: account.diligenceItems
      .filter((i) => i.status === "open")
      .map((i) => i.title),
    updatedAt: account.lastUpdated,
  };
}

export function refreshAccountDerivedState(
  account: CommercialAccount,
): CommercialAccount {
  const coverages = aggregateInsuranceProgram(account.policies);
  const withCoverages = { ...account, coverages };
  const diligenceItems = generateDiligenceItems(
    withCoverages,
    account.diligenceItems,
  );
  const readiness = computeAccountReadiness(diligenceItems);
  const business = accountToBusinessProfile({
    ...withCoverages,
    diligenceItems,
    readiness,
  });
  const gaps = detectCoverageGaps(business);
  const potentialCoverageIssues = gaps.map((g) => g.title);
  const programPremium = sumProgramPremium(coverages);

  return {
    ...withCoverages,
    coverages,
    diligenceItems,
    readiness,
    potentialCoverageIssues,
    currentPremium:
      account.extracted.currentPremium.value ??
      programPremium ??
      account.currentPremium,
    lastUpdated: new Date().toISOString(),
  };
}

export function attachDocumentToAccount(
  account: CommercialAccount,
  doc: CommercialDocument,
): CommercialAccount {
  const documents = [doc, ...account.documents.filter((d) => d.id !== doc.id)];
  const extracted = mergeExtractedIntoAccountFields(account.extracted, doc);

  const next: CommercialAccount = {
    ...account,
    documents,
    extracted,
    companyName: extracted.companyName.value ?? account.companyName,
    industry: extracted.industry.value ?? account.industry,
    headquarters: extracted.headquarters.value ?? account.headquarters,
    annualRevenue: extracted.annualRevenue.value ?? account.annualRevenue,
    employeeCount: extracted.employeeCount.value ?? account.employeeCount,
    currentPremium: extracted.currentPremium.value ?? account.currentPremium,
    renewalDate: extracted.renewalDate.value ?? account.renewalDate,
    lastUpdated: new Date().toISOString(),
  };
  return refreshAccountDerivedState(next);
}

export function uploadCommercialFiles(
  account: CommercialAccount,
  files: { filename: string; mimeType?: string; rawText?: string }[],
  userId: string,
): CommercialAccount {
  let next = account;
  for (const file of files) {
    const doc = ingestCommercialDocument({
      accountId: account.id,
      userId,
      filename: file.filename,
      mimeType: file.mimeType,
      rawText: file.rawText,
      sourceChannel: "upload",
    });
    next = attachDocumentToAccount(next, doc);
  }
  return next;
}

export function patchDiligenceOnAccount(
  account: CommercialAccount,
  itemId: string,
  patch: Partial<
    Pick<
      DiligenceItem,
      | "status"
      | "assignedUserId"
      | "assignedUserName"
      | "dueDate"
      | "resolutionNotes"
    >
  >,
): CommercialAccount {
  const diligenceItems = updateDiligenceItem(
    account.diligenceItems,
    itemId,
    patch,
  );
  return refreshAccountDerivedState({ ...account, diligenceItems });
}

export function buildAccountWorkspace(
  account: CommercialAccount,
): CommercialAccountWorkspace {
  const refreshed = refreshAccountDerivedState(account);
  const business = accountToBusinessProfile(refreshed);
  const scores = computeCommercialRiskScores(business);
  const gaps = detectCoverageGaps(business);
  const mitigations = buildMitigations(business, gaps);
  const appetiteMatches = matchCarrierAppetite(business, gaps);
  const underwritingPreview = buildUnderwritingPreview(business, scores, gaps);

  const activity = [
    {
      id: "act_account",
      at: refreshed.lastUpdated,
      label: `Account updated · ${refreshed.companyName}`,
    },
    ...refreshed.documents.slice(0, 8).map((d) => ({
      id: `act_${d.id}`,
      at: d.uploadedAt,
      label: `Document · ${d.filename} (${d.classification})`,
    })),
    ...refreshed.diligenceItems.slice(0, 8).map((i) => ({
      id: `act_${i.id}`,
      at: i.updatedAt,
      label: `Diligence · ${i.title} (${i.status})`,
    })),
  ].sort((a, b) => (a.at < b.at ? 1 : -1));

  return {
    account: refreshed,
    overview: buildOverviewMetrics(refreshed),
    riskSnapshot: {
      business,
      scores,
      gaps,
      mitigations,
      appetiteMatches,
      underwritingPreview,
    },
    activity,
  };
}

export { buildOverviewMetrics };
