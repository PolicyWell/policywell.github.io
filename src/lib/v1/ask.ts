import {
  calculateFundingAnalysis,
  calculateScenarioAnalysis,
  SCENARIO_DISCLAIMER,
} from "@/lib/v1/funding";
import {
  buildCashValueAnalysis,
  type LedgerRowLike,
} from "@/lib/v1/cashvalue";
import {
  buildLapseResult,
  ORIGINAL_ILLUSTRATION_LAPSE_NOTE,
} from "@/lib/v1/lapse";
import {
  buildHypotheticalIulOptions,
  formatCompetitiveOptionsAnswer,
  isBetterOptionsQuestion,
  type CompetitiveOption,
} from "@/lib/v1/competitive-options";

export type AskContext = {
  insuredName: string | null;
  carrier: string | null;
  product: string | null;
  issueAge: number | null;
  deathBenefit: number | null;
  monthlyPremium: number | null;
  annualPremium: number | null;
  noLapseAnnualPremium: number | null;
  guidelineMaximumLevelPremium: number | null;
  guaranteedCessationAge: number | null;
  midpointCessationAge: number | null;
  illustratedDurationYears: number | null;
  documentType: string | null;
  illustratedCreditingRatePct: number | null;
  ledger: LedgerRowLike[];
};

export type AskAnswer = {
  question: string;
  intent: string;
  answer: string;
  math: Record<string, number | string | null>;
  options?: CompetitiveOption[];
  disclaimer: string | null;
};

