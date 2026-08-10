/**
 * Commercial report book for the homepage/demo carousel.
 * Built from Harbor Fab commercial seed + scoring/diligence engines —
 * not personal-line report-book.
 */

import { buildCommercialAccountWorkspace } from "@/lib/commercial-seed";
import { LOB_LABELS, type CommercialLine } from "@/lib/commercial-types";
import type {
  CarrierAppetiteMatch,
  CommercialAccountWorkspace,
  CoverageGap,
  DiligenceItem,
} from "@/lib/commercial-types";
import type { SignalStatus } from "@/lib/intelligence/report-book";

export type CommercialProvenance = "simulated" | "live";

/** Coverage rows shown on the peril heatmap (subset of program LOBs + BI). */
export const HEATMAP_COVERAGES = [
  { id: "commercial_property", label: "Property" },
  { id: "general_liability", label: "General liability" },
  { id: "business_income", label: "Business income" },
  { id: "builders_risk", label: "Builders risk" },
  { id: "umbrella", label: "Umbrella / excess" },
  { id: "commercial_auto", label: "Commercial auto" },
  { id: "crime", label: "Crime" },
  { id: "marine", label: "Inland marine" },
  { id: "cyber", label: "Cyber" },
  { id: "workers_compensation", label: "Workers' compensation" },
] as const;

/** Commercial perils — decision-support axes only (not a rating engine). */
export const HEATMAP_PERILS = [
  { id: "flood", label: "Flood" },
  { id: "wind_hail", label: "Wind / hail" },
  { id: "earthquake", label: "Earthquake" },
  { id: "named_storm", label: "Named storm" },
  { id: "fire", label: "Fire" },
  { id: "occurrence", label: "Occurrence" },
  { id: "theft", label: "Theft" },
  { id: "water", label: "Water damage" },
  { id: "auto_collision", label: "Auto collision" },
  { id: "cyber_event", label: "Cyber event" },
] as const;

export type HeatmapCoverageId = (typeof HEATMAP_COVERAGES)[number]["id"];
export type HeatmapPerilId = (typeof HEATMAP_PERILS)[number]["id"];

/** Which perils a coverage line typically addresses when on file. */
const COVERAGE_PERIL_MAP: Record<HeatmapCoverageId, HeatmapPerilId[]> = {
  commercial_property: [
    "flood",
    "wind_hail",
    "earthquake",
    "named_storm",
    "fire",
    "theft",
    "water",
  ],
  general_liability: ["occurrence"],
  business_income: ["flood", "wind_hail", "named_storm", "fire", "water"],
  builders_risk: ["wind_hail", "fire", "theft", "water"],
  umbrella: ["occurrence"],
  commercial_auto: ["auto_collision", "occurrence"],
  crime: ["theft"],
  marine: ["theft", "water", "fire"],
  cyber: ["cyber_event"],
  workers_compensation: ["occurrence"],
};

export type PerilCell = {
  coverageId: HeatmapCoverageId;
  perilId: HeatmapPerilId;
  status: SignalStatus;
  note: string;
};

export type CommercialCaseRow = {
  id: string;
  name: string;
  riskProfile: string;
  compliancePct: number | null;
  compliant: number;
  nonCompliant: number;
  missing: number;
  waived: number;
  totalRequirements: number;
};

export type CommercialPolicyRow = {
  id: string;
  name: string;
  line: CommercialLine;
  lineLabel: string;
  carrier: string;
  premium: number | null;
  limit: number | null;
  deductible: number | null;
  expiration: string | null;
  status: "in_force" | "expired" | "pending" | "cancelled" | "not_on_file";
  matchQuality: "very_strong" | "strong" | "relevant" | "directional" | "gap";
  daysToRenewal: number | null;
  underinsuredPressure: number;
};

export type CommercialReportBook = {
  provenance: CommercialProvenance;
  accountName: string;
  industry: string;
  headquarters: string;
  renewalDate: string | null;
  renewalWithinDays: number | null;
  totalPolicies: number;
  currentPremium: number | null;
  readinessScore: number;
  readinessLabel: string;
  avgRequirementScore: number;
  overallRiskScore: number;
  underinsuredScore: number;
  coverageAdequacyScore: number;
  gaps: CoverageGap[];
  diligence: DiligenceItem[];
  cases: CommercialCaseRow[];
  policies: CommercialPolicyRow[];
  appetite: CarrierAppetiteMatch[];
  perilCells: PerilCell[];
  generatedAt: string;
  disclaimer: string;
};

