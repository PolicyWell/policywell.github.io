import { modelFundingScenarios } from "./scenarios";
import type { IngestedDocument, UserProfile } from "./types";

export interface ComparisonRow {
  label: string;
  current: string;
  proposed: string;
  note?: string;
}

export interface ComparisonReport {
  currentName: string;
  proposedName: string;
  rows: ComparisonRow[];
  suitabilitySummary: string;
  questions: string[];
  warnings: string[];
  assumptions: string[];
  generatedAt: string;
}

function fmtMoney(v: number | null): string {
  return v == null ? "—" : `$${v.toLocaleString()}`;
}

function fmt(v: string | number | null): string {
  if (v == null) return "—";
  return typeof v === "number" ? `$${v.toLocaleString()}` : v;
}

/**
 * Deterministic side-by-side comparison of two ingested policy documents
 * (e.g. current IUL vs proposed FIA), with suitability questions and
 * 1035-exchange warnings. No LLM output — explainable rows only.
 */
export function comparePolicies(
  current: IngestedDocument,
  proposed: IngestedDocument,
  profile?: UserProfile,
): ComparisonReport {
  const a = current.extraction;
  const b = proposed.extraction;

  const rows: ComparisonRow[] = [
    {
      label: "Carrier",
      current: fmt(a.carrier.value),
      proposed: fmt(b.carrier.value),
    },
    {
      label: "Product type",
      current: fmt(a.productType.value),
      proposed: fmt(b.productType.value),
      note:
        a.productType.value !== b.productType.value
          ? "Different product categories — objectives differ (death benefit vs accumulation/income)."
          : undefined,
    },
    {
      label: "Face amount / death benefit",
      current: fmtMoney(a.deathBenefit.value ?? a.faceAmount.value),
      proposed: fmtMoney(b.deathBenefit.value ?? b.faceAmount.value),
      note:
        (b.deathBenefit.value ?? b.faceAmount.value ?? 0) <
        (a.deathBenefit.value ?? a.faceAmount.value ?? 0)
          ? "Proposed reduces death benefit protection."
          : undefined,
    },
    {
      label: "Cash / surrender value",
      current: fmtMoney(a.cashValue.value),
      proposed: fmtMoney(b.cashValue.value),
    },
    {
      label: "Annual premium",
      current: fmtMoney(a.currentPremium.value),
      proposed: fmtMoney(b.currentPremium.value),
    },
    {
      label: "Outstanding loans",
      current: fmtMoney(a.loans.value),
      proposed: fmtMoney(b.loans.value),
      note:
        (a.loans.value ?? 0) > 0
          ? "Loans on the surrendered policy can create taxable boot in a 1035 exchange."
          : undefined,
    },
    {
      label: "Riders",
      current: (a.riders.value ?? []).join(", ") || "—",
      proposed: (b.riders.value ?? []).join(", ") || "—",
    },
  ];

  const warnings: string[] = [];
  const questions: string[] = [];

  const isLifeToAnnuity =
    /life/i.test(a.productType.value ?? "") &&
    /annuity/i.test(b.productType.value ?? "");
  if (isLifeToAnnuity) {
    warnings.push(
      "Replacing life insurance with an annuity eliminates the income-tax-free death benefit. 1035 life→annuity is allowed, but annuity→life is not.",
    );
    if (profile?.household.dependentsCount.value) {
      warnings.push(
        `Household has ${profile.household.dependentsCount.value} dependents — confirm remaining protection covers survivor needs.`,
      );
    }
    questions.push("What replaces the death benefit protection after the exchange?");
  }

  warnings.push(
    "New surrender charge schedule likely restarts on the proposed contract.",
  );
  questions.push(
    "What are the surrender charges remaining on the current policy?",
    "Is the client insurable if life coverage is needed again later?",
    "Does the proposed product's liquidity match the client's time horizon?",
  );

  if ((a.currentPremium.value ?? 0) < (a.targetPremium.value ?? 0)) {
    questions.push(
      "Current policy is funded below target — would funding to target meet the objective without replacement?",
    );
  }

  const scenarios = modelFundingScenarios(a);
  const stopPay = scenarios.find((s) => s.name === "Stop paying");
  if (stopPay?.lapseYear) {
    warnings.push(
      `If premiums stop on the current policy, projected lapse in year ${stopPay.lapseYear} under documented assumptions.`,
    );
  }

  const suitabilitySummary =
    `Comparing ${a.carrier.value ?? "current"} ${a.productType.value ?? "policy"} against ` +
    `${b.carrier.value ?? "proposed"} ${b.productType.value ?? "product"}. ` +
    (isLifeToAnnuity
      ? "This is a protection-to-accumulation shift; suitability depends on whether the death benefit is still needed. "
      : "Products are in the same category; compare costs, crediting, and guarantees. ") +
    "Human advisor approval is required before any recommendation is presented to the client.";

  return {
    currentName: `${a.carrier.value ?? "Current"} — ${a.productName.value ?? a.productType.value ?? current.filename}`,
    proposedName: `${b.carrier.value ?? "Proposed"} — ${b.productName.value ?? b.productType.value ?? proposed.filename}`,
    rows,
    suitabilitySummary,
    questions,
    warnings,
    assumptions: [
      ...new Set([...(a.assumptions ?? []), ...(b.assumptions ?? []), ...(stopPay?.assumptions ?? [])]),
    ],
    generatedAt: new Date().toISOString(),
  };
}
