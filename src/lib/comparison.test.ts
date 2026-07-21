import { describe, expect, it } from "vitest";
import { buildAdvisorRoster } from "@/lib/clients";
import { comparePolicies } from "@/lib/comparison";
import { modelFundingScenarios, runScenario } from "@/lib/scenarios";

describe("scenario modeling", () => {
  it("projects deterministic cash values and detects lapse", () => {
    const healthy = runScenario("Target funding", {
      startingCashValue: 48250,
      annualPremium: 6200,
      annualCoi: 1850,
      horizonYears: 30,
    });
    expect(healthy.lapseYear).toBeNull();
    expect(healthy.endingCashValue).toBeGreaterThan(48250);
    expect(healthy.assumptions.length).toBeGreaterThan(0);

    const stopped = runScenario("Stop paying", {
      startingCashValue: 5000,
      annualPremium: 0,
      annualCoi: 1850,
      horizonYears: 30,
    });
    expect(stopped.lapseYear).not.toBeNull();
    expect(stopped.lapseYear).toBeLessThan(10);

    // Deterministic: same inputs → identical output
    const again = runScenario("Stop paying", {
      startingCashValue: 5000,
      annualPremium: 0,
      annualCoi: 1850,
      horizonYears: 30,
    });
    expect(again).toEqual(stopped);
  });

  it("models current / target / stop-paying scenario set", () => {
    const roster = buildAdvisorRoster();
    const iul = roster[0].documents[0];
    const scenarios = modelFundingScenarios(iul.extraction);
    expect(scenarios.map((s) => s.name)).toEqual([
      "Current funding",
      "Target funding",
      "Stop paying",
    ]);
    expect(scenarios[2].annualPremium).toBe(0);
  });
});

describe("advisor policy comparison", () => {
  it("compares current IUL vs proposed FIA with warnings and questions", () => {
    const roster = buildAdvisorRoster();
    const alex = roster[0];
    const [iul, fia] = alex.documents;
    const report = comparePolicies(iul, fia, alex.profile);

    expect(report.currentName).toMatch(/Mutual of Omaha/i);
    expect(report.proposedName).toMatch(/Athene/i);
    expect(report.rows.length).toBeGreaterThanOrEqual(6);
    expect(
      report.warnings.some((w) => /death benefit/i.test(w)),
    ).toBe(true);
    expect(
      report.warnings.some((w) => /dependents/i.test(w)),
    ).toBe(true);
    expect(report.questions.length).toBeGreaterThanOrEqual(3);
    expect(report.suitabilitySummary).toMatch(/human advisor approval/i);
    expect(report.assumptions.length).toBeGreaterThan(0);
  });
});

describe("advisor roster", () => {
  it("seeds three distinct client households with documents", () => {
    const roster = buildAdvisorRoster();
    expect(roster).toHaveLength(3);
    const ids = new Set(roster.map((c) => c.id));
    expect(ids.size).toBe(3);
    for (const c of roster) {
      expect(c.profile.onboardingComplete).toBe(true);
      expect(c.documents.length).toBeGreaterThan(0);
      expect(c.documents.every((d) => d.verified)).toBe(true);
    }
    // Underinsured family: coverage well below mortgage
    const taylor = roster.find((c) => c.id === "client_taylor")!;
    expect(taylor.documents[0].extraction.faceAmount.value).toBe(250000);
    expect(taylor.profile.household.mortgageBalance.value).toBe(410000);
  });
});
