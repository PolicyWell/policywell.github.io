import type {
  AccountReadinessScore,
  CommercialAccount,
  CommercialDocClassification,
  CommercialDocument,
  DiligenceItem,
} from "./commercial-types";

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function hasClass(
  docs: CommercialDocument[],
  classification: CommercialDocClassification,
) {
  return docs.some((d) => d.classification === classification);
}

/**
 * Generate missing-information diligence items.
 * Readiness measures completeness for broker review / submission — NOT underwriting.
 */
export function generateDiligenceItems(
  account: Pick<
    CommercialAccount,
    | "id"
    | "documents"
    | "policies"
    | "employeeCount"
    | "locations"
    | "annualRevenue"
    | "lossHistory"
    | "coverages"
  >,
  existing: DiligenceItem[] = [],
): DiligenceItem[] {
  const now = new Date().toISOString();
  const docs = account.documents;
  const openKeys = new Set(
    existing
      .filter((i) => i.status === "open" || i.status === "in_progress")
      .map((i) => i.title),
  );
  const resolvedKeys = new Set(
    existing
      .filter((i) => i.status === "resolved" || i.status === "waived")
      .map((i) => i.title),
  );

  const candidates: Omit<
    DiligenceItem,
    "id" | "createdAt" | "updatedAt" | "assignedUserId" | "assignedUserName" | "dueDate" | "resolutionNotes" | "status"
  >[] = [];

  if (!hasClass(docs, "loss_run")) {
    candidates.push({
      accountId: account.id,
      title: "Missing loss runs",
      description:
        "No loss-run documents on file. Markets typically require 3–5 years of loss history before submission.",
      severity: "critical",
      category: "loss_runs",
      source: "diligence_engine",
    });
  }

  if (!hasClass(docs, "statement_of_values")) {
    candidates.push({
      accountId: account.id,
      title: "Outdated or missing statement of values",
      description:
        "Property program review needs a current statement of values (SOV) to validate TIV and locations.",
      severity: "high",
      category: "statement_of_values",
      source: "diligence_engine",
    });
  }

  if (!hasClass(docs, "cyber_questionnaire")) {
    candidates.push({
      accountId: account.id,
      title: "Incomplete cyber questionnaire",
      description:
        "Cyber questionnaire not uploaded. Required before marketing cyber or package cyber endorsements.",
      severity: "medium",
      category: "questionnaire",
      source: "diligence_engine",
    });
  }

  if (!hasClass(docs, "environmental_questionnaire")) {
    candidates.push({
      accountId: account.id,
      title: "Incomplete environmental questionnaire",
      description:
        "Environmental questionnaire not on file for operations that may need pollution / environmental review.",
      severity: "low",
      category: "questionnaire",
      source: "diligence_engine",
    });
  }

  const hasVehicleSchedule = hasClass(docs, "vehicle_schedule");
  const hasAuto = account.coverages.some(
    (c) => c.line === "commercial_auto" && c.status !== "not_on_file",
  );
  if (hasAuto && !hasVehicleSchedule) {
    candidates.push({
      accountId: account.id,
      title: "Missing vehicle schedule",
      description:
        "Commercial auto is on the program but no vehicle schedule was uploaded.",
      severity: "high",
      category: "schedule",
      source: "diligence_engine",
    });
  }

  if (!hasClass(docs, "property_schedule") && account.locations.length > 1) {
    candidates.push({
      accountId: account.id,
      title: "Missing property schedule",
      description:
        "Multiple locations on file without a property schedule to reconcile building / contents values.",
      severity: "high",
      category: "schedule",
      source: "diligence_engine",
    });
  }

  if (!hasClass(docs, "financial_statement")) {
    candidates.push({
      accountId: account.id,
      title: "Incomplete financials",
      description:
        "No financial statement on file. Revenue / financial support is often required for larger or specialty placements.",
      severity: "medium",
      category: "financials",
      source: "diligence_engine",
    });
  }

  if (!hasClass(docs, "application")) {
    candidates.push({
      accountId: account.id,
      title: "Missing application",
      description:
        "No commercial application on file for submission packaging.",
      severity: "high",
      category: "application",
      source: "diligence_engine",
    });
  }

  if (
    (account.employeeCount ?? 0) > 0 &&
    !account.coverages.some(
      (c) => c.line === "workers_compensation" && c.status !== "not_on_file",
    )
  ) {
    candidates.push({
      accountId: account.id,
      title: "Workers' compensation policy not evidenced",
      description:
        "Employee count is present without a workers' compensation policy in the aggregated program.",
      severity: "critical",
      category: "policy",
      source: "diligence_engine",
    });
  }

  const next: DiligenceItem[] = [...existing];
  for (const c of candidates) {
    if (resolvedKeys.has(c.title) || openKeys.has(c.title)) continue;
    next.push({
      ...c,
      id: uid("dil"),
      status: "open",
      assignedUserId: null,
      assignedUserName: null,
      dueDate: null,
      resolutionNotes: null,
      createdAt: now,
      updatedAt: now,
    });
  }
  return next;
}

export function computeAccountReadiness(
  diligenceItems: DiligenceItem[],
): AccountReadinessScore {
  const open = diligenceItems.filter(
    (i) => i.status === "open" || i.status === "in_progress" || i.status === "blocked",
  );
  const missingCritical = open.filter((i) => i.severity === "critical").length;
  const missingHigh = open.filter((i) => i.severity === "high").length;
  const missingMedium = open.filter((i) => i.severity === "medium").length;
  const missingLow = open.filter((i) => i.severity === "low").length;

  // Start at 100; subtract weighted gaps. Completeness only — not underwriting.
  let score = 100;
  score -= missingCritical * 22;
  score -= missingHigh * 12;
  score -= missingMedium * 6;
  score -= missingLow * 2;
  score = Math.max(0, Math.min(100, Math.round(score)));

  let label: AccountReadinessScore["label"] = "ready_for_review";
  if (score < 40 || missingCritical > 0) label = "not_ready";
  else if (score < 65) label = "needs_work";
  else if (score < 85 || missingHigh > 0) label = "nearly_ready";

  const explanations = [
    `${open.length} open diligence item(s)`,
    `${missingCritical} critical · ${missingHigh} high · ${missingMedium} medium · ${missingLow} low`,
    "Score reflects information completeness for broker review and potential submission only.",
  ];

  return {
    score,
    maxScore: 100,
    label,
    missingCritical,
    missingHigh,
    openItems: open.length,
    explanations,
    disclaimer:
      "Account Readiness is not an underwriting score, risk rating, or eligibility determination.",
  };
}

export function updateDiligenceItem(
  items: DiligenceItem[],
  id: string,
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
): DiligenceItem[] {
  const now = new Date().toISOString();
  return items.map((item) =>
    item.id === id ? { ...item, ...patch, updatedAt: now } : item,
  );
}
