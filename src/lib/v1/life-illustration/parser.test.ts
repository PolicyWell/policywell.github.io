import { describe, expect, it } from "vitest";
import {
  calculateFundingAnalysis,
  calculateScenarioAnalysis,
  SCENARIO_DISCLAIMER,
} from "@/lib/v1/funding";
import { findCashValueAtAge, buildCashValueAnalysis } from "@/lib/v1/cashvalue";
import { buildLapseResult, ORIGINAL_ILLUSTRATION_LAPSE_NOTE } from "@/lib/v1/lapse";
import {
  isLifeIllustration,
  parseLedgerSection,
  parseLifeIllustrationText,
} from "@/lib/v1/life-illustration/parser";
import { readFileSync } from "node:fs";
import path from "node:path";

const fixturePath = path.resolve(
  process.cwd(),
  "fixtures/life/malik-illustration.txt",
);

describe("life illustration parser", () => {
  it("extracts facts and ledger from synthetic fixture", () => {
    const text = readFileSync(fixturePath, "utf8");
    expect(isLifeIllustration(text, "Malik Illustrations.pdf")).toBe(true);

    const extracted = parseLifeIllustrationText(text, "Malik Illustrations.pdf");
    expect(extracted.documentType).toBe("original_illustration");
    expect(extracted.carrier).toContain("Mutual of Omaha");
    expect(extracted.product).toContain("Life Protection Advantage");
    expect(extracted.insuredName).toBe("Alex Malik");
    expect(extracted.issueAge).toBe(42);
    expect(extracted.sex).toBe("Male");
    expect(extracted.monthlyPremium).toBe(150);
    expect(extracted.annualPremium).toBe(1800);
    expect(extracted.noLapseAnnualPremium).toBe(1440);
    expect(extracted.guidelineMaximumLevelPremium).toBe(4200);
    expect(extracted.tamra7PayPremium).toBe(3100);
    expect(extracted.guidelineSinglePremium).toBe(38500);
    expect(extracted.guaranteedCoverageCessationAge).toBe(78);
    expect(extracted.midpointCoverageCessationAge).toBe(95);
    expect(extracted.riders).toContain("Accelerated Death Benefit");
    expect(extracted.facts.some((f) => f.field_path === "carrier")).toBe(true);
    expect(extracted.facts.every((f) => f.source_excerpt != null)).toBe(true);
    expect(extracted.ledger.length).toBeGreaterThanOrEqual(8);
    expect(extracted.ledger[0]).toMatchObject({
      policy_year: 1,
      attained_age: 43,
      annual_premium_outlay: 1800,
    });
  });

  it("parses pipe ledger rows", () => {
    const rows = parseLedgerSection(`
LEDGER
1 | 43 | 1800 | 900 | 0 | 500000 | 1200 | 200 | 500000 | 1500 | 400 | 500000
END LEDGER
`);
    expect(rows).toHaveLength(1);
    expect(rows[0].illustrated_surrender_value).toBe(400);
  });
});

describe("funding math", () => {
  it("computes annual funding metrics without AI", () => {
    const funding = calculateFundingAnalysis({
      monthlyPremium: 150,
      noLapseAnnualPremium: 1440,
      guidelineMaximumLevelPremium: 4200,
    });
    expect(funding.annualFunding).toBe(1800);
    expect(funding.amountAboveNoLapse).toBe(360);
    expect(funding.fundingRatio).toBeCloseTo(1800 / 1440);
    expect(funding.remainingGuidelineRoom).toBe(2400);
  });

  it("builds scenario without fabricating cash values", () => {
    const scenario = calculateScenarioAnalysis({
      currentMonthlyPremium: 150,
      newMonthlyPremium: 180,
      guidelineMaximumLevelPremium: 4200,
    });
    expect(scenario.newMonthlyPremium).toBe(180);
    expect(scenario.newAnnualPremium).toBe(2160);
    expect(scenario.additionalAnnualFunding).toBe(360);
    expect(scenario.differenceFromGuidelineMaximum).toBe(2040);
    expect(scenario.disclaimer).toBe(SCENARIO_DISCLAIMER);
  });
});

describe("lapse + cash value", () => {
  it("appends original illustration note", () => {
    const result = buildLapseResult({
      guaranteedCoverageCessationAge: 78,
      midpointCoverageCessationAge: 95,
      illustratedDurationYears: 53,
      documentType: "original_illustration",
    });
    expect(result.notes).toContain(ORIGINAL_ILLUSTRATION_LAPSE_NOTE);
  });

  it("finds exact and closest ledger ages", () => {
    const rows = [
      {
        policy_year: 1,
        attained_age: 43,
        guaranteed_surrender_value: 0,
        alternate_surrender_value: 200,
        illustrated_surrender_value: 400,
        guaranteed_death_benefit: 500000,
        alternate_death_benefit: 500000,
        illustrated_death_benefit: 500000,
      },
      {
        policy_year: 10,
        attained_age: 52,
        annual_premium_outlay: 1800,
        guaranteed_accumulation_value: 11000,
        guaranteed_surrender_value: 7600,
        alternate_accumulation_value: 21000,
        alternate_surrender_value: 16500,
        illustrated_accumulation_value: 32000,
        illustrated_surrender_value: 26500,
        guaranteed_death_benefit: 500000,
        alternate_death_benefit: 500000,
        illustrated_death_benefit: 500000,
      },
    ];
    const exact = findCashValueAtAge(rows, 52);
    expect(exact.matchKind).toBe("exact");
    expect(exact.illustratedSurrenderValue).toBe(26500);
    expect(exact.labels.illustratedSurrenderValue).toMatch(/non-guaranteed/i);

    const closest = findCashValueAtAge(rows, 50);
    expect(closest.matchKind).toBe("closest");
    expect(closest.matchedAge).toBe(52);

    const analysis = buildCashValueAnalysis(rows, 52, {
      illustratedCreditingRatePct: 5.87,
    });
    expect(analysis.cumulativePremiumOutlay).toBe(18000);
    expect(analysis.illustratedAccumulationValue).toBe(32000);
    expect(analysis.illustratedNetOfCharges).toBe(14000);
    expect(analysis.illustratedCreditingRatePct).toBe(5.87);
    expect(analysis.disclaimer).toMatch(/in-force illustration/i);
  });
});
