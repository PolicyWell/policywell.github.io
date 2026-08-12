import { describe, expect, it } from "vitest";
import {
  humanizeOpeReply,
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

describe("humanizeOpeReply", () => {
  it("personalizes short replies", () => {
    const out = humanizeOpeReply("Your premium looks stable.", {
      name: "Alex",
    });
    expect(out.startsWith("Alex,")).toBe(true);
  });
});
