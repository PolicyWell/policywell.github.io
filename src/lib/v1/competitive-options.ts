/**
 * Deterministic hypothetical IUL competitive options for live demos.
 * Not carrier quotes — labeled hypotheticals only.
 */

export type CompetitiveOption = {
  rank: number;
  carrier: string;
  product: string;
  monthlyPremium: number;
  deathBenefit: number;
  deathBenefitOption: string;
  illustratedCashValueAtAge52: number;
  illustratedCreditingRatePct: number;
  highlight: string;
  whyBetter: string;
};

export type CompetitiveOptionsResult = {
  baseline: {
    carrier: string;
    product: string;
    monthlyPremium: number;
    deathBenefit: number;
    illustratedCashValueAtAge52: number | null;
  };
  options: CompetitiveOption[];
  disclaimer: string;
};

export const COMPETITIVE_OPTIONS_DISCLAIMER =
  "Hypothetical competitive alternatives for discussion only — not carrier quotes, offers, or guarantees. Exact values require carrier reillustration and underwriting.";

function roundMoney(n: number): number {
  return Math.round(n);
}

/**
 * Build 5 deterministic alternatives scaled from the client's current illustration.
 * Includes Foresters Financial and other major IUL-style designs.
 */
export function buildHypotheticalIulOptions(input: {
  carrier: string | null;
  product: string | null;
  monthlyPremium: number | null;
  deathBenefit: number | null;
  illustratedCashValueAtAge52: number | null;
  issueAge: number | null;
}): CompetitiveOptionsResult {
  const monthly = input.monthlyPremium ?? 125;
  const db = input.deathBenefit ?? 300_000;
  const cv52 = input.illustratedCashValueAtAge52 ?? monthly * 12 * 24 * 1.1;

  const baseline = {
    carrier: input.carrier ?? "Current carrier",
    product: input.product ?? "Current IUL",
    monthlyPremium: roundMoney(monthly),
    deathBenefit: roundMoney(db),
    illustratedCashValueAtAge52: roundMoney(cv52),
  };

  const options: CompetitiveOption[] = [
    {
      rank: 1,
      carrier: "Foresters Financial",
      product: "Foresters Strong Foundation IUL (hypothetical)",
      monthlyPremium: roundMoney(monthly * 1.05),
      deathBenefit: roundMoney(db * 1.25),
      deathBenefitOption: "Level + chronic illness acceleration",
      illustratedCashValueAtAge52: roundMoney(cv52 * 1.28),
      illustratedCreditingRatePct: 6.1,
      highlight: "Best overall cash-value + death-benefit lift",
      whyBetter:
        "Higher illustrated accumulation at similar premium with stronger living-benefit packaging.",
    },
    {
      rank: 2,
      carrier: "Allianz Life",
      product: "Allianz Life Pro+ Advantage IUL (hypothetical)",
      monthlyPremium: roundMoney(monthly * 1.08),
      deathBenefit: roundMoney(db * 1.15),
      deathBenefitOption: "Increasing (Option B) early years → level",
      illustratedCashValueAtAge52: roundMoney(cv52 * 1.35),
      illustratedCreditingRatePct: 6.35,
      highlight: "Highest illustrated cash value at age 52",
      whyBetter:
        "Index bonus / multiplier-style design emphasizes accumulation for mid-life liquidity.",
    },
    {
      rank: 3,
      carrier: "National Life Group (LSMark)",
      product: "PeakLife IUL (hypothetical)",
      monthlyPremium: roundMoney(monthly * 0.98),
      deathBenefit: roundMoney(db * 1.4),
      deathBenefitOption: "Level with terminal + chronic acceleration",
      illustratedCashValueAtAge52: roundMoney(cv52 * 1.12),
      illustratedCreditingRatePct: 5.95,
      highlight: "Best death-benefit efficiency per premium dollar",
      whyBetter:
        "Lower/near-current premium for a larger face amount — protection-first redesign.",
    },
    {
      rank: 4,
      carrier: "Pacific Life",
      product: "Pacific Discovery Xelerator IUL (hypothetical)",
      monthlyPremium: roundMoney(monthly * 1.12),
      deathBenefit: roundMoney(db * 1.2),
      deathBenefitOption: "Level; switchable to increasing",
      illustratedCashValueAtAge52: roundMoney(cv52 * 1.22),
      illustratedCreditingRatePct: 6.0,
      highlight: "Stronger long-duration funding flexibility",
      whyBetter:
        "More guideline room / funding flexibility for future overfunding without immediate MEC pressure.",
    },
    {
      rank: 5,
      carrier: "John Hancock",
      product: "Accumulation IUL 22 (hypothetical)",
      monthlyPremium: roundMoney(monthly * 1.1),
      deathBenefit: roundMoney(db * 1.1),
      deathBenefitOption: "Level + Healthy Engagement credits",
      illustratedCashValueAtAge52: roundMoney(cv52 * 1.18),
      illustratedCreditingRatePct: 5.9,
      highlight: "Lifestyle / wellness-linked value add",
      whyBetter:
        "Competitive accumulation with wellness incentives that can improve illustrated net cost over time.",
    },
  ];

  return {
    baseline,
    options,
    disclaimer: COMPETITIVE_OPTIONS_DISCLAIMER,
  };
}

export function formatCompetitiveOptionsAnswer(
  result: CompetitiveOptionsResult,
): string {
  const lines = [
    `Current: ${result.baseline.carrier} / ${result.baseline.product} — ${money(result.baseline.monthlyPremium)}/mo, DB ${money(result.baseline.deathBenefit)}, illus. CV@52 ${money(result.baseline.illustratedCashValueAtAge52)}.`,
    "Five hypothetical alternatives:",
    ...result.options.map(
      (o) =>
        `${o.rank}. ${o.carrier} — ${o.product}: ${money(o.monthlyPremium)}/mo · DB ${money(o.deathBenefit)} (${o.deathBenefitOption}) · illus. CV@52 ${money(o.illustratedCashValueAtAge52)} · ${o.highlight}`,
    ),
  ];
  return lines.join(" ");
}

function money(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function isBetterOptionsQuestion(question: string): boolean {
  const q = question.toLowerCase();
  return (
    /best option/.test(q) ||
    /better option/.test(q) ||
    /any better/.test(q) ||
    /other option/.test(q) ||
    /alternatives?/.test(q) ||
    /compare.*(carrier|product|iul)/.test(q) ||
    /what else/.test(q) ||
    /should (he|she|they|we|i) (switch|replace|move)/.test(q) ||
    /forestern?s/.test(q) ||
    /competitive/.test(q) ||
    /shop (the )?market/.test(q)
  );
}