function lineOnFile(
  workspace: CommercialAccountWorkspace,
  coverageId: HeatmapCoverageId,
): boolean {
  if (coverageId === "business_income") {
    // BI is not a separate LOB in V1 — treat as present when property is on file.
    return workspace.account.policies.some((p) => p.line === "commercial_property");
  }
  if (coverageId === "umbrella") {
    return workspace.account.policies.some(
      (p) => p.line === "umbrella" || p.line === "excess",
    );
  }
  return workspace.account.policies.some((p) => p.line === coverageId);
}

function gapForCoverage(
  gaps: CoverageGap[],
  coverageId: HeatmapCoverageId,
): CoverageGap | undefined {
  if (coverageId === "business_income") {
    return gaps.find((g) => g.line === "commercial_property");
  }
  if (coverageId === "umbrella") {
    return gaps.find((g) => g.line === "umbrella" || g.line === "excess");
  }
  return gaps.find((g) => g.line === coverageId);
}

function buildPerilCells(workspace: CommercialAccountWorkspace): PerilCell[] {
  const gaps = workspace.riskSnapshot.gaps;
  const lossLines = new Set(
    workspace.account.lossHistory.map((l) => l.line as string),
  );
  const cells: PerilCell[] = [];

  for (const cov of HEATMAP_COVERAGES) {
    const onFile = lineOnFile(workspace, cov.id);
    const gap = gapForCoverage(gaps, cov.id);
    const relevant = new Set(COVERAGE_PERIL_MAP[cov.id]);

    for (const peril of HEATMAP_PERILS) {
      if (!relevant.has(peril.id)) {
        cells.push({
          coverageId: cov.id,
          perilId: peril.id,
          status: "na",
          note: `${cov.label} does not typically address ${peril.label} in this matrix.`,
        });
        continue;
      }

      if (!onFile) {
        cells.push({
          coverageId: cov.id,
          perilId: peril.id,
          status: gap ? (gap.severity === "high" ? "critical" : "attention") : "unknown",
          note: gap
            ? gap.rationale
            : `${cov.label} not on file for ${peril.label}.`,
        });
        continue;
      }

      let status: SignalStatus = "healthy";
      let note = `${cov.label} on file — ${peril.label} reviewed as in-force program signal.`;
      if (lossLines.has(cov.id === "business_income" ? "commercial_property" : cov.id)) {
        status = "monitor";
        note = `${cov.label} on file with recent loss history touching this line.`;
      }
      if (gap) {
        status = gap.severity === "high" ? "attention" : "monitor";
        note = gap.rationale;
      }
      cells.push({
        coverageId: cov.id,
        perilId: peril.id,
        status,
        note,
      });
    }
  }
  return cells;
}

function diligenceCounts(items: DiligenceItem[]) {
  let compliant = 0;
  let nonCompliant = 0;
  let missing = 0;
  let waived = 0;
  for (const item of items) {
    if (item.status === "resolved") compliant += 1;
    else if (item.status === "waived") waived += 1;
    else if (item.status === "open" || item.status === "in_progress") {
      if (item.severity === "critical" || item.severity === "high") missing += 1;
      else nonCompliant += 1;
    } else {
      missing += 1;
    }
  }
  const total = Math.max(1, items.length);
  const compliancePct = Math.round(
    ((compliant + waived) / total) * 100,
  );
  return { compliant, nonCompliant, missing, waived, total, compliancePct };
}

function buildCases(workspace: CommercialAccountWorkspace): CommercialCaseRow[] {
  const counts = diligenceCounts(workspace.account.diligenceItems);
  const industry = workspace.account.industry;
  const cases: CommercialCaseRow[] = [
    {
      id: workspace.account.id,
      name: workspace.account.companyName,
      riskProfile: industry,
      compliancePct: counts.compliancePct,
      compliant: counts.compliant,
      nonCompliant: counts.nonCompliant,
      missing: counts.missing,
      waived: counts.waived,
      totalRequirements: counts.total,
    },
  ];

  for (const loc of workspace.account.locations) {
    // Locations share account diligence; slight deterministic adjustment by size.
    const adj = Math.min(8, Math.round((loc.squareFootage ?? 0) / 10_000));
    const pct = Math.max(0, Math.min(100, counts.compliancePct - (8 - adj)));
    cases.push({
      id: loc.id,
      name: loc.label,
      riskProfile: `${loc.city}, ${loc.state}`,
      compliancePct: pct,
      compliant: counts.compliant,
      nonCompliant: counts.nonCompliant,
      missing: counts.missing,
      waived: counts.waived,
      totalRequirements: counts.total,
    });
  }
  return cases;
}

