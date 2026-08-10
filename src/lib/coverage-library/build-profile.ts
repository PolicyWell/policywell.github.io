import type {
  CoverageProfile,
  CoverageRequirement,
  CoverageTowerLine,
  RequirementGroup,
  RequirementKind,
} from "./types";

export type ProfileSeed = {
  slug: string;
  name: string;
  industry: string;
  assetTypes: string[];
  completionScore: number;
  summary: string;
  focusLines: string[];
  advisoryTitle?: string;
  advisoryLead: string;
  advisoryPoints: string[];
  exclusions?: string[];
  whoRequires?: string[];
  faqs?: { question: string; answer: string }[];
  relatedSlugs?: string[];
};

const PROPERTY_PERILS = [
  "Overall",
  "Flood",
  "Wind Hail",
  "Named Storm",
  "Earthquake",
  "Fire",
  "Water Damage",
] as const;

const LIABILITY_PERILS = [
  "Overall",
  "Occurrence",
  "Products",
  "Hired & Non-Owned Auto",
] as const;

function slugId(parts: string[]): string {
  return parts
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function limitFor(line: string, peril: string): string {
  if (line === "Professional Liability") {
    return peril === "Overall" ? "$2M–$5M" : "$1M";
  }
  if (line === "Umbrella / Excess") return "$5M";
  if (line === "Cyber") return "$1M";
  if (line === "Workers' Compensation") return "Statutory";
  if (line === "Business Income") {
    return peril === "Overall" ? "12 months ALS" : "≥ Business income amount";
  }
  if (line === "Property" || line === "Builders Risk") {
    return peril === "Overall"
      ? "≥ RCV / insurable value"
      : "≥ RCV / insurable value";
  }
  if (line === "General Liability") {
    return peril === "Overall" ? "$1M / $2M" : "$1M";
  }
  if (line === "Commercial Auto") return "$1M CSL";
  if (line === "Crime") return "$100K";
  if (line === "Inland Marine") return "Scheduled values";
  return "Per policy";
}

function groupFor(line: string): RequirementGroup {
  if (
    line === "Property" ||
    line === "Business Income" ||
    line === "Builders Risk" ||
    line === "Inland Marine" ||
    line === "Crime"
  ) {
    return "Property";
  }
  return "Liability";
}

function buildTower(focusLines: string[]): CoverageTowerLine[] {
  return focusLines.map((coverage) => {
    const group = groupFor(coverage);
    const perils =
      group === "Property"
        ? PROPERTY_PERILS.slice(0, coverage === "Crime" ? 3 : 6)
        : LIABILITY_PERILS.slice(
            0,
            coverage === "Professional Liability" || coverage === "Cyber"
              ? 2
              : 4,
          );
    return {
      coverage,
      group,
      perils: perils.map((peril) => ({
        peril,
        limit: limitFor(coverage, peril),
      })),
    };
  });
}

function buildRequirements(
  seed: ProfileSeed,
  tower: CoverageTowerLine[],
): CoverageRequirement[] {
  const rows: CoverageRequirement[] = [
    {
      id: slugId([seed.slug, "carrier"]),
      group: "General",
      coverage: "All",
      name: "Insurance carrier rating",
      peril: "Overall",
      kind: "Carrier Rating",
      applicability: "All",
      text: "Carrier must carry an AM Best rating of A- or better with financial size category VII or higher, unless an exception is documented.",
    },
    {
      id: slugId([seed.slug, "no-finance"]),
      group: "General",
      coverage: "All",
      name: "Premium financing disclosure",
      peril: "Overall",
      kind: "Other",
      applicability: "All",
      text: "If premium is financed, disclose the finance agreement and confirm cancellation notice terms still protect additional interests.",
    },
    {
      id: slugId([seed.slug, "cancellation"]),
      group: "General",
      coverage: "All",
      name: "Cancellation notice",
      peril: "Overall",
      kind: "Other",
      applicability: "All",
      text: "Evidence of insurance should show 30-day notice of cancellation (10 days for non-payment) to named additional interests.",
    },
  ];

  for (const line of tower) {
    for (const peril of line.perils) {
      const kind: RequirementKind =
        peril.peril.toLowerCase().includes("deduct") ? "Deductible" : "Limit";
      rows.push({
        id: slugId([seed.slug, line.coverage, peril.peril, "limit"]),
        group: line.group,
        coverage: line.coverage,
        name: `Sufficient ${line.coverage} — ${peril.peril}`,
        peril: peril.peril,
        kind,
        applicability: line.group === "Property" ? "Scheduled" : "All",
        text: `${line.coverage} ${peril.peril} limit must meet ${peril.limit} for ${seed.name}.`,
      });
    }

    if (line.group === "Property") {
      rows.push({
        id: slugId([seed.slug, line.coverage, "deductible"]),
        group: "Property",
        coverage: line.coverage,
        name: `Acceptable ${line.coverage} deductible`,
        peril: "Overall",
        kind: "Deductible",
        applicability: "Scheduled",
        text: `${line.coverage} deductible should not exceed $50,000 (or 5% of TIV for wind / named storm where percentage deductibles apply).`,
      });
    }
  }

  if (seed.focusLines.includes("Professional Liability")) {
    rows.push({
      id: slugId([seed.slug, "pl-retro"]),
      group: "Liability",
      coverage: "Professional Liability",
      name: "Claims-made retroactive date",
      peril: "Overall",
      kind: "Other",
      applicability: "All",
      text: "If written claims-made, the retroactive date must reach the start of continuous professional services, and tail coverage should be available at exit.",
    });
  }

  return rows;
}

function defaultFaqs(seed: ProfileSeed): CoverageProfile["faqs"] {
  return [
    {
      question: `What insurance does ${seed.name.toLowerCase()} typically need?`,
      answer: `${seed.name} programs usually combine ${seed.focusLines
        .slice(0, 4)
        .join(", ")} as the core schedule, then add catastrophe and specialty lines where geography or contracts require them.`,
    },
    {
      question: "How should this profile be used?",
      answer:
        "Treat the PolicyWell profile as a decision-support benchmark — compare a live policy or submission against the requirement set, then document exceptions. It is not a bindable quote or legal opinion.",
    },
    {
      question: "What does the completion score mean?",
      answer:
        "Completion score is the share of applicable coverage×peril pairs this profile requires. Higher scores mean a denser published benchmark; they are not a grade of any specific insured.",
    },
  ];
}

export function buildProfileFromSeed(seed: ProfileSeed): CoverageProfile {
  const tower = buildTower(seed.focusLines);
  const requirements = buildRequirements(seed, tower);
  const pairCount = Math.max(
    24,
    tower.reduce((n, line) => n + line.perils.length, 0) + 8,
  );
  const requiredPairs = Math.round((seed.completionScore / 100) * pairCount);

  return {
    slug: seed.slug,
    name: seed.name,
    industry: seed.industry,
    assetTypes: seed.assetTypes,
    completionScore: seed.completionScore,
    pairCount,
    requiredPairs,
    summary: seed.summary,
    takeaways: [
      `Spans ${requirements.length} published requirements across ${requiredPairs} coverage×peril pairs.`,
      `Applies to ${seed.assetTypes.length} asset type${seed.assetTypes.length === 1 ? "" : "s"}: ${seed.assetTypes.join(", ")}.`,
      `Covers ${tower.length} coverage types across property and liability lines.`,
    ],
    tower,
    requirements,
    whoRequires: seed.whoRequires ?? [
      `Operators and owners in ${seed.industry} use this profile to set a coverage floor before renewals and acquisitions.`,
      "Lenders, landlords, and contractual counterparties often embed matching limit and rating language in agreements.",
      "Brokers use the profile to structure submissions and explain residual gaps to clients.",
    ],
    carrierStandard:
      "Carrier must carry an AM Best rating of A- or better with financial size category VII or higher, unless an exception is documented.",
    exclusions: seed.exclusions ?? [
      "This benchmark is a property and liability foundation — not an all-lines program.",
      "Standalone cyber, pollution, and directors & officers coverage are outside the default schedule unless listed in the tower.",
      "Confirm any claims-made retro dates, abuse sublimits, and contractual liability endorsements separately.",
    ],
    advisoryTitle: seed.advisoryTitle ?? `Typical coverage gaps in ${seed.industry}`,
    advisoryLead: seed.advisoryLead,
    advisoryPoints: seed.advisoryPoints,
    faqs: seed.faqs ?? defaultFaqs(seed),
    relatedSlugs: seed.relatedSlugs ?? [],
  };
}
