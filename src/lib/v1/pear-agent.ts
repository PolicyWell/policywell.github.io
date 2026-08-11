import {
  answerLiveQuestion,
  type AskAnswer,
  type AskContext,
} from "@/lib/v1/ask";
import type { CompetitiveOption } from "@/lib/v1/competitive-options";
import { speakAge, speakLivePhrase } from "@/lib/pear-speech";

export type PearChatReply = {
  intent: string;
  text: string;
  /** Shorter script optimized for text-to-speech narration. */
  spokenScript: string;
  options?: CompetitiveOption[];
  disclaimer: string | null;
  math: AskAnswer["math"];
};

function money(n: number | string | null | undefined): string {
  if (n == null || n === "" || Number.isNaN(Number(n))) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(n));
}

function isGreeting(q: string): boolean {
  return /^(hi|hello|hey|yo|good (morning|afternoon|evening))\b/.test(q);
}

function isSummary(q: string): boolean {
  return (
    /summary|overview|tell me about|what('s| is) (this|the) policy|walk me through|snapshot/.test(
      q,
    ) || /who is (the )?(insured|client)/.test(q)
  );
}

/**
 * Conversational Pear agent — same deterministic math as the CLI `ask` path,
 * phrased for a live advisor chat.
 */
export function answerPearConversation(
  question: string,
  ctx: AskContext,
): PearChatReply {
  const q = question.trim();
  const lower = q.toLowerCase();

  if (!q || isGreeting(lower)) {
    const text = [
      `You're looking at ${PEAR_CASE_LABEL(ctx)}.`,
      "Ask me anything the live terminal can answer — funding, lapse ages, cash value at a target age, premium scenarios, or better IUL options (including Foresters).",
    ].join(" ");
    return {
      intent: "welcome",
      text,
      spokenScript: `Welcome to the Pear X 27 ${speakLivePhrase("demo")}. You're looking at ${ctx.insuredName}'s indexed universal life illustration with United of Omaha. Ask about funding, lapse, cash value, premium scenarios, or better options including Foresters.`,
      disclaimer: null,
      math: {},
    };
  }

  if (isSummary(lower) && !/better|best|option|forestern?s/.test(lower)) {
    const text = [
      `${ctx.insuredName} is illustrated on ${ctx.carrier}'s ${ctx.product}.`,
      `Issue age ${ctx.issueAge}, level death benefit ${money(ctx.deathBenefit)}, planned premium ${money(ctx.monthlyPremium)}/mo (${money(ctx.annualPremium)}/yr).`,
      `No-lapse annual premium is ${money(ctx.noLapseAnnualPremium)}; guideline maximum level is ${money(ctx.guidelineMaximumLevelPremium)}.`,
      `Guaranteed coverage ceases around age ${ctx.guaranteedCessationAge}; midpoint around age ${ctx.midpointCessationAge}. Illustrated crediting assumption ${ctx.illustratedCreditingRatePct}%.`,
      "Want funding stance, cash value at 52, a premium scenario, or competitive alternatives next?",
    ].join(" ");
    return {
      intent: "summary",
      text,
      spokenScript: [
        `Simulation summary for ${ctx.insuredName}.`,
        `${ctx.product} from United of Omaha.`,
        `Issue ${speakAge(ctx.issueAge ?? 0)}, death benefit ${money(ctx.deathBenefit)}, planned premium ${money(ctx.monthlyPremium)} per month.`,
        `No-lapse premium ${money(ctx.noLapseAnnualPremium)} annually.`,
        `Guaranteed coverage ceases around ${speakAge(ctx.guaranteedCessationAge ?? 0)}, midpoint around ${speakAge(ctx.midpointCessationAge ?? 0)}.`,
      ].join(" "),
      disclaimer:
        "Based on the original illustration seed for this live demo — not an in-force illustration.",
      math: {
        insuredName: ctx.insuredName,
        deathBenefit: ctx.deathBenefit,
        monthlyPremium: ctx.monthlyPremium,
        annualPremium: ctx.annualPremium,
      },
    };
  }

  const base = answerLiveQuestion(q, ctx);
  return conversationalize(base, ctx);
}

function PEAR_CASE_LABEL(ctx: AskContext): string {
  return `${ctx.insuredName}'s ${ctx.product} (${ctx.carrier})`;
}

