import type { AskContext } from "@/lib/v1/ask";
import { speakAge, speakLivePhrase } from "@/lib/pear-speech";
import { getPearMalikAskContext } from "@/lib/v1/pear-malik-context";

export type IngestField = { label: string; value: string };

export type PearIngestStep = {
  id: string;
  label: string;
  detail: string;
  spoken: string;
  /** Fields revealed after this step completes */
  fields?: IngestField[];
};

function money(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function buildPearIngestSteps(
  filename: string,
  ctx: AskContext = getPearMalikAskContext(),
): PearIngestStep[] {
  const shortName = filename.replace(/^.*[\\/]/, "") || "illustration.pdf";
  return [
    {
      id: "receive",
      label: "Receiving document",
      detail: `Uploading ${shortName} into the well`,
      spoken: `Receiving ${shortName} into the well.`,
      fields: [{ label: "Document", value: shortName }],
    },
    {
      id: "read",
      label: "Reading illustration",
      detail: "Parsing pages, riders, and ledger tables",
      spoken:
        "Reading the illustration pages, riders, and year-by-year ledger tables.",
    },
    {
      id: "identity",
      label: "Identifying case",
      detail: "Carrier, product, and insured",
      spoken: `Identified ${ctx.insuredName}. Carrier United of Omaha. Product ${ctx.product}.`,
      fields: [
        { label: "Insured", value: ctx.insuredName ?? "—" },
        { label: "Carrier", value: ctx.carrier ?? "—" },
        { label: "Product", value: ctx.product ?? "—" },
      ],
    },
    {
      id: "terms",
      label: "Extracting coverage terms",
      detail: "Death benefit, premiums, issue age",
      spoken: `Issue ${speakAge(ctx.issueAge ?? 0)}. Death benefit ${money(ctx.deathBenefit)}. Planned premium ${money(ctx.monthlyPremium)} per month, or ${money(ctx.annualPremium)} annually.`,
      fields: [
        { label: "Issue age", value: String(ctx.issueAge ?? "—") },
        { label: "Death benefit", value: money(ctx.deathBenefit) },
        { label: "Monthly premium", value: money(ctx.monthlyPremium) },
        { label: "Annual premium", value: money(ctx.annualPremium) },
      ],
    },
    {
      id: "funding",
      label: "Synthesizing funding stance",
      detail: "No-lapse threshold and guideline room",
      spoken: `No-lapse annual premium ${money(ctx.noLapseAnnualPremium)}. Guideline maximum level ${money(ctx.guidelineMaximumLevelPremium)}. Planned funding sits above the no-lapse threshold with room left to the guideline max.`,
      fields: [
        { label: "No-lapse annual", value: money(ctx.noLapseAnnualPremium) },
        {
          label: "Guideline max (level)",
          value: money(ctx.guidelineMaximumLevelPremium),
        },
        { label: "Funding stance", value: "Above no-lapse" },
      ],
    },
    {
      id: "lapse",
      label: "Mapping duration risk",
      detail: "Guaranteed and midpoint cessation ages",
      spoken: `Guaranteed coverage ceases around ${speakAge(ctx.guaranteedCessationAge ?? 0)}. Midpoint around ${speakAge(ctx.midpointCessationAge ?? 0)}. Illustrated crediting assumption ${ctx.illustratedCreditingRatePct} percent.`,
      fields: [
        {
          label: "Guaranteed cease",
          value: `Age ${ctx.guaranteedCessationAge}`,
        },
        {
          label: "Midpoint cease",
          value: `Age ${ctx.midpointCessationAge}`,
        },
        {
          label: "Illustrated rate",
          value: `${ctx.illustratedCreditingRatePct}%`,
        },
      ],
    },
    {
      id: "ready",
      label: "Synthesis ready",
      detail: "Ask funding, lapse, cash value, scenarios, or better options",
      spoken: `Synthesis complete for the Pear X 27 ${speakLivePhrase("demo")}. I can answer funding, lapse, cash value, premium scenarios, or better options including Foresters. What should we look at first?`,
    },
  ];
}

export function buildIngestCompleteMessage(ctx: AskContext, filename: string): {
  content: string;
  spokenScript: string;
} {
  const shortName = filename.replace(/^.*[\\/]/, "") || "illustration.pdf";
  return {
    content: [
      `I’ve ingested ${shortName} and synthesized ${ctx.insuredName}'s ${ctx.product}.`,
      `${money(ctx.monthlyPremium)}/mo · DB ${money(ctx.deathBenefit)} · issue age ${ctx.issueAge}.`,
      `Funding is above no-lapse; guaranteed cease ~${ctx.guaranteedCessationAge}, midpoint ~${ctx.midpointCessationAge}.`,
      "Ask me anything — funding, lapse, cash value at an age, a premium scenario, or better options.",
    ].join(" "),
    spokenScript: [
      `I’ve ingested the illustration and synthesized ${ctx.insuredName}'s policy.`,
      `Ask me about funding, lapse, cash value, scenarios, or better options.`,
    ].join(" "),
  };
}
