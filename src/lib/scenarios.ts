import type { ExtractedPolicyData } from "./types";

export interface ScenarioYear {
  year: number;
  cashValue: number;
  coi: number;
}

export interface ScenarioResult {
  name: string;
  annualPremium: number;
  years: ScenarioYear[];
  lapseYear: number | null;
  endingCashValue: number;
  assumptions: string[];
}

export interface ScenarioInputs {
  startingCashValue: number;
  annualPremium: number;
  annualCoi: number;
  creditRate?: number;
  coiGrowthRate?: number;
  horizonYears?: number;
}

const DEFAULT_CREDIT_RATE = 0.05;
const DEFAULT_COI_GROWTH = 0.03;
const DEFAULT_HORIZON = 30;

/**
 * Deterministic annual policy projection.
 * cash_{t+1} = (cash_t + premium - COI_t) * (1 + creditRate)
 * COI grows at a fixed documented rate. Lapse = cash value falls below zero.
 */
export function runScenario(name: string, inputs: ScenarioInputs): ScenarioResult {
  const creditRate = inputs.creditRate ?? DEFAULT_CREDIT_RATE;
  const coiGrowth = inputs.coiGrowthRate ?? DEFAULT_COI_GROWTH;
  const horizon = inputs.horizonYears ?? DEFAULT_HORIZON;

  const years: ScenarioYear[] = [];
  let cash = inputs.startingCashValue;
  let coi = inputs.annualCoi;
  let lapseYear: number | null = null;

  for (let year = 1; year <= horizon; year++) {
    cash = (cash + inputs.annualPremium - coi) * (1 + creditRate);
    years.push({
      year,
      cashValue: Math.round(cash),
      coi: Math.round(coi),
    });
    if (cash < 0 && lapseYear === null) {
      lapseYear = year;
      break;
    }
    coi = coi * (1 + coiGrowth);
  }

  return {
    name,
    annualPremium: inputs.annualPremium,
    years,
    lapseYear,
    endingCashValue: Math.round(cash),
    assumptions: [
      `Illustrated crediting rate ${(creditRate * 100).toFixed(1)}% (non-guaranteed).`,
      `COI grows ${(coiGrowth * 100).toFixed(1)}% per year from $${Math.round(inputs.annualCoi).toLocaleString()}.`,
      `Projection horizon ${horizon} years; lapse = cash value below zero.`,
      "Simplified model — carrier in-force illustration controls.",
    ],
  };
}

/** Standard three-scenario set: current funding, target funding, stop paying. */
export function modelFundingScenarios(
  extraction: ExtractedPolicyData,
  horizonYears = DEFAULT_HORIZON,
): ScenarioResult[] {
  const cash = extraction.cashValue.value ?? 0;
  const coi = extraction.coi.value ?? 0;
  const current = extraction.currentPremium.value ?? 0;
  const target = extraction.targetPremium.value ?? current;

  return [
    runScenario("Current funding", {
      startingCashValue: cash,
      annualPremium: current,
      annualCoi: coi,
      horizonYears,
    }),
    runScenario("Target funding", {
      startingCashValue: cash,
      annualPremium: target,
      annualCoi: coi,
      horizonYears,
    }),
    runScenario("Stop paying", {
      startingCashValue: cash,
      annualPremium: 0,
      annualCoi: coi,
      horizonYears,
    }),
  ];
}
