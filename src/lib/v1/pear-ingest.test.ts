import { describe, expect, it } from "vitest";
import {
  buildIngestCompleteMessage,
  buildPearIngestSteps,
} from "@/lib/v1/pear-ingest";
import { getPearMalikAskContext } from "@/lib/v1/pear-malik-context";

describe("pear ingest choreography", () => {
  it("builds spoken upload → synthesize steps for Malik", () => {
    const ctx = getPearMalikAskContext();
    const steps = buildPearIngestSteps("Malik Illustrations.pdf", ctx);
    expect(steps.length).toBeGreaterThanOrEqual(5);
    expect(steps[0]?.spoken).toMatch(/Receiving/i);
    expect(steps.some((s) => s.fields?.some((f) => f.label === "Insured"))).toBe(
      true,
    );
    expect(steps.at(-1)?.id).toBe("ready");
    expect(steps.at(-1)?.spoken).toMatch(/real-time demo/i);
  });

  it("builds completion copy after synthesis", () => {
    const ctx = getPearMalikAskContext();
    const done = buildIngestCompleteMessage(ctx, "Malik Illustrations.pdf");
    expect(done.content).toMatch(/Malik C Gillins/);
    expect(done.spokenScript).toMatch(/synthesized/i);
  });
});