function money(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function extractAge(q: string): number | null {
  const digit =
    q.match(/\bage\s+(\d{1,3})\b/i) ||
    q.match(/\bat\s+(?:age\s+)?(\d{1,3})\b/i) ||
    q.match(/\$?--age\s+(\d{1,3})\b/i) ||
    q.match(/\b(\d{2,3})\s*$/);
  if (digit?.[1]) return Number(digit[1]);

  // Voice transcripts: "age fifty six" / "age fifty-six"
  const words = q.match(
    /\bage\s+(twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)(?:[-\s]+(one|two|three|four|five|six|seven|eight|nine))?\b/i,
  );
  if (words) {
    const tensMap: Record<string, number> = {
      twenty: 20,
      thirty: 30,
      forty: 40,
      fifty: 50,
      sixty: 60,
      seventy: 70,
      eighty: 80,
      ninety: 90,
    };
    const onesMap: Record<string, number> = {
      one: 1,
      two: 2,
      three: 3,
      four: 4,
      five: 5,
      six: 6,
      seven: 7,
      eight: 8,
      nine: 9,
    };
    const tens = tensMap[words[1]!.toLowerCase()] ?? 0;
    const ones = words[2] ? (onesMap[words[2].toLowerCase()] ?? 0) : 0;
    return tens + ones;
  }
  return null;
}

function extractPremium(q: string): number | null {
  const m =
    q.match(/\$?\s*(\d+(?:\.\d+)?)\s*(?:\/\s*mo|per month|monthly)?/i) ||
    q.match(/premium\s+(?:of\s+)?\$?(\d+(?:\.\d+)?)/i);
  return m ? Number(m[1]) : null;
}

/**
 * Map natural live-demo questions to deterministic math (no LLM).
 */
export function answerLiveQuestion(question: string, ctx: AskContext): AskAnswer {
  const q = question.trim();
  const lower = q.toLowerCase();

  if (isBetterOptionsQuestion(lower)) {
    const cv52 = buildCashValueAnalysis(ctx.ledger, 52, {
      illustratedCreditingRatePct: ctx.illustratedCreditingRatePct,
      fallbackAnnualPremium: ctx.annualPremium,
    });
    const result = buildHypotheticalIulOptions({
      carrier: ctx.carrier,
      product: ctx.product,
      monthlyPremium: ctx.monthlyPremium,
      deathBenefit: ctx.deathBenefit,
      illustratedCashValueAtAge52: cv52.illustratedSurrenderValue,
      issueAge: ctx.issueAge,
    });
    return {
      question: q,
      intent: "better_options",
      answer: formatCompetitiveOptionsAnswer(result),
      math: {
        baselineMonthly: result.baseline.monthlyPremium,
        baselineDeathBenefit: result.baseline.deathBenefit,
        baselineCv52: result.baseline.illustratedCashValueAtAge52,
        optionCount: result.options.length,
      },
      options: result.options,
      disclaimer: result.disclaimer,
    };
  }

  if (/who|insured|client name|whose policy/.test(lower)) {
    return {
      question: q,
      intent: "identity",
      answer: `${ctx.insuredName ?? "Unknown insured"} — ${ctx.carrier ?? "carrier n/a"}, ${ctx.product ?? "product n/a"}.`,
      math: {
        insuredName: ctx.insuredName,
        carrier: ctx.carrier,
        product: ctx.product,
        issueAge: ctx.issueAge,
        deathBenefit: ctx.deathBenefit,
      },
      disclaimer: null,
    };
  }

  if (/fund|overfund|underfund|no-?lapse|guideline|gmlp|room/.test(lower)) {
    const monthly = ctx.monthlyPremium ?? 0;
    const funding = calculateFundingAnalysis({
      monthlyPremium: monthly,
      noLapseAnnualPremium: ctx.noLapseAnnualPremium ?? 0,
      guidelineMaximumLevelPremium: ctx.guidelineMaximumLevelPremium ?? 0,
    });
    const stance =
      funding.amountAboveNoLapse >= 0
        ? `Annual funding is ${money(funding.amountAboveNoLapse)} above the no-lapse annual premium.`
        : `Annual funding is ${money(Math.abs(funding.amountAboveNoLapse))} below the no-lapse annual premium.`;
    return {
      question: q,
      intent: "funding",
      answer: `Monthly ${money(funding.monthlyPremium)} → annual ${money(funding.annualFunding)}. ${stance} Remaining guideline room: ${money(funding.remainingGuidelineRoom)}.`,
      math: { ...funding },
      disclaimer: null,
    };
  }

  if (/lapse|cessation|how long|guaranteed.*age|midpoint/.test(lower)) {
    const lapse = buildLapseResult({
      guaranteedCoverageCessationAge: ctx.guaranteedCessationAge,
      midpointCoverageCessationAge: ctx.midpointCessationAge,
      illustratedDurationYears: ctx.illustratedDurationYears,
      documentType: ctx.documentType,
    });
    return {
      question: q,
      intent: "lapse",
      answer: `Guaranteed coverage ceases at age ${lapse.guaranteedCessationAge ?? "—"}; midpoint at age ${lapse.midpointCessationAge ?? "—"}.`,
      math: {
        guaranteedCessationAge: lapse.guaranteedCessationAge,
        midpointCessationAge: lapse.midpointCessationAge,
        illustratedDurationYears: lapse.illustratedDurationYears,
      },
      disclaimer: lapse.notes[0] ?? ORIGINAL_ILLUSTRATION_LAPSE_NOTE,
    };
  }

  if (/cash|surrender|cv\b|value at|coi|interest|accumulation/.test(lower)) {
    const age = extractAge(lower) ?? 52;
    const hit = buildCashValueAnalysis(ctx.ledger, age, {
      illustratedCreditingRatePct: ctx.illustratedCreditingRatePct,
      fallbackAnnualPremium: ctx.annualPremium,
    });
    const reportAge = hit.requestedAge;
    const netLabel =
      hit.illustratedNetOfCharges == null
        ? "—"
        : hit.illustratedNetOfCharges >= 0
          ? `+${money(hit.illustratedNetOfCharges)} net of charges on illustrated path`
          : `${money(hit.illustratedNetOfCharges)} net of charges on illustrated path`;
    const rate =
      hit.illustratedCreditingRatePct != null
        ? `${hit.illustratedCreditingRatePct}% illustrated crediting`
        : "illustrated crediting rate n/a";
    const ageNote =
      hit.matchKind === "closest" && hit.matchedAge != null
        ? ` (nearest ledger age ${hit.matchedAge})`
        : "";
    return {
      question: q,
      intent: "cashvalue",
      answer: `At age ${reportAge}${ageNote}: premiums paid ${money(hit.cumulativePremiumOutlay)}; illustrated AV ${money(hit.illustratedAccumulationValue)}; illustrated SV ${money(hit.illustratedSurrenderValue)}; ${netLabel}; DB ${money(hit.deathBenefit)} (${rate}).`,
      math: {
        requestedAge: hit.requestedAge,
        matchedAge: hit.matchedAge,
        cumulativePremiumOutlay: hit.cumulativePremiumOutlay,
        illustratedAccumulationValue: hit.illustratedAccumulationValue,
        illustratedSurrenderValue: hit.illustratedSurrenderValue,
        illustratedNetOfCharges: hit.illustratedNetOfCharges,
        guaranteedSurrenderValue: hit.guaranteedSurrenderValue,
        alternateSurrenderValue: hit.alternateSurrenderValue,
        deathBenefit: hit.deathBenefit,
        illustratedCreditingRatePct: hit.illustratedCreditingRatePct,
      },
      disclaimer: hit.disclaimer,
    };
  }

  if (/scenario|what if|increase|pay\s+\$|premium/.test(lower) && extractPremium(lower) != null) {
    const newMonthly = extractPremium(lower) as number;
    const scenario = calculateScenarioAnalysis({
      currentMonthlyPremium: ctx.monthlyPremium ?? 0,
      newMonthlyPremium: newMonthly,
      guidelineMaximumLevelPremium: ctx.guidelineMaximumLevelPremium ?? 0,
    });
    return {
      question: q,
      intent: "scenario",
      answer: `If monthly premium is ${money(scenario.newMonthlyPremium)} → annual ${money(scenario.newAnnualPremium)}; additional annual funding ${money(scenario.additionalAnnualFunding)}; vs guideline max ${money(scenario.differenceFromGuidelineMaximum)}.`,
      math: { ...scenario },
      disclaimer: SCENARIO_DISCLAIMER,
    };
  }

  if (/death benefit|face amount|coverage amount/.test(lower)) {
    return {
      question: q,
      intent: "death_benefit",
      answer: `Initial death benefit is ${money(ctx.deathBenefit)} (level option on the illustration).`,
      math: { deathBenefit: ctx.deathBenefit },
      disclaimer: null,
    };
  }

  // Default: point operator to structured commands
  return {
    question: q,
    intent: "help",
    answer:
      'Try: funding | lapse | cash value at age 52 | what if premium 180 | best options | who is insured',
    math: {},
    disclaimer: null,
  };
}
