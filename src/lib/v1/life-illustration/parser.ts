export type ExtractedFact = {
  field_path: string;
  value: string | number | boolean | string[] | null;
  source_page: number | null;
  source_excerpt: string | null;
  confidence: number;
};

export type ExtractedLedgerRow = {
  policy_year: number;
  attained_age: number | null;
  annual_premium_outlay: number | null;
  guaranteed_accumulation_value: number | null;
  guaranteed_surrender_value: number | null;
  guaranteed_death_benefit: number | null;
  alternate_accumulation_value: number | null;
  alternate_surrender_value: number | null;
  alternate_death_benefit: number | null;
  illustrated_accumulation_value: number | null;
  illustrated_surrender_value: number | null;
  illustrated_death_benefit: number | null;
};

export type LifeIllustrationExtraction = {
  documentType: "original_illustration" | "inforce_illustration";
  carrier: string | null;
  product: string | null;
  productType: string | null;
  insuredName: string | null;
  issueAge: number | null;
  sex: string | null;
  riskClass: string | null;
  tobaccoStatus: string | null;
  deathBenefit: number | null;
  deathBenefitOption: string | null;
  monthlyPremium: number | null;
  annualPremium: number | null;
  noLapseAnnualPremium: number | null;
  guidelineMaximumLevelPremium: number | null;
  tamra7PayPremium: number | null;
  guidelineSinglePremium: number | null;
  creditingStrategy: string | null;
  allocationPercentage: number | null;
  guaranteedRate: number | null;
  alternateRate: number | null;
  illustratedRate: number | null;
  riders: string[];
  guaranteedCoverageCessationAge: number | null;
  midpointCoverageCessationAge: number | null;
  illustratedDurationYears: number | null;
  facts: ExtractedFact[];
  ledger: ExtractedLedgerRow[];
};

function parseMoney(raw: string | undefined | null): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[$,\s]/g, "");
  if (!cleaned || cleaned === "-" || cleaned.toLowerCase() === "n/a") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function parseNumber(raw: string | undefined | null): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[%,\s]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function matchLine(
  text: string,
  patterns: RegExp[],
): { value: string; excerpt: string; page: number | null } | null {
  const pages = text.split(/\f|\n---\s*PAGE\s+(\d+)\s*---\n/i);
  // Simple whole-doc search first
  for (const pattern of patterns) {
    const m = text.match(pattern);
    if (m?.[1]) {
      const excerpt = m[0].replace(/\s+/g, " ").trim().slice(0, 240);
      let page: number | null = null;
      const pageMarker = text.slice(0, m.index ?? 0).match(/PAGE\s+(\d+)/gi);
      if (pageMarker?.length) {
        const last = pageMarker[pageMarker.length - 1].match(/(\d+)/);
        page = last ? Number(last[1]) : null;
      }
      return { value: m[1].trim(), excerpt, page: page ?? 1 };
    }
  }
  void pages;
  return null;
}

function fact(
  field_path: string,
  value: ExtractedFact["value"],
  hit: { excerpt: string; page: number | null } | null,
  confidence = 0.9,
): ExtractedFact | null {
  if (value === null || value === undefined || value === "") return null;
  return {
    field_path,
    value,
    source_page: hit?.page ?? 1,
    source_excerpt: hit?.excerpt ?? null,
    confidence,
  };
}

function detectDocumentType(
  text: string,
  filename: string,
): "original_illustration" | "inforce_illustration" {
  const blob = `${filename}\n${text}`.toLowerCase();
  if (blob.includes("in-force") || blob.includes("inforce") || blob.includes("in force")) {
    return "inforce_illustration";
  }
  return "original_illustration";
}

