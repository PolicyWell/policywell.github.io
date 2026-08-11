/**
 * Deterministic funding math for life-illustration demo analysis.
 * Do not use AI for these calculations.
 */

export type FundingInputs = {
  monthlyPremium: number;
  noLapseAnnualPremium: number;
  guidelineMaximumLevelPremium: number;
};

export type FundingAnalysis = {
  monthlyPremium: number;
  annualFunding: number;
  noLapseAnnualPremium: number;
  amountAboveNoLapse: number;
  fundingRatio: number | null;
  guidelineMaximumLevelPremium: number;
  remainingGuidelineRoom: number;
};

export function calculateFundingAnalysis(inputs: FundingInputs): FundingAnalysis {
  const monthlyPremium = inputs.monthlyPremium;
  const annualFunding = monthlyPremium * 12;
  const noLapseAnnualPremium = inputs.noLapseAnnualPremium;
  const guidelineMaximumLevelPremium = inputs.guidelineMaximumLevelPremium;

  const amountAboveNoLapse = annualFunding - noLapseAnnualPremium;
  const fundingRatio =
    noLapseAnnualPremium === 0 ? null : annualFunding / noLapseAnnualPremium;
  const remainingGuidelineRoom = guidelineMaximumLevelPremium - annualFunding;

  return {
    monthlyPremium,
    annualFunding,
    noLapseAnnualPremium,
    amountAboveNoLapse,
    fundingRatio,
    guidelineMaximumLevelPremium,
    remainingGuidelineRoom,
  };
}

export type ScenarioInputs = {
  currentMonthlyPremium: number;
  newMonthlyPremium: number;
  guidelineMaximumLevelPremium: number;
};

export type ScenarioAnalysis = {
  newMonthlyPremium: number;
  newAnnualPremium: number;
  additionalAnnualFunding: number;
  differenceFromGuidelineMaximum: number;
  disclaimer: string;
};

export const SCENARIO_DISCLAIMER =
  "Scenario analysis only. Exact future values require carrier reillustration.";

export function calculateScenarioAnalysis(inputs: ScenarioInputs): ScenarioAnalysis {
  const newMonthlyPremium = inputs.newMonthlyPremium;
  const newAnnualPremium = newMonthlyPremium * 12;
  const currentAnnual = inputs.currentMonthlyPremium * 12;
  const additionalAnnualFunding = newAnnualPremium - currentAnnual;
  const differenceFromGuidelineMaximum =
    inputs.guidelineMaximumLevelPremium - newAnnualPremium;

  return {
    newMonthlyPremium,
    newAnnualPremium,
    additionalAnnualFunding,
    differenceFromGuidelineMaximum,
    disclaimer: SCENARIO_DISCLAIMER,
  };
}
