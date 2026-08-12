import {
  calculateFundingAnalysis,
  calculateScenarioAnalysis,
} from "@/lib/v1/funding";
import { buildCashValueAnalysis } from "@/lib/v1/cashvalue";
import { buildLapseResult } from "@/lib/v1/lapse";
import { buildHypotheticalIulOptions } from "@/lib/v1/competitive-options";
import { getPearMalikAskContext } from "@/lib/v1/pear-malik-context";

export type PearTermTone =
  | "default"
  | "command"
  | "success"
  | "muted"
  | "warn"
  | "accent"
  | "dim"
  | "blank";

export type PearTermLine = {
  text: string;
  tone?: PearTermTone;
};

function money(n: number | null | undefined): string {
  if (n == null || Number.isNaN(Number(n))) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function ratio(n: number | null | undefined): string {
  if (n == null || Number.isNaN(Number(n))) return "—";
  return `${(n * 100).toFixed(1)}%`;
}

/** Terminal A — stack / server side of the live walkthrough. */
export const PEAR2_TERMINAL_A_SCRIPT: PearTermLine[] = [
  { text: "josh@policywell ~ % npx supabase start", tone: "command" },
  { text: "Started supabase local development setup.", tone: "success" },
  { text: "API URL: http://127.0.0.1:54321", tone: "muted" },
  { text: "DB URL:  postgresql://postgres:postgres@127.0.0.1:54322/postgres", tone: "muted" },
  { text: "", tone: "blank" },
  { text: "josh@policywell ~ % npm run dev -- -p 3000", tone: "command" },
  { text: "> policywell@0.1.0 dev", tone: "dim" },
  { text: "> next dev -p 3000", tone: "dim" },
  { text: "", tone: "blank" },
  { text: "▲ Next.js 16.3.0 (Turbopack)", tone: "accent" },
  { text: "- Local:        http://localhost:3000", tone: "success" },
  { text: "- Network:      http://192.168.1.10:3000", tone: "muted" },
  { text: "✓ Ready in 1.2s", tone: "success" },
  { text: "", tone: "blank" },
  { text: "Listening for PolicyWell /api/v1 …", tone: "dim" },
];

export const PEAR2_TERMINAL_B_STARTERS = [
  "init",
  "ingest",
  "summary",
  "funding",
  "lapse",
  "cashvalue --age 52",
  "scenario --premium 180",
  'ask "any better options?"',
] as const;

function brandLines(): PearTermLine[] {
  return [{ text: "PolicyWell", tone: "accent" }, { text: "", tone: "blank" }];
}

/** Run a Pear terminal-B command against the seeded Malik case (no network). */
export function runPear2CliCommand(raw: string): PearTermLine[] {
  const ctx = getPearMalikAskContext();
  const input = raw.trim();
  const lower = input.toLowerCase();

  if (!input || lower === "help" || lower === "--help" || lower === "-h") {
    return [
      ...brandLines(),
      { text: "Pear X 27 live demo commands:", tone: "muted" },
      { text: "", tone: "blank" },
      { text: '  policywell init --name "Pear X 27 Live Demo"', tone: "default" },
      { text: '  policywell ingest "Malik Illustrations.pdf"', tone: "default" },
      { text: "  policywell summary", tone: "default" },
      { text: "  policywell funding", tone: "default" },
      { text: "  policywell lapse", tone: "default" },
      { text: "  policywell cashvalue --age 52", tone: "default" },
      { text: "  policywell scenario --premium 180", tone: "default" },
      { text: '  policywell ask "any better options?"', tone: "default" },
    ];
  }

  if (lower === "clear" || lower === "cls") {
    return [{ text: "(cleared)", tone: "dim" }];
  }

  if (lower.startsWith("init")) {
    return [
      ...brandLines(),
      { text: 'Creating case: Pear X 27 Live Demo', tone: "default" },
      { text: "", tone: "blank" },
      { text: "✓ Case ready  case_pear_x27_live", tone: "success" },
      { text: "  Type: life", tone: "muted" },
      { text: '  Next: policywell ingest "Malik Illustrations.pdf"', tone: "dim" },
    ];
  }

  if (lower.startsWith("ingest")) {
    return [
      ...brandLines(),
      { text: "Analyzing Malik Illustrations.pdf", tone: "default" },
      { text: "", tone: "blank" },
      { text: "✓ Stored document", tone: "success" },
      { text: "✓ Parsed life illustration", tone: "success" },
      { text: "✓ Wrote policy facts + ledger", tone: "success" },
      { text: "", tone: "blank" },
      { text: `  Carrier   ${ctx.carrier}`, tone: "default" },
      { text: `  Product   ${ctx.product}`, tone: "default" },
      { text: `  Insured   ${ctx.insuredName}`, tone: "default" },
      { text: `  Monthly   ${money(ctx.monthlyPremium)}`, tone: "default" },
      { text: `  Ledger    ${ctx.ledger.length} sample rows`, tone: "default" },
      { text: "", tone: "blank" },
      { text: 'Live questions: policywell ask "is this funded?"', tone: "dim" },
    ];
  }

  if (lower === "summary") {
    return [
      ...brandLines(),
      { text: "Case summary", tone: "muted" },
      { text: "", tone: "blank" },
      { text: "  Case      Pear X 27 Live Demo", tone: "default" },
      { text: "  Status    analyzed", tone: "default" },
      { text: `  Carrier   ${ctx.carrier}`, tone: "default" },
      { text: `  Product   ${ctx.product}`, tone: "default" },
      { text: `  Insured   ${ctx.insuredName}`, tone: "default" },
      { text: `  Issue age ${ctx.issueAge}`, tone: "default" },
      { text: `  DB        ${money(ctx.deathBenefit)}`, tone: "default" },
      { text: `  Monthly   ${money(ctx.monthlyPremium)}`, tone: "default" },
      { text: `  Annual    ${money(ctx.annualPremium)}`, tone: "default" },
      { text: `  No-lapse  ${money(ctx.noLapseAnnualPremium)}`, tone: "default" },
    ];
  }

  if (lower === "funding") {
    const funding = calculateFundingAnalysis({
      monthlyPremium: ctx.monthlyPremium ?? 0,
      noLapseAnnualPremium: ctx.noLapseAnnualPremium ?? 0,
      guidelineMaximumLevelPremium: ctx.guidelineMaximumLevelPremium ?? 0,
    });
    return [
      ...brandLines(),
      { text: "Funding analysis", tone: "muted" },
      { text: "", tone: "blank" },
      { text: `  Monthly premium              ${money(funding.monthlyPremium)}`, tone: "default" },
      { text: `  Annual funding               ${money(funding.annualFunding)}`, tone: "default" },
      { text: `  No-lapse annual premium      ${money(funding.noLapseAnnualPremium)}`, tone: "default" },
      { text: `  Amount above no-lapse        ${money(funding.amountAboveNoLapse)}`, tone: "success" },
      { text: `  Funding ratio                ${ratio(funding.fundingRatio)}`, tone: "default" },
      {
        text: `  Guideline maximum (level)    ${money(funding.guidelineMaximumLevelPremium)}`,
        tone: "default",
      },
      {
        text: `  Remaining guideline room     ${money(funding.remainingGuidelineRoom)}`,
        tone: "default",
      },
    ];
  }

  if (lower === "lapse") {
    const lapse = buildLapseResult({
      guaranteedCoverageCessationAge: ctx.guaranteedCessationAge,
      midpointCoverageCessationAge: ctx.midpointCessationAge,
      illustratedDurationYears: ctx.illustratedDurationYears,
      documentType: ctx.documentType,
    });
    return [
      ...brandLines(),
      { text: "Lapse / coverage duration", tone: "muted" },
      { text: "", tone: "blank" },
      {
        text: `  Guaranteed cessation age     ${lapse.guaranteedCessationAge ?? "—"}`,
        tone: "default",
      },
      {
        text: `  Midpoint cessation age       ${lapse.midpointCessationAge ?? "—"}`,
        tone: "default",
      },
      {
        text: `  Illustrated duration (yrs)   ${lapse.illustratedDurationYears ?? "—"}`,
        tone: "default",
      },
      { text: "", tone: "blank" },
      {
        text: `  ${lapse.notes[0] ?? "Original illustration duration only."}`,
        tone: "dim",
      },
    ];
  }

  const cashMatch = lower.match(/cashvalue(?:\s+--age\s+(\d+))?/);
  if (cashMatch || lower.startsWith("cash value") || lower.startsWith("cashvalue")) {
    const age = cashMatch?.[1] ? Number(cashMatch[1]) : 52;
    const cv = buildCashValueAnalysis(ctx.ledger, age, {
      illustratedCreditingRatePct: ctx.illustratedCreditingRatePct,
      fallbackAnnualPremium: ctx.annualPremium,
    });
    return [
      ...brandLines(),
      { text: `Cash value at age ${cv.requestedAge} (illustrated path)`, tone: "muted" },
      { text: "", tone: "blank" },
      {
        text: `  Cumulative premiums paid     ${money(cv.cumulativePremiumOutlay)}`,
        tone: "default",
      },
      {
        text: `  Illustrated accumulation     ${money(cv.illustratedAccumulationValue)}`,
        tone: "default",
      },
      {
        text: `  Illustrated surrender        ${money(cv.illustratedSurrenderValue)}`,
        tone: "success",
      },
      {
        text: `  Implied net of charges       ${money(cv.illustratedNetOfCharges)}`,
        tone: "default",
      },
      { text: `  Death benefit                ${money(cv.deathBenefit)}`, tone: "default" },
      {
        text: `  Crediting assumption         ${cv.illustratedCreditingRatePct}% illustrated`,
        tone: "muted",
      },
      { text: "", tone: "blank" },
      { text: `  ${cv.disclaimer}`, tone: "dim" },
    ];
  }

  const scenMatch = lower.match(/scenario(?:\s+--premium\s+(\d+(?:\.\d+)?))?/);
  const premMatch = lower.match(/premium\s+(\d+(?:\.\d+)?)/);
  if (scenMatch || lower.startsWith("scenario") || lower.includes("what if")) {
    const premium = Number(scenMatch?.[1] ?? premMatch?.[1] ?? 180);
    const scenario = calculateScenarioAnalysis({
      currentMonthlyPremium: ctx.monthlyPremium ?? 0,
      newMonthlyPremium: premium,
      guidelineMaximumLevelPremium: ctx.guidelineMaximumLevelPremium ?? 0,
    });
    return [
      ...brandLines(),
      { text: `Scenario — monthly premium ${money(premium)}`, tone: "muted" },
      { text: "", tone: "blank" },
      {
        text: `  Current monthly                      ${money(ctx.monthlyPremium)}`,
        tone: "default",
      },
      {
        text: `  New monthly premium                  ${money(scenario.newMonthlyPremium)}`,
        tone: "default",
      },
      {
        text: `  New annual premium                   ${money(scenario.newAnnualPremium)}`,
        tone: "success",
      },
      {
        text: `  Additional annual funding            ${money(scenario.additionalAnnualFunding)}`,
        tone: "default",
      },
      {
        text: `  Difference from guideline maximum    ${money(scenario.differenceFromGuidelineMaximum)}`,
        tone: "default",
      },
    ];
  }

  const askMatch = input.match(/^ask\s+["']?(.*?)["']?$/i);
  if (askMatch || lower.includes("better option") || lower.includes("best option")) {
    const q = askMatch?.[1]?.trim() || input;
    if (/better|best|option|forestern?s|alternative/i.test(q) || !askMatch) {
      const cv52 = buildCashValueAnalysis(ctx.ledger, 52, {
        illustratedCreditingRatePct: ctx.illustratedCreditingRatePct,
        fallbackAnnualPremium: ctx.annualPremium,
      });
      const opts = buildHypotheticalIulOptions({
        carrier: ctx.carrier,
        product: ctx.product,
        monthlyPremium: ctx.monthlyPremium,
        deathBenefit: ctx.deathBenefit,
        illustratedCashValueAtAge52: cv52.illustratedSurrenderValue,
        issueAge: ctx.issueAge,
      });
      const lines: PearTermLine[] = [
        ...brandLines(),
        { text: `Q  ${q}`, tone: "command" },
        { text: "A  Five hypothetical alternatives vs current case:", tone: "default" },
        { text: "", tone: "blank" },
      ];
      for (const o of opts.options) {
        lines.push({ text: `  ${o.rank}. ${o.carrier}`, tone: "accent" });
        lines.push({
          text: `     ${money(o.monthlyPremium)}/mo · DB ${money(o.deathBenefit)} · CV@52 ${money(o.illustratedCashValueAtAge52)}`,
          tone: "default",
        });
        lines.push({ text: `     ${o.highlight}`, tone: "success" });
        lines.push({ text: "", tone: "blank" });
      }
      lines.push({ text: `  ${opts.disclaimer}`, tone: "dim" });
      return lines;
    }
  }

  if (lower.startsWith("ask ")) {
    const q = askMatch?.[1] ?? input.slice(4).trim();
    if (/fund|no-?lapse/i.test(q)) {
      return runPear2CliCommand("funding");
    }
    if (/lapse|cessation/i.test(q)) {
      return runPear2CliCommand("lapse");
    }
    if (/cash|surrender|age\s+\d+/i.test(q)) {
      const age = q.match(/age\s+(\d+)/i)?.[1] ?? "52";
      return runPear2CliCommand(`cashvalue --age ${age}`);
    }
    if (/premium|what if|scenario/i.test(q)) {
      const p = q.match(/(\d+(?:\.\d+)?)/)?.[1] ?? "180";
      return runPear2CliCommand(`scenario --premium ${p}`);
    }
  }

  return [
    { text: `Unknown command: ${input}`, tone: "warn" },
    { text: 'Try: help | summary | funding | ask "any better options?"', tone: "dim" },
  ];
}