function conversationalize(base: AskAnswer, ctx: AskContext): PearChatReply {
  switch (base.intent) {
    case "identity": {
      const text = `The insured on this case is ${ctx.insuredName} — ${ctx.carrier}, ${ctx.product}, issue age ${ctx.issueAge}.`;
      return {
        intent: base.intent,
        text,
        spokenScript: text,
        disclaimer: null,
        math: base.math,
      };
    }
    case "funding": {
      const above = Number(base.math.amountAboveNoLapse) >= 0;
      const text = [
        `On planned premiums, annual funding lands at ${money(base.math.annualFunding)} (${money(base.math.monthlyPremium)}/mo).`,
        above
          ? `That’s ${money(base.math.amountAboveNoLapse)} above the no-lapse annual premium of ${money(base.math.noLapseAnnualPremium)} — so this illustration is funded above the no-lapse threshold.`
          : `That’s ${money(Math.abs(Number(base.math.amountAboveNoLapse)))} below the no-lapse annual premium of ${money(base.math.noLapseAnnualPremium)}.`,
        `Guideline room left versus GMLP: ${money(base.math.remainingGuidelineRoom)}.`,
      ].join(" ");
      return {
        intent: base.intent,
        text,
        spokenScript: [
          "Funding simulation.",
          `Annual funding ${money(base.math.annualFunding)}.`,
          above
            ? `That is ${money(base.math.amountAboveNoLapse)} above the no-lapse premium.`
            : `That is ${money(Math.abs(Number(base.math.amountAboveNoLapse)))} below the no-lapse premium.`,
          `Guideline room remaining: ${money(base.math.remainingGuidelineRoom)}.`,
        ].join(" "),
        disclaimer: base.disclaimer,
        math: base.math,
      };
    }
    case "lapse": {
      const guar = Number(base.math.guaranteedCessationAge);
      const mid = Number(base.math.midpointCessationAge);
      const text = [
        `On the guaranteed path, coverage is illustrated to cease around age ${base.math.guaranteedCessationAge}.`,
        `On the midpoint path, around age ${base.math.midpointCessationAge}.`,
        "That’s duration risk from the original illustration — an in-force run can move these ages.",
      ].join(" ");
      return {
        intent: base.intent,
        text,
        spokenScript: [
          "Lapse simulation.",
          `Guaranteed coverage ceases around ${speakAge(guar)}.`,
          `Midpoint path around ${speakAge(mid)}.`,
        ].join(" "),
        disclaimer: base.disclaimer,
        math: base.math,
      };
    }
    case "cashvalue": {
      const requested = Number(base.math.requestedAge);
      const matched = Number(base.math.matchedAge);
      const displayAge = Number.isFinite(requested) ? requested : matched;
      const ledgerNote =
        Number.isFinite(matched) &&
        Number.isFinite(requested) &&
        matched !== requested
          ? ` (nearest ledger ${speakAge(matched)})`
          : "";
      const text = [
        `At age ${displayAge} on the illustrated path${
          matched !== requested && Number.isFinite(matched)
            ? ` (ledger age ${matched})`
            : ""
        }:`,
        `premiums paid ${money(base.math.cumulativePremiumOutlay)},`,
        `illustrated accumulation ${money(base.math.illustratedAccumulationValue)},`,
        `illustrated surrender ${money(base.math.illustratedSurrenderValue)},`,
        Number(base.math.illustratedNetOfCharges) >= 0
          ? `about ${money(base.math.illustratedNetOfCharges)} ahead of premiums paid on the illustrated path,`
          : `about ${money(base.math.illustratedNetOfCharges)} behind premiums paid on the illustrated path,`,
        `with death benefit still ${money(base.math.deathBenefit)}.`,
        base.math.illustratedCreditingRatePct != null
          ? `Crediting assumption shown: ${base.math.illustratedCreditingRatePct}%.`
          : "",
      ]
        .filter(Boolean)
        .join(" ");
      return {
        intent: base.intent,
        text,
        spokenScript: [
          `Cash value simulation at ${speakAge(displayAge)}${ledgerNote}.`,
          `Premiums paid ${money(base.math.cumulativePremiumOutlay)}.`,
          `Illustrated surrender value ${money(base.math.illustratedSurrenderValue)}.`,
          `Net of charges about ${money(base.math.illustratedNetOfCharges)}.`,
          `Death benefit ${money(base.math.deathBenefit)}.`,
        ].join(" "),
        disclaimer: base.disclaimer,
        math: base.math,
      };
    }
    case "scenario": {
      const text = [
        `If we move monthly premium to ${money(base.math.newMonthlyPremium)}, annual outlay becomes ${money(base.math.newAnnualPremium)}.`,
        `That’s ${money(base.math.additionalAnnualFunding)} of additional annual funding versus today’s plan,`,
        `and ${money(base.math.differenceFromGuidelineMaximum)} relative to the guideline maximum level premium.`,
      ].join(" ");
      return {
        intent: base.intent,
        text,
        spokenScript: [
          "Premium scenario simulation.",
          `New monthly premium ${money(base.math.newMonthlyPremium)}.`,
          `New annual outlay ${money(base.math.newAnnualPremium)}.`,
          `Additional annual funding ${money(base.math.additionalAnnualFunding)}.`,
        ].join(" "),
        disclaimer: base.disclaimer,
        math: base.math,
      };
    }
    case "death_benefit": {
      const text = `Initial illustrated death benefit is ${money(ctx.deathBenefit)} on a level option.`;
      return {
        intent: base.intent,
        text,
        spokenScript: text,
        disclaimer: null,
        math: base.math,
      };
    }
    case "better_options": {
      const top = base.options?.[0];
      const text = [
        `Against ${ctx.carrier} ${ctx.product} at ${money(ctx.monthlyPremium)}/mo and ${money(ctx.deathBenefit)} of death benefit, here are five hypothetical alternatives that improve cash-value and/or death-benefit positioning — led by Foresters Financial.`,
        "These are discussion designs only, not carrier quotes.",
      ].join(" ");
      return {
        intent: base.intent,
        text,
        spokenScript: [
          "Competitive options simulation. Five hypothetical alternatives.",
          top
            ? `Option one: Foresters Financial. About ${money(top.monthlyPremium)} per month, death benefit ${money(top.deathBenefit)}, illustrated cash value at fifty-two ${money(top.illustratedCashValueAtAge52)}. ${top.highlight}.`
            : "Led by Foresters Financial.",
          "Remaining options include Allianz, National Life, Pacific Life, and John Hancock. These are discussion designs only, not carrier quotes.",
        ].join(" "),
        options: base.options,
        disclaimer: base.disclaimer,
        math: base.math,
      };
    }
    default:
      return {
        intent: base.intent,
        text: [
          base.answer,
          "",
          "Try asking: “Is this funded?”, “When does it lapse?”, “Cash value at 52”, “What if premium 180?”, or “Any better options?”",
        ].join("\n"),
        spokenScript:
          "I can run funding, lapse, cash value, premium scenarios, or better options. Try asking if this is funded, or any better options.",
        disclaimer: null,
        math: base.math,
      };
  }
}
