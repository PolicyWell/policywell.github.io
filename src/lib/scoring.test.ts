import { describe, expect, it } from "vitest";
import { answerPolicyQuestion, generateAgentReport } from "@/lib/context-engine";
import { computePolicyWellScores } from "@/lib/scoring";
import { buildDemoSeed } from "@/lib/seed";
import { createFeedback, summarizeFeedback } from "@/lib/feedback";

describe("hybrid context + scoring", () => {
  it("computes deterministic explainable PolicyWell scores", () => {
    const { profile, documents } = buildDemoSeed();
    const scores = computePolicyWellScores(profile, documents);
    expect(scores.protectionScore).toBeGreaterThan(0);
    expect(scores.policyHealthScore).toBeGreaterThan(0);
    expect(scores.overallIntelligenceScore).toBeGreaterThan(0);
    expect(scores.explanations.length).toBeGreaterThanOrEqual(7);
    expect(scores.assumptions.some((a) => /10×/i.test(a))).toBe(true);

    // Deterministic: same inputs → same outputs
    const again = computePolicyWellScores(profile, documents);
    expect(again).toEqual(scores);
  });

  it("grounds every answer in document, values, assumptions, confidence", () => {
    const { profile, documents } = buildDemoSeed();
    const result = answerPolicyQuestion("Will my policy lapse?", profile, documents);
    expect(result.answer.length).toBeGreaterThan(20);
    expect(result.references.document).toMatch(/Mutual/i);
    expect(result.references.extractedValues.length).toBeGreaterThan(0);
    expect(result.references.assumptions.length).toBeGreaterThan(0);
    expect(result.references.confidence).toBeGreaterThan(0);
  });

  it("produces advisor report artifacts", () => {
    const { profile, documents } = buildDemoSeed();
    const report = generateAgentReport(profile, documents);
    expect(report.clientSummary).toBeTruthy();
    expect(report.advisorSummary).toBeTruthy();
    expect(report.questions.length).toBeGreaterThan(0);
    expect(report.recommendedFollowUp.length).toBeGreaterThan(0);
  });

  it("stores feedback without mutating scoring logic", () => {
    const { profile, documents } = buildDemoSeed();
    const before = computePolicyWellScores(profile, documents);
    const fb = createFeedback({
      userId: "u1",
      recommendationId: "rec1",
      kind: "needs_correction",
      correction: "Premium should be 6000",
    });
    const summary = summarizeFeedback([fb]);
    expect(summary.needsCorrection).toBe(1);
    const after = computePolicyWellScores(profile, documents);
    expect(after).toEqual(before);
  });
});
