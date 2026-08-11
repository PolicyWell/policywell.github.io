/** Lightweight industry glyphs + counts for Advocate-style filter lists. */

export type IndustryMeta = {
  id: string;
  label: string;
  count: number;
  /** Simple path-based glyph key used by the filter list icons. */
  glyph:
    | "leaf"
    | "hardhat"
    | "school"
    | "bank"
    | "cup"
    | "civic"
    | "home"
    | "heart"
    | "hotel"
    | "factory"
    | "briefcase"
    | "cart"
    | "truck"
    | "chip"
    | "wrench"
    | "generic";
};

const GLYPH_BY_KEYWORD: Array<{ match: RegExp; glyph: IndustryMeta["glyph"] }> =
  [
    { match: /agricult|grocery|restaurant|food/i, glyph: "leaf" },
    { match: /contractor|garage|construct/i, glyph: "hardhat" },
    { match: /educat|child/i, glyph: "school" },
    { match: /financ|bank/i, glyph: "bank" },
    { match: /hospitality|hotel|lodg/i, glyph: "hotel" },
    { match: /health|nursing|social/i, glyph: "heart" },
    { match: /manufactur|industrial/i, glyph: "factory" },
    { match: /property|home owner|habitational|hoa/i, glyph: "home" },
    { match: /professional|business|service/i, glyph: "briefcase" },
    { match: /retail|ecommerce|commerce/i, glyph: "cart" },
    { match: /truck|transport|fleet/i, glyph: "truck" },
    { match: /technolog|software|it /i, glyph: "chip" },
    { match: /government|nonprofit|civic/i, glyph: "civic" },
  ];

export function industryGlyph(label: string): IndustryMeta["glyph"] {
  for (const item of GLYPH_BY_KEYWORD) {
    if (item.match.test(label)) return item.glyph;
  }
  return "generic";
}

export function buildIndustryMeta(
  industries: string[],
  counts: Record<string, number>,
): IndustryMeta[] {
  return industries.map((label) => ({
    id: label,
    label,
    count: counts[label] ?? 0,
    glyph: industryGlyph(label),
  }));
}