function matchQualityForPolicy(
  workspace: CommercialAccountWorkspace,
  line: CommercialLine,
): CommercialPolicyRow["matchQuality"] {
  const gap = workspace.riskSnapshot.gaps.find((g) => g.line === line);
  if (gap?.severity === "high") return "gap";
  if (gap) return "relevant";
  const appetite = workspace.riskSnapshot.appetiteMatches[0];
  if (appetite?.appetiteFit === "strong") return "very_strong";
  if (appetite?.appetiteFit === "moderate") {
    return line === "general_liability" || line === "commercial_property"
      ? "very_strong"
      : "strong";
  }
  if (appetite?.appetiteFit === "limited") return "relevant";
  return "directional";
}

function buildPolicies(workspace: CommercialAccountWorkspace): CommercialPolicyRow[] {
  const renewalDays = workspace.riskSnapshot.business.renewalWithinDays ?? null;
  const underinsured = workspace.riskSnapshot.scores.underinsuredScore;

  const fromPolicies: CommercialPolicyRow[] = workspace.account.policies.map(
    (p) => ({
      id: p.id,
      name: p.productName.value ?? LOB_LABELS[p.line],
      line: p.line,
      lineLabel: LOB_LABELS[p.line],
      carrier: p.carrier.value ?? "Unknown carrier",
      premium: p.premium.value,
      limit: p.limit.value,
      deductible: p.deductible.value,
      expiration: p.expirationDate.value,
      status: p.status ?? "pending",
      matchQuality: matchQualityForPolicy(workspace, p.line),
      daysToRenewal: renewalDays,
      underinsuredPressure: underinsured,
    }),
  );

  // Include gap lines as missing policy rows for pricing / at-risk views.
  const missing = workspace.riskSnapshot.gaps
    .filter((g) => !workspace.account.policies.some((p) => p.line === g.line))
    .map((g) => ({
      id: g.id,
      name: `${LOB_LABELS[g.line]} (not on file)`,
      line: g.line,
      lineLabel: LOB_LABELS[g.line],
      carrier: "—",
      premium: null,
      limit: null,
      deductible: null,
      expiration: workspace.account.renewalDate,
      status: "not_on_file" as const,
      matchQuality: "gap" as const,
      daysToRenewal: renewalDays,
      underinsuredPressure: underinsured,
    }));

  return [...fromPolicies, ...missing];
}

export function buildCommercialReportBook(opts?: {
  workspace?: CommercialAccountWorkspace | null;
  provenance?: CommercialProvenance;
}): CommercialReportBook {
  const workspace =
    opts?.workspace ?? buildCommercialAccountWorkspace("user_guest");
  const provenance = opts?.provenance ?? "simulated";
  const diligence = workspace.account.diligenceItems;
  const counts = diligenceCounts(diligence);

  return {
    provenance,
    accountName: workspace.account.companyName,
    industry: workspace.account.industry,
    headquarters: workspace.account.headquarters,
    renewalDate: workspace.account.renewalDate,
    renewalWithinDays: workspace.riskSnapshot.business.renewalWithinDays,
    totalPolicies: workspace.account.policies.length,
    currentPremium: workspace.account.currentPremium,
    readinessScore: workspace.account.readiness.score,
    readinessLabel: workspace.account.readiness.label,
    avgRequirementScore: counts.compliancePct,
    overallRiskScore: workspace.riskSnapshot.scores.overallRiskScore,
    underinsuredScore: workspace.riskSnapshot.scores.underinsuredScore,
    coverageAdequacyScore: workspace.riskSnapshot.scores.coverageAdequacyScore,
    gaps: workspace.riskSnapshot.gaps,
    diligence,
    cases: buildCases(workspace),
    policies: buildPolicies(workspace),
    appetite: workspace.riskSnapshot.appetiteMatches,
    perilCells: buildPerilCells(workspace),
    generatedAt: new Date().toISOString(),
    disclaimer:
      "Commercial simulations are decision-support only. Not underwriting, binding, or a guarantee of coverage.",
  };
}

export function formatMoney(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

export function cellAt(
  book: CommercialReportBook,
  coverageId: HeatmapCoverageId,
  perilId: HeatmapPerilId,
): PerilCell | undefined {
  return book.perilCells.find(
    (c) => c.coverageId === coverageId && c.perilId === perilId,
  );
}