/** Parse tabular ledger rows from a PIPE or whitespace-delimited LEDGER section. */
export function parseLedgerSection(text: string): ExtractedLedgerRow[] {
  const ledgerMatch = text.match(
    /LEDGER(?:\s+VALUES)?\s*:?\s*\n([\s\S]*?)(?:\n\s*\n[A-Z][A-Z ]{3,}:|\nEND LEDGER|\s*$)/i,
  );
  const block = ledgerMatch?.[1] ?? "";
  if (!block.trim()) return [];

  const rows: ExtractedLedgerRow[] = [];
  for (const line of block.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || /^year\b/i.test(trimmed) || /^-+$/.test(trimmed) || /^#/.test(trimmed)) {
      continue;
    }

    let parts: string[];
    if (trimmed.includes("|")) {
      parts = trimmed.split("|").map((p) => p.trim());
    } else {
      parts = trimmed.split(/\s+/);
    }
    if (parts.length < 5) continue;

    const policyYear = parseNumber(parts[0]);
    if (policyYear == null) continue;

    rows.push({
      policy_year: policyYear,
      attained_age: parseNumber(parts[1]),
      annual_premium_outlay: parseMoney(parts[2]),
      guaranteed_accumulation_value: parseMoney(parts[3]),
      guaranteed_surrender_value: parseMoney(parts[4]),
      guaranteed_death_benefit: parseMoney(parts[5]),
      alternate_accumulation_value: parseMoney(parts[6]),
      alternate_surrender_value: parseMoney(parts[7]),
      alternate_death_benefit: parseMoney(parts[8]),
      illustrated_accumulation_value: parseMoney(parts[9]),
      illustrated_surrender_value: parseMoney(parts[10]),
      illustrated_death_benefit: parseMoney(parts[11]),
    });
  }
  return rows;
}

import {
  isUnitedOfOmahaIulExpress,
  normalizeUnitedOfOmahaIllustration,
} from "@/lib/v1/life-illustration/normalize-united-omaha";

/**
 * Deterministic life-illustration text parser for local VC demo.
 * Supports labeled key/value illustration text and a LEDGER table section.
 */
