/**
 * Sales & Renewals proposal presentation book for the homepage carousel.
 * Uses Harbor Fab commercial seed premiums where present; educational slides
 * explain benchmarking methodology without inventing market ROL.
 */

import { buildCommercialAccountWorkspace } from "@/lib/commercial-seed";
import {
  buildCommercialReportBook,
  formatMoney,
  type CommercialReportBook,
} from "@/lib/intelligence/commercial-report-book";

export type CohortLevel =
  | "very_strong"
  | "strong"
  | "relevant"
  | "directional"
  | "gap";

export type ProposalCellStatus =
  | "pass"
  | "fail"
  | "missing"
  | "waived"
  | "na";

export type PremiumShareRow = {
  id: string;
  name: string;
  premium: number;
  share: number;
  tone: `tone-${0 | 1 | 2 | 3 | 4}`;
};

export type CohortRow = {
  level: CohortLevel;
  label: string;
  filled: number;
  copy: string;
};

export type StatusCoverage = { id: string; label: string };
export type StatusPeril = { id: string; label: string };

export type StatusCell = {
  coverageId: string;
  perilId: string;
  status: ProposalCellStatus;
};

export type ProposalBook = {
  accountName: string;
  locationLine: string;
  premiumRows: PremiumShareRow[];
  totalPremium: number;
  cohort: CohortRow[];
  traditionalScore: number;
  proposedScore: number;
  statusCoverages: StatusCoverage[];
  statusPerils: StatusPeril[];
  statusCells: StatusCell[];
  provenance: CommercialReportBook["provenance"];
  generatedAt: string;
};

const SEGMENT_TONES = [
  "tone-0",
  "tone-1",
  "tone-2",
  "tone-3",
  "tone-4",
] as const;

const COHORT: CohortRow[] = [
  {
    level: "very_strong",
    label: "Very strong",
    filled: 4,
    copy: "Three or more characteristics held with the subject — the cohort is tight enough to price and argue with confidence.",
  },
  {
    level: "strong",
    label: "Strong",
    filled: 3,
    copy: "Two held with the subject. Useful for limit and deductible conversation; still label residual gap.",
  },
  {
    level: "relevant",
    label: "Relevant",
    filled: 2,
    copy: "One held with the subject. Directional for the proposal narrative, not a binding peer set.",
  },
  {
    level: "directional",
    label: "Directional",
    filled: 1,
    copy: "Matches the base risk profile alone. Shows the shape of market practice without claiming a peer set.",
  },
  {
    level: "gap",
    label: "Not benchmarked",
    filled: 0,
    copy: "No cohort exists for this line. The page stays silent rather than inventing a comparison.",
  },
];

/** Compact proposal matrix — editorial presentation, not a full rating grid. */
const STATUS_COVERAGES: StatusCoverage[] = [
  { id: "terrorism_liab", label: "Terrorism liability" },
  { id: "ordinance", label: "Ordinance or law" },
  { id: "gl", label: "General liability" },
  { id: "bi", label: "Business income" },
  { id: "physical", label: "Physical" },
];

const STATUS_PERILS: StatusPeril[] = [
  { id: "cat_terrorism", label: "Certified acts of terrorism" },
  { id: "wind_hail", label: "Wind hail" },
  { id: "animal", label: "Animal attacks" },
  { id: "abuse", label: "Abuse" },
  { id: "molestation", label: "Molestation liability" },
  { id: "cat_terrorism_prop", label: "Certified acts of terrorism property" },
  { id: "boiler", label: "Boiler & machinery" },
  { id: "assault", label: "Assault & battery" },
  { id: "noncat_terrorism", label: "Non-certified acts of terrorism" },
  { id: "noncat_terrorism_prop", label: "Non-certified acts of terrorism property" },
  { id: "firearms", label: "Firearms liability" },
];

/** Deterministic Harbor Fab proposal statuses for the presentation page. */
const STATUS_OVERRIDES: Record<string, ProposalCellStatus> = {
  "terrorism_liab|cat_terrorism": "fail",
  "gl|animal": "missing",
  "gl|abuse": "missing",
  "gl|molestation": "missing",
  "physical|wind_hail": "waived",
  "ordinance|boiler": "pass",
  "bi|wind_hail": "pass",
  "physical|boiler": "pass",
  "gl|assault": "fail",
  "terrorism_liab|noncat_terrorism": "fail",
  "physical|cat_terrorism_prop": "missing",
};

function buildStatusCells(): StatusCell[] {
  const cells: StatusCell[] = [];
  for (const peril of STATUS_PERILS) {
    for (const cov of STATUS_COVERAGES) {
      const key = `${cov.id}|${peril.id}`;
      cells.push({
        coverageId: cov.id,
        perilId: peril.id,
        status: STATUS_OVERRIDES[key] ?? "na",
      });
    }
  }
  return cells;
}

function buildPremiumRows(book: CommercialReportBook): {
  rows: PremiumShareRow[];
  total: number;
} {
  const source = book.policies.filter(
    (p) => p.premium != null && p.status !== "not_on_file",
  );
  const total =
    book.currentPremium ??
    source.reduce((sum, r) => sum + (r.premium ?? 0), 0);
  const rows = source.map((row, i) => ({
    id: row.id,
    name: row.name,
    premium: row.premium ?? 0,
    share: total > 0 ? (row.premium ?? 0) / total : 0,
    tone: SEGMENT_TONES[i % SEGMENT_TONES.length]!,
  }));
  return { rows, total };
}

export function buildProposalBook(): ProposalBook {
  const workspace = buildCommercialAccountWorkspace("user_guest");
  const book = buildCommercialReportBook({
    workspace,
    provenance: "simulated",
  });
  const { rows, total } = buildPremiumRows(book);
  const loc = workspace.account.locations[0];
  const locationLine = loc
    ? `${loc.address}, ${loc.city}, ${loc.state} ${loc.zip}`
    : book.headquarters;

  return {
    accountName: book.accountName,
    locationLine: locationLine || book.accountName,
    premiumRows: rows,
    totalPremium: total,
    cohort: COHORT,
    // Illustrative renewal scores for the methodology page — labeled simulated.
    traditionalScore: 50,
    proposedScore: 86,
    statusCoverages: STATUS_COVERAGES,
    statusPerils: STATUS_PERILS,
    statusCells: buildStatusCells(),
    provenance: book.provenance,
    generatedAt: book.generatedAt,
  };
}

export { formatMoney };

export function statusAt(
  book: ProposalBook,
  coverageId: string,
  perilId: string,
): ProposalCellStatus {
  return (
    book.statusCells.find(
      (c) => c.coverageId === coverageId && c.perilId === perilId,
    )?.status ?? "na"
  );
}
