export type LedgerRowLike = {
  policy_year: number;
  attained_age: number | null;
  annual_premium_outlay?: number | null;
  guaranteed_accumulation_value?: number | null;
  guaranteed_surrender_value: number | null;
  guaranteed_death_benefit: number | null;
  alternate_accumulation_value?: number | null;
  alternate_surrender_value: number | null;
  alternate_death_benefit: number | null;
  illustrated_accumulation_value?: number | null;
  illustrated_surrender_value: number | null;
  illustrated_death_benefit: number | null;
};

export type CashValueLookup = {
  requestedAge: number;
  matchedAge: number | null;
  matchKind: "exact" | "closest" | "none";
  policyYear: number | null;
  guaranteedSurrenderValue: number | null;
  alternateSurrenderValue: number | null;
  illustratedSurrenderValue: number | null;
  deathBenefit: number | null;
  labels: {
    guaranteedSurrenderValue: string;
    alternateSurrenderValue: string;
    illustratedSurrenderValue: string;
    deathBenefit: string;
  };
};

export type CashValueAnalysis = CashValueLookup & {
  cumulativePremiumOutlay: number | null;
  guaranteedAccumulationValue: number | null;
  alternateAccumulationValue: number | null;
  illustratedAccumulationValue: number | null;
  /** Illustrated AV − cumulative premiums (net of COI/charges on the illustrated path). */
  illustratedNetOfCharges: number | null;
  illustratedCreditingRatePct: number | null;
  disclaimer: string;
};

export const CASH_VALUE_ILLUSTRATED_DISCLAIMER =
  "Illustrated path only. Actual COI charges and index interest credited require an in-force illustration or annual statement.";

function deathBenefitFromRow(row: LedgerRowLike): number | null {
  return (
    row.illustrated_death_benefit ??
    row.alternate_death_benefit ??
    row.guaranteed_death_benefit
  );
}

function num(v: number | null | undefined): number | null {
  if (v == null || Number.isNaN(Number(v))) return null;
  return Number(v);
}

export function findCashValueAtAge(
  rows: LedgerRowLike[],
  age: number,
): CashValueLookup {
  const target = Math.round(Number(age));
  const withAge = rows.filter((r) => r.attained_age != null);
  if (withAge.length === 0 || !Number.isFinite(target)) {
    return {
      requestedAge: target,
      matchedAge: null,
      matchKind: "none",
      policyYear: null,
      guaranteedSurrenderValue: null,
      alternateSurrenderValue: null,
      illustratedSurrenderValue: null,
      deathBenefit: null,
      labels: {
        guaranteedSurrenderValue: "Guaranteed surrender value",
        alternateSurrenderValue: "Alternate surrender value (non-guaranteed)",
        illustratedSurrenderValue: "Illustrated surrender value (non-guaranteed)",
        deathBenefit: "Death benefit",
      },
    };
  }

  const exact = withAge.find((r) => Number(r.attained_age) === target);
  const matched =
    exact ??
    withAge.reduce((best, row) => {
      const bestAge = Number(best.attained_age);
      const rowAge = Number(row.attained_age);
      const bestDist = Math.abs(bestAge - target);
      const dist = Math.abs(rowAge - target);
      // Prefer closer; on ties prefer the higher attained age (don't drop a year).
      if (dist < bestDist) return row;
      if (dist === bestDist && rowAge > bestAge) return row;
      return best;
    });

  return {
    requestedAge: target,
    matchedAge: matched.attained_age,
    matchKind: exact ? "exact" : "closest",
    policyYear: matched.policy_year,
    guaranteedSurrenderValue: matched.guaranteed_surrender_value,
    alternateSurrenderValue: matched.alternate_surrender_value,
    illustratedSurrenderValue: matched.illustrated_surrender_value,
    deathBenefit: deathBenefitFromRow(matched),
    labels: {
      guaranteedSurrenderValue: "Guaranteed surrender value",
      alternateSurrenderValue: "Alternate surrender value (non-guaranteed)",
      illustratedSurrenderValue: "Illustrated surrender value (non-guaranteed)",
      deathBenefit: "Death benefit",
    },
  };
}

/**
 * Deterministic cash-value breakdown for live demos.
 * Does not invent actual in-force COI or realized index credits.
 */
export function buildCashValueAnalysis(
  rows: LedgerRowLike[],
  age: number,
  options?: {
    illustratedCreditingRatePct?: number | null;
    fallbackAnnualPremium?: number | null;
  },
): CashValueAnalysis {
  const base = findCashValueAtAge(rows, age);
  const matched =
    rows.find(
      (r) =>
        r.attained_age === base.matchedAge &&
        r.policy_year === base.policyYear,
    ) ?? null;

  const annual =
    num(matched?.annual_premium_outlay) ??
    num(options?.fallbackAnnualPremium) ??
    null;
  const years = base.policyYear;
  const cumulativePremiumOutlay =
    annual != null && years != null ? annual * years : null;

  const illustratedAccumulationValue = num(
    matched?.illustrated_accumulation_value,
  );
  const alternateAccumulationValue = num(matched?.alternate_accumulation_value);
  const guaranteedAccumulationValue = num(
    matched?.guaranteed_accumulation_value,
  );

  const illustratedNetOfCharges =
    illustratedAccumulationValue != null && cumulativePremiumOutlay != null
      ? illustratedAccumulationValue - cumulativePremiumOutlay
      : null;

  return {
    ...base,
    cumulativePremiumOutlay,
    guaranteedAccumulationValue,
    alternateAccumulationValue,
    illustratedAccumulationValue,
    illustratedNetOfCharges,
    illustratedCreditingRatePct: options?.illustratedCreditingRatePct ?? null,
    disclaimer: CASH_VALUE_ILLUSTRATED_DISCLAIMER,
  };
}