export function parseLifeIllustrationText(
  text: string,
  filename = "illustration.txt",
): LifeIllustrationExtraction {
  const normalized = isUnitedOfOmahaIulExpress(text)
    ? normalizeUnitedOfOmahaIllustration(text)
    : text;
  const documentType = detectDocumentType(normalized, filename);

  const carrierHit = matchLine(normalized, [
    /Carrier:\s*(.+)$/im,
    /Company:\s*(.+)$/im,
    /^([A-Z][A-Za-z0-9 .,&'-]+(?:Life|Insurance|Mutual)[A-Za-z0-9 .,&'-]*)$/m,
  ]);
  const productHit = matchLine(normalized, [/Product:\s*(.+)$/im, /Plan:\s*(.+)$/im]);
  const productTypeHit = matchLine(normalized, [
    /Product\s*Type:\s*(.+)$/im,
    /Policy\s*Type:\s*(.+)$/im,
  ]);
  const insuredHit = matchLine(normalized, [
    /Insured(?:\s*Name)?:\s*(.+)$/im,
    /Proposed\s*Insured:\s*(.+)$/im,
  ]);
  const issueAgeHit = matchLine(normalized, [/Issue\s*Age:\s*(\d+)/im, /Age\s*at\s*Issue:\s*(\d+)/im]);
  const sexHit = matchLine(normalized, [/Sex:\s*(Male|Female|M|F)\b/im, /Gender:\s*(Male|Female|M|F)\b/im]);
  const riskHit = matchLine(normalized, [/Risk\s*Class:\s*(.+)$/im, /Underwriting\s*Class:\s*(.+)$/im]);
  const tobaccoHit = matchLine(normalized, [
    /Tobacco(?:\s*Status)?:\s*(.+)$/im,
    /(Non-?Tobacco|Tobacco|Smoker|Non-?Smoker)\b/im,
  ]);
  const dbHit = matchLine(normalized, [
    /Death\s*Benefit:\s*\$?([\d,]+(?:\.\d+)?)/im,
    /Face\s*Amount:\s*\$?([\d,]+(?:\.\d+)?)/im,
  ]);
  const dboHit = matchLine(normalized, [
    /Death\s*Benefit\s*Option:\s*(.+)$/im,
    /Option:\s*(Level|Increasing|A|B)\b/im,
  ]);
  const monthlyHit = matchLine(normalized, [
    /Monthly\s*Premium:\s*\$?([\d,]+(?:\.\d+)?)/im,
    /Planned\s*Monthly\s*Premium:\s*\$?([\d,]+(?:\.\d+)?)/im,
  ]);
  const annualHit = matchLine(normalized, [
    /Annual\s*Premium:\s*\$?([\d,]+(?:\.\d+)?)/im,
    /Planned\s*Annual\s*Premium:\s*\$?([\d,]+(?:\.\d+)?)/im,
  ]);
  const noLapseHit = matchLine(normalized, [
    /No-?Lapse\s*(?:Guarantee\s*)?Annual\s*Premium:\s*\$?([\d,]+(?:\.\d+)?)/im,
    /NLG\s*Premium:\s*\$?([\d,]+(?:\.\d+)?)/im,
  ]);
  const gmlpHit = matchLine(normalized, [
    /Guideline\s*Maximum\s*(?:Level\s*)?Premium:\s*\$?([\d,]+(?:\.\d+)?)/im,
    /GMLP:\s*\$?([\d,]+(?:\.\d+)?)/im,
  ]);
  const tamraHit = matchLine(normalized, [
    /TAMRA\s*7-?Pay\s*Premium:\s*\$?([\d,]+(?:\.\d+)?)/im,
    /7-?Pay\s*Premium:\s*\$?([\d,]+(?:\.\d+)?)/im,
  ]);
  const gspHit = matchLine(normalized, [
    /Guideline\s*Single\s*Premium:\s*\$?([\d,]+(?:\.\d+)?)/im,
    /GSP:\s*\$?([\d,]+(?:\.\d+)?)/im,
  ]);
  const strategyHit = matchLine(normalized, [
    /Crediting\s*Strategy:\s*(.+)$/im,
    /Index\s*Strategy:\s*(.+)$/im,
  ]);
  const allocHit = matchLine(normalized, [/Allocation(?:\s*Percentage)?:\s*([\d.]+)\s*%?/im]);
  const guarRateHit = matchLine(normalized, [/Guaranteed\s*Rate:\s*([\d.]+)\s*%?/im]);
  const altRateHit = matchLine(normalized, [/Alternate\s*Rate:\s*([\d.]+)\s*%?/im]);
  const illRateHit = matchLine(normalized, [
    /Illustrated\s*Rate:\s*([\d.]+)\s*%?/im,
    /Current\s*Illustrated\s*Rate:\s*([\d.]+)\s*%?/im,
  ]);
  const ridersHit = matchLine(normalized, [/Riders?:\s*(.+)$/im]);
  const guarCeaseHit = matchLine(normalized, [
    /Guaranteed\s*Coverage\s*Cessation\s*Age:\s*(\d+)/im,
    /Guaranteed\s*(?:to\s*)?Age:\s*(\d+)/im,
  ]);
  const midCeaseHit = matchLine(normalized, [
    /Midpoint\s*Coverage\s*Cessation\s*Age:\s*(\d+)/im,
    /Midpoint\s*(?:to\s*)?Age:\s*(\d+)/im,
  ]);
  const durationHit = matchLine(normalized, [
    /Illustrated\s*Duration(?:\s*Years)?:\s*(\d+)/im,
    /Coverage\s*Duration:\s*(\d+)\s*years?/im,
  ]);

  const carrier = carrierHit?.value ?? null;
  const product = productHit?.value ?? null;
  const productType = productTypeHit?.value ?? "IUL";
  const insuredName = insuredHit?.value ?? null;
  const issueAge = parseNumber(issueAgeHit?.value);
  const sexRaw = sexHit?.value ?? null;
  const sex =
    sexRaw == null
      ? null
      : /^(m|male)$/i.test(sexRaw)
        ? "Male"
        : /^(f|female)$/i.test(sexRaw)
          ? "Female"
          : sexRaw;
  const riskClass = riskHit?.value ?? null;
  const tobaccoStatus = tobaccoHit?.value ?? null;
  const deathBenefit = parseMoney(dbHit?.value);
  const deathBenefitOption = dboHit?.value ?? null;
  const monthlyPremium = parseMoney(monthlyHit?.value);
  let annualPremium = parseMoney(annualHit?.value);
  if (annualPremium == null && monthlyPremium != null) {
    annualPremium = monthlyPremium * 12;
  }
  const noLapseAnnualPremium = parseMoney(noLapseHit?.value);
  const guidelineMaximumLevelPremium = parseMoney(gmlpHit?.value);
  const tamra7PayPremium = parseMoney(tamraHit?.value);
  const guidelineSinglePremium = parseMoney(gspHit?.value);
  const creditingStrategy = strategyHit?.value ?? null;
  const allocationPercentage = parseNumber(allocHit?.value);
  const guaranteedRate = parseNumber(guarRateHit?.value);
  const alternateRate = parseNumber(altRateHit?.value);
  const illustratedRate = parseNumber(illRateHit?.value);
  const riders = (ridersHit?.value ?? "")
    .split(/[,;]/)
    .map((r) => r.trim())
    .filter(Boolean);
  const guaranteedCoverageCessationAge = parseNumber(guarCeaseHit?.value);
  const midpointCoverageCessationAge = parseNumber(midCeaseHit?.value);
  const illustratedDurationYears = parseNumber(durationHit?.value);
  const ledger = parseLedgerSection(normalized);

  const facts: ExtractedFact[] = [
    fact("carrier", carrier, carrierHit),
    fact("product", product, productHit),
    fact("product_type", productType, productTypeHit),
    fact("insured.name", insuredName, insuredHit),
    fact("insured.issue_age", issueAge, issueAgeHit),
    fact("insured.sex", sex, sexHit),
    fact("insured.risk_class", riskClass, riskHit),
    fact("insured.tobacco_status", tobaccoStatus, tobaccoHit),
    fact("death_benefit", deathBenefit, dbHit),
    fact("death_benefit_option", deathBenefitOption, dboHit),
    fact("premium.monthly", monthlyPremium, monthlyHit),
    fact("premium.annual", annualPremium, annualHit),
    fact("premium.no_lapse_annual", noLapseAnnualPremium, noLapseHit),
    fact("premium.guideline_maximum_level", guidelineMaximumLevelPremium, gmlpHit),
    fact("premium.tamra_7_pay", tamra7PayPremium, tamraHit),
    fact("premium.guideline_single", guidelineSinglePremium, gspHit),
    fact("crediting.strategy", creditingStrategy, strategyHit),
    fact("crediting.allocation_percentage", allocationPercentage, allocHit),
    fact("crediting.guaranteed_rate", guaranteedRate, guarRateHit),
    fact("crediting.alternate_rate", alternateRate, altRateHit),
    fact("crediting.illustrated_rate", illustratedRate, illRateHit),
    fact("riders", riders.length ? riders : null, ridersHit),
    fact(
      "coverage.guaranteed_cessation_age",
      guaranteedCoverageCessationAge,
      guarCeaseHit,
    ),
    fact(
      "coverage.midpoint_cessation_age",
      midpointCoverageCessationAge,
      midCeaseHit,
    ),
    fact("coverage.illustrated_duration_years", illustratedDurationYears, durationHit),
    fact("document_type", documentType, {
      excerpt: `Detected ${documentType}`,
      page: 1,
    }),
  ].filter((f): f is ExtractedFact => f != null);

  return {
    documentType,
    carrier,
    product,
    productType,
    insuredName,
    issueAge,
    sex,
    riskClass,
    tobaccoStatus,
    deathBenefit,
    deathBenefitOption,
    monthlyPremium,
    annualPremium,
    noLapseAnnualPremium,
    guidelineMaximumLevelPremium,
    tamra7PayPremium,
    guidelineSinglePremium,
    creditingStrategy,
    allocationPercentage,
    guaranteedRate,
    alternateRate,
    illustratedRate,
    riders,
    guaranteedCoverageCessationAge,
    midpointCoverageCessationAge,
    illustratedDurationYears,
    facts,
    ledger,
  };
}

export function isLifeIllustration(text: string, filename: string): boolean {
  const blob = `${filename}\n${text}`.toLowerCase();
  return (
    blob.includes("illustration") ||
    blob.includes("indexed universal life") ||
    blob.includes("iul") ||
    blob.includes("no-lapse") ||
    blob.includes("guideline maximum") ||
    blob.includes("ledger") ||
    blob.includes("united of omaha") ||
    blob.includes("mutual of omaha")
  );
}
