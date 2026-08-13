import { describe, expect, it } from "vitest";
import {
  humanizeOpeReply,
  identityAck,
  mergeIdentity,
  parseIdentityFromMessage,
} from "@/lib/ope-chat";

describe("parseIdentityFromMessage", () => {
  it("parses intro with name and email", () => {
    expect(parseIdentityFromMessage("I'm Alex Rivera, alex@firm.com")).toEqual({
      name: "Alex Rivera",
      email: "alex@firm.com",
    });
  });

  it("parses bare name", () => {
    expect(parseIdentityFromMessage("Jordan")).toEqual({ name: "Jordan" });
  });

  it("rejects incomplete I'm intros", () => {
    expect(parseIdentityFromMessage("I'm")).toEqual({});
    expect(parseIdentityFromMessage("I'm.")).toEqual({});
  });

  it("does not treat insurance questions as names", () => {
    expect(parseIdentityFromMessage("Will my policy lapse?")).toEqual({});
  });

  it("parses company and role hints", () => {
    expect(
      parseIdentityFromMessage("I'm Sam, I work at North Agency as an agent"),
    ).toMatchObject({
      name: "Sam",
      company: "North Agency",
      role: "agent",
    });
  });
});

describe("mergeIdentity", () => {
  it("merges email onto existing name", () => {
    expect(
      mergeIdentity({ name: "Alex" }, { email: "a@b.co" }),
    ).toEqual({ name: "Alex", email: "a@b.co" });
  });
});

describe("identityAck", () => {
  it("does not greet with broken I'm name", () => {
    const out = identityAck({ name: "I'm" }, { name: "I'm" });
    expect(out).not.toMatch(/Great to meet you, I'm/i);
    expect(out.toLowerCase()).toMatch(/what should we call you|what's on your mind|help/);
  });
});

describe("humanizeOpeReply", () => {
  it("personalizes short replies", () => {
    const out = humanizeOpeReply("Your premium looks stable.", {
      name: "Alex",
    });
    expect(out.startsWith("Alex,")).toBe(true);
  });

  it("rewrites stiff live-context dumps", () => {
    const out = humanizeOpeReply(
      "Here's the live context I'm working from:\nContext for Josh...\n\nTo sharpen the analysis, I still need: Marital status.",
      { name: "Josh" },
    );
    expect(out).not.toMatch(/live context/i);
    expect(out).not.toMatch(/sharpen the analysis/i);
    expect(out.toLowerCase()).toMatch(/josh|policy|coverage|funding|lapse/);
  });
});
