import {
  countPoliciesOnFile,
  sumProgramPremium,
} from "./commercial-policies";
import type {
  CommercialAccount,
  CommercialOverviewMetrics,
} from "./commercial-types";

export function buildOverviewMetrics(
  account: CommercialAccount,
): CommercialOverviewMetrics {
  return {
    existingPolicies: countPoliciesOnFile(account.coverages),
    annualPremium: account.currentPremium ?? sumProgramPremium(account.coverages),
    renewalDate: account.renewalDate,
    accountReadiness: account.readiness,
    missingDiligenceItems: account.diligenceItems.filter(
      (i) => i.status === "open" || i.status === "in_progress",
    ).length,
    potentialCoverageIssues: account.potentialCoverageIssues,
    unresolvedLossRunDiscrepancies: account.lossRunDiscrepancies.filter(
      (d) => d.status === "unresolved",
    ).length,
  };
}
