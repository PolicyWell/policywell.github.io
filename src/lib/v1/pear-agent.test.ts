import { describe, expect, it } from "vitest";
import { verifyPearAccessCode } from "@/lib/pear-access";
import { answerPearConversation } from "@/lib/v1/pear-agent";
import { getPearMalikAskContext } from "@/lib/v1/pear-malik-context";

describe("pear access", () => {
  it("unlocks with PEARX27 (any case)", async () => {
    expect(await verifyPearAccessCode("PEARX27")).toBe(true);
    expect(await verifyPearAccessCode("pearx27")).toBe(true);
    expect(await verifyPearAccessCode("wrong")).toBe(false);
  });
});

describe("pear conversational agent", () => {
  const ctx = getPearMalikAskContext();

  it("summarizes Malik case", () => {
    const r = answerPearConversation("Tell me about this policy", ctx);
    expect(r.intent).toBe("summary");
    expect(r.text).toMatch(/Malik C Gillins/);
    expect(r.text).toMatch(/300/);
  });

  it("answers funding conversationally", () => {
    const r = answerPearConversation("Is this funded above no-lapse?", ctx);
    expect(r.intent).toBe("funding");
    expect(r.text).toMatch(/above the no-lapse/i);
  });

  it("lists five better options led by Foresters", () => {
    const r = answerPearConversation("any better options?", ctx);
    expect(r.intent).toBe("better_options");
    expect(r.options).toHaveLength(5);
    expect(r.options?.[0]?.carrier).toBe("Foresters Financial");
    expect(r.options?.[0]?.illustratedCashValueAtAge52).toBeGreaterThan(39719);
    expect(r.spokenScript).toMatch(/Foresters/i);
  });

  it("handles cash value at 52", () => {
    const r = answerPearConversation("cash value at age 52", ctx);
    expect(r.intent).toBe("cashvalue");
    expect(r.math.illustratedSurrenderValue).toBe(39719);
    expect(r.spokenScript).toMatch(/fifty-two/i);
  });

  it("keeps age 56 exact (no off-by-one)", () => {
    const r = answerPearConversation("cash value at age 56", ctx);
    expect(r.intent).toBe("cashvalue");
    expect(r.math.requestedAge).toBe(56);
    expect(r.math.matchedAge).toBe(56);
    expect(r.math.illustratedSurrenderValue).toBe(52716);
    expect(r.text).toMatch(/At age 56/);
    expect(r.spokenScript).toMatch(/fifty-six/i);
    expect(r.spokenScript).not.toMatch(/fifty-five/i);
  });

  it("avoids liv pronunciation in welcome speech", () => {
    const r = answerPearConversation("hello", ctx);
    expect(r.spokenScript).toMatch(/real-time demo/i);
    expect(r.spokenScript).not.toMatch(/\blive demo\b/i);
  });
});
