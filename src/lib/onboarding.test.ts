import { describe, expect, it } from "vitest";
import {
  createOnboardingState,
  extractFromUtterance,
  processOnboardingTurn,
  applyProfileEdits,
} from "@/lib/onboarding";
import { createEmptyProfile } from "@/lib/profile";

describe("conversational onboarding", () => {
  it("completes onboarding without forms by extracting structured fields", () => {
    let state = createOnboardingState(
      "u1",
      "policyholder",
      "Alex Rivera",
      "alex@example.com",
    );
    expect(state.messages[0].role).toBe("assistant");

    const lines = [
      "I'm married and have three kids.",
      "I live in TX and I have a mortgage of $320000.",
      "I make about $180k a year.",
      "I'm 42 years old.",
      "I have a Mutual of Omaha Indexed Universal Life policy.",
      "I'm planning for retirement and I'm worried about my policy lapsing.",
    ];
    for (const line of lines) {
      state = processOnboardingTurn(state, line);
    }

    const p = state.profile;
    expect(p.household.maritalStatus.value).toBe("married");
    expect(p.household.dependentsCount.value).toBe(3);
    expect(p.household.state.value).toBe("TX");
    expect(p.household.hasMortgage.value).toBe(true);
    expect(p.financial.annualIncome.value).toBe(180000);
    expect(p.retirement.currentAge.value).toBe(42);
    expect(p.carrier.primaryCarrier.value).toBe("Mutual of Omaha");
    expect(p.goals.retirementPlanning.value).toBe(true);
    expect(p.goals.preventLapse.value).toBe(true);
    expect(p.overallConfidence).toBeGreaterThan(0.5);
    expect(Array.isArray(p.missingFields)).toBe(true);
  });

  it("allows editing extracted information and shows confidence", () => {
    let profile = createEmptyProfile("u1", "policyholder", "Alex", "a@x.com");
    profile = extractFromUtterance(profile, "I live in CA");
    expect(profile.household.state.value).toBe("CA");
    expect(profile.household.state.confidence).toBeGreaterThan(0.9);

    profile = applyProfileEdits(profile, { state: "TX", annualIncome: 100000 });
    expect(profile.household.state.value).toBe("TX");
    expect(profile.household.state.confidence).toBe(1);
    expect(profile.financial.annualIncome.value).toBe(100000);
    expect(profile.financial.annualIncome.source).toBe("user_edit");
  });

  it("highlights missing information until filled", () => {
    const profile = createEmptyProfile("u1", "policyholder", "Alex", "a@x.com");
    expect(profile.missingFields).toContain("Marital status");
    expect(profile.missingFields).toContain("Annual income");
  });
});
