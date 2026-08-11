import { readFileSync, existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  isUnitedOfOmahaIulExpress,
  normalizeUnitedOfOmahaIllustration,
  parseUnitedOfOmahaDetailedLedger,
} from "@/lib/v1/life-illustration/normalize-united-omaha";
import { parseLifeIllustrationText } from "@/lib/v1/life-illustration/parser";
import { answerLiveQuestion } from "@/lib/v1/ask";

const RAW_PATH = "/tmp/malik-raw.txt";

describe("United of Omaha Malik illustration normalization", () => {
  it.skipIf(!existsSync(RAW_PATH))("extracts Malik C Gillins and ledger from PDF text", () => {
    const raw = readFileSync(RAW_PATH, "utf8");
    expect(isUnitedOfOmahaIulExpress(raw)).toBe(true);
    const labeled = normalizeUnitedOfOmahaIllustration(raw);
    expect(labeled).toContain("Insured Name: Malik C Gillins");
    expect(labeled).toContain("Monthly Premium: $125.19");
    expect(labeled).toContain("Death Benefit: $300,000");
    expect(labeled).toContain("Guaranteed Coverage Cessation Age: 56");
    expect(labeled).toContain("Midpoint Coverage Cessation Age: 73");

    const extracted = parseLifeIllustrationText(raw, "Malik Illustrations.pdf");
    expect(extracted.insuredName).toBe("Malik C Gillins");
    expect(extracted.carrier).toContain("United of Omaha");
    expect(extracted.monthlyPremium).toBeCloseTo(125.19, 2);
    expect(extracted.deathBenefit).toBe(300000);
    expect(extracted.guaranteedCoverageCessationAge).toBe(56);
    expect(extracted.midpointCoverageCessationAge).toBe(73);
    expect(extracted.ledger.length).toBeGreaterThan(20);
    const y24 = extracted.ledger.find((r) => r.policy_year === 24);
    expect(y24?.attained_age).toBe(52);
    expect(y24?.illustrated_surrender_value).toBeGreaterThan(30000);

    const ledger = parseUnitedOfOmahaDetailedLedger(raw, 1502);
    expect(ledger.find((r) => r.policy_year === 1)?.guaranteed_death_benefit).toBe(
      300000,
    );
  });
});

describe("live ask math", () => {
  it("answers funding and scenario hypothetically without AI", () => {
    const ctx = {
      insuredName: "Malik C Gillins",
      carrier: "United of Omaha Life Insurance Company",
      product: "Indexed Universal Life Express",
      issueAge: 28,
      deathBenefit: 300000,
      monthlyPremium: 125.19,
      annualPremium: 1502,
      noLapseAnnualPremium: 1017.21,
      guidelineMaximumLevelPremium: 6531,
      guaranteedCessationAge: 56,
      midpointCessationAge: 73,
      illustratedDurationYears: 92,
      documentType: "original_illustration",
      illustratedCreditingRatePct: 5.87,
      ledger: [
        {
          policy_year: 24,
          attained_age: 52,
          annual_premium_outlay: 1502,
          guaranteed_accumulation_value: 2225,
          guaranteed_surrender_value: 2225,
          alternate_accumulation_value: 26675,
          alternate_surrender_value: 26675,
          illustrated_accumulation_value: 39719,
          illustrated_surrender_value: 39719,
          guaranteed_death_benefit: 300000,
          alternate_death_benefit: 300000,
          illustrated_death_benefit: 300000,
        },
      ],
    };
    const funding = answerLiveQuestion("is this funded above no-lapse?", ctx);
    expect(funding.intent).toBe("funding");
    expect(funding.answer).toMatch(/above the no-lapse/i);

    const cv = answerLiveQuestion("cash value at age 52", ctx);
    expect(cv.intent).toBe("cashvalue");
    expect(cv.math.illustratedSurrenderValue).toBe(39719);
    expect(cv.math.cumulativePremiumOutlay).toBe(24 * 1502);
    expect(cv.math.illustratedNetOfCharges).toBe(39719 - 24 * 1502);
    expect(cv.answer).toMatch(/premiums paid/i);

    const scenario = answerLiveQuestion("what if premium 180", ctx);
    expect(scenario.intent).toBe("scenario");
    expect(scenario.math.newAnnualPremium).toBe(2160);

    const better = answerLiveQuestion("any better options?", ctx);
    expect(better.intent).toBe("better_options");
    expect(better.options).toHaveLength(5);
    expect(better.options?.[0]?.carrier).toBe("Foresters Financial");
    expect(better.options?.[0]?.illustratedCashValueAtAge52).toBeGreaterThan(39719);
    expect(better.disclaimer).toMatch(/hypothetical/i);

    const foresters = answerLiveQuestion("best option vs Foresters", ctx);
    expect(foresters.intent).toBe("better_options");
  });
});
