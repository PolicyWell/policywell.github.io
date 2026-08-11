/**
 * Normalize United of Omaha / Mutual of Omaha IUL Express PDF text into
 * labeled fields + LEDGER rows for the deterministic life-illustration parser.
 */

function moneyNum(raw: string | undefined | null): number | null {
  if (raw == null || raw === "") return null;
  const n = Number(String(raw).replace(/[$,\s]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function fmt(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

function parseAvSv(chunk: string): { av: number; sv: number } {
  const c = chunk.replace(/\s+/g, "");
  if (!c || c === "0") return { av: 0, sv: 0 };

  // Identical AV and SV: 43,32543,325
  const dup = c.match(/^(\d{1,3}(?:,\d{3})+)\1$/);
  if (dup) {
    const v = moneyNum(dup[1]) ?? 0;
    return { av: v, sv: v };
  }

  // Trailing lone 0 ⇒ SV = 0 (3270, 1,0100, 7300)
  if (/0$/.test(c)) {
    const without = c.slice(0, -1);
    if (without && moneyNum(without) != null) {
      // Prefer this when there is no thousands-comma ending like ,325
      if (!/,\d{3}$/.test(c)) {
        return { av: moneyNum(without) ?? 0, sv: 0 };
      }
    }
  }

  // AV then SV where SV is last 1–3 digits (5,053853 → 5053 / 853)
  const m = c.match(/^([\d,]+?)(\d{1,3})$/);
  if (m) return { av: moneyNum(m[1]) ?? 0, sv: moneyNum(m[2]) ?? 0 };

  return { av: moneyNum(c) ?? 0, sv: 0 };
}

export type NormalizedLedgerRow = {
  policy_year: number;
  attained_age: number;
  annual_premium_outlay: number;
  guaranteed_accumulation_value: number;
  guaranteed_surrender_value: number;
  guaranteed_death_benefit: number;
  alternate_accumulation_value: number;
  alternate_surrender_value: number;
  alternate_death_benefit: number;
  illustrated_accumulation_value: number;
  illustrated_surrender_value: number;
  illustrated_death_benefit: number;
};

/** Join split UOO ledger lines like "1038" + "1,502" + values. */
export function coalesceLedgerLines(text: string, annualPremium: number): string[] {
  const prem = fmt(annualPremium);
  const lines = text.split(/\n/).map((l) => l.trim());
  const out: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\d{3,4}$/.test(line) && lines[i + 1] === prem) {
      const yearAge = line;
      const restParts: string[] = [];
      i += 2;
      while (i < lines.length && !/^(Subtotal|End of|Page |\d{1,2}\d{2}1,)/.test(lines[i])) {
        if (lines[i]) restParts.push(lines[i]);
        // stop once we likely have three DB tokens
        const joined = restParts.join("");
        if ((joined.match(/\d{1,3}(?:,\d{3})+/g) || []).length >= 3) break;
        i += 1;
      }
      out.push(`${yearAge}${prem}${restParts.join("")}`);
      continue;
    }
    out.push(line);
  }
  return out;
}

export function parseUnitedOfOmahaDetailedLedger(
  text: string,
  annualPremium: number,
): NormalizedLedgerRow[] {
  const prem = fmt(annualPremium);
  const premRe = prem.replace(/,/g, "\\,");
  const lineRe = new RegExp(`^(\\d{1,2})(\\d{2})${premRe}(.+)$`);
  const coalesced = coalesceLedgerLines(text, annualPremium);
  const byYear = new Map<number, NormalizedLedgerRow>();

  for (const line of coalesced) {
    const m = line.match(lineRe);
    if (!m) continue;
    const year = Number(m[1]);
    const age = Number(m[2]);
    const rest = m[3];

    const triples: { before: string; db: string }[] = [];
    // Death benefits are large (typically >= 100,000). Do not treat premium-sized
    // tokens like 1,502 or cash values like 2,225 as DB delimiters.
    const dbTokenRe = /(\d{1,3}(?:,\d{3})+)/g;
    const dbHits: { index: number; token: string; value: number }[] = [];
    let dm: RegExpExecArray | null;
    while ((dm = dbTokenRe.exec(rest))) {
      const value = moneyNum(dm[1]);
      if (value != null && value >= 100_000) {
        dbHits.push({ index: dm.index, token: dm[1], value });
      }
    }
    if (dbHits.length < 3) continue;
    for (let t = 0; t < 3; t++) {
      const start = t === 0 ? 0 : dbHits[t - 1].index + dbHits[t - 1].token.length;
      const before = rest.slice(start, dbHits[t].index);
      triples.push({ before, db: dbHits[t].token });
    }

    const scales = triples.map((tr) => {
      const avsv = parseAvSv(tr.before);
      return { ...avsv, db: moneyNum(tr.db) ?? 0 };
    });
    const [g, a, i] = scales;

    // Skip IRR/noise rows where "death benefit" tokens are just the premium amount.
    if (g.db === annualPremium && a.db === annualPremium && i.db === annualPremium) {
      continue;
    }

    const next: NormalizedLedgerRow = {
      policy_year: year,
      attained_age: age,
      annual_premium_outlay: annualPremium,
      guaranteed_accumulation_value: g.av,
      guaranteed_surrender_value: g.sv,
      guaranteed_death_benefit: g.db,
      alternate_accumulation_value: a.av,
      alternate_surrender_value: a.sv,
      alternate_death_benefit: a.db,
      illustrated_accumulation_value: i.av,
      illustrated_surrender_value: i.sv,
      illustrated_death_benefit: i.db,
    };
    const prev = byYear.get(year);
    if (!prev || (next.guaranteed_death_benefit >= 1000 && prev.guaranteed_death_benefit < 1000)) {
      byYear.set(year, next);
    }
  }

  return [...byYear.values()].sort((a, b) => a.policy_year - b.policy_year);
}

export function isUnitedOfOmahaIulExpress(text: string): boolean {
  const blob = text.toLowerCase();
  return (
    (blob.includes("united of omaha") || blob.includes("mutual of omaha")) &&
    (blob.includes("indexed universal life express") ||
      blob.includes("life insurance policy illustration"))
  );
}

export function normalizeUnitedOfOmahaIllustration(text: string): string {
  const insured =
    text.match(/Prepared For:\s*\n?\s*([A-Za-z][A-Za-z .'-]+)/i)?.[1]?.trim() ||
    text.match(/Insured:\s*([A-Za-z][A-Za-z .'-]+?)(?:\s+Male|\s+Female|,)/i)?.[1]?.trim() ||
    text.match(/Client Information\s*([A-Za-z][A-Za-z .'-]+)/i)?.[1]?.trim() ||
    null;

  const ageHit =
    text.match(/Male,\s*Age\s*(\d+),\s*([^\n]+)/i) ||
    text.match(/Female,\s*Age\s*(\d+),\s*([^\n]+)/i);
  const issueAge = ageHit ? Number(ageHit[1]) : null;
  const sex = /Female,\s*Age/i.test(text)
    ? "Female"
    : /Male,\s*Age/i.test(text)
      ? "Male"
      : null;
  const riskClass = ageHit?.[2]?.replace(/\s+/g, " ").trim() ?? null;
  const tobaccoStatus = /Non-?Tobacco/i.test(text)
    ? "Non-Tobacco"
    : /Tobacco/i.test(text)
      ? "Tobacco"
      : null;

  const deathBenefit = moneyNum(
    text.match(/Total Initial Death Benefit:?\s*\$?([\d,]+)/i)?.[1],
  );
  const monthlyPremium = moneyNum(
    text.match(/Initial Premium Outlay\$?([\d,]+\.?\d*)/i)?.[1] ||
      text.match(/Monthly Premium:\s*\$?([\d,]+\.?\d*)/i)?.[1],
  );
  const annualPremium =
    monthlyPremium != null
      ? Math.round(monthlyPremium * 12)
      : moneyNum(text.match(/Initial Payment\s*\$?([\d,]+)/i)?.[1]) ?? 1502;

  const noLapseAnnual = moneyNum(
    text.match(
      /death benefit to policy year 20 is \$([\d,]+\.?\d*)/i,
    )?.[1],
  );
  const premiumBlock = text.match(
    /Annualized\s*\nPremiums\s*\n\$([\d,]+\.?\d*)\s*\n\$([\d,]+\.?\d*)\s*\nMinimum Premium:\s*\nTAMRA 7-PAY:\s*\n\$([\d,]+\.?\d*)\s*\n\$([\d,]+\.?\d*)/i,
  );
  const gmlp = moneyNum(premiumBlock?.[2]);
  const tamra = moneyNum(premiumBlock?.[3]);
  const gsp = moneyNum(premiumBlock?.[4]);

  const illustratedRate = moneyNum(
    text.match(
      /One-Year 100% Participation Account\s*100%\s*([\d.]+)\s*%/i,
    )?.[1] || text.match(/100%0\.0%[\d.]+%([\d.]+)%/)?.[1],
  );
  const alternateRate = moneyNum(
    text.match(/100%0\.0%([\d.]+)%[\d.]+%/)?.[1],
  );

  const guarCease = moneyNum(
    text.match(/(\d+)\s*based on Guaranteed Assumptions/i)?.[1],
  );
  const midCease = moneyNum(
    text.match(/(\d+)\s*based on Midpoint Assumptions/i)?.[1],
  );

  const riders = [
    "Accelerated Benefit for Chronic Illness",
    "Accelerated Death Benefit for Terminal Illness",
    "Optional Paid-Up Life Insurance Rider (Lapse Guard)",
    "Waiver of Surrender Charges for Partial Withdrawals Rider",
  ].filter((r) => text.includes(r.slice(0, 24)));

  const ledger = parseUnitedOfOmahaDetailedLedger(text, annualPremium);

  return [
    "Carrier: United of Omaha Life Insurance Company",
    "Product: Indexed Universal Life Express",
    "Product Type: Indexed Universal Life",
    insured ? `Insured Name: ${insured}` : null,
    issueAge != null ? `Issue Age: ${issueAge}` : null,
    sex ? `Sex: ${sex}` : null,
    riskClass ? `Risk Class: ${riskClass}` : null,
    tobaccoStatus ? `Tobacco Status: ${tobaccoStatus}` : null,
    deathBenefit != null ? `Death Benefit: $${fmt(deathBenefit)}` : null,
    "Death Benefit Option: Level",
    monthlyPremium != null
      ? `Monthly Premium: $${monthlyPremium.toFixed(2)}`
      : null,
    `Annual Premium: $${fmt(annualPremium)}`,
    noLapseAnnual != null
      ? `No-Lapse Annual Premium: $${fmt(noLapseAnnual)}`
      : null,
    gmlp != null ? `Guideline Maximum Level Premium: $${fmt(gmlp)}` : null,
    tamra != null ? `TAMRA 7-Pay Premium: $${fmt(tamra)}` : null,
    gsp != null ? `Guideline Single Premium: $${fmt(gsp)}` : null,
    "Crediting Strategy: One-Year 100% Participation Account",
    "Allocation Percentage: 100%",
    "Guaranteed Rate: 0%",
    alternateRate != null ? `Alternate Rate: ${alternateRate}%` : null,
    illustratedRate != null ? `Illustrated Rate: ${illustratedRate}%` : null,
    riders.length ? `Riders: ${riders.join(", ")}` : null,
    guarCease != null
      ? `Guaranteed Coverage Cessation Age: ${guarCease}`
      : null,
    midCease != null ? `Midpoint Coverage Cessation Age: ${midCease}` : null,
    "Illustrated Duration Years: 92",
    "",
    "LEDGER",
    "Year | Age | Premium | Guar AV | Guar SV | Guar DB | Alt AV | Alt SV | Alt DB | Ill AV | Ill SV | Ill DB",
    ...ledger.map(
      (r) =>
        `${r.policy_year} | ${r.attained_age} | ${r.annual_premium_outlay} | ${r.guaranteed_accumulation_value} | ${r.guaranteed_surrender_value} | ${r.guaranteed_death_benefit} | ${r.alternate_accumulation_value} | ${r.alternate_surrender_value} | ${r.alternate_death_benefit} | ${r.illustrated_accumulation_value} | ${r.illustrated_surrender_value} | ${r.illustrated_death_benefit}`,
    ),
    "END LEDGER",
  ]
    .filter((x): x is string => Boolean(x))
    .join("\n");
}
