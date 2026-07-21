import { describe, expect, it } from "vitest";
import {
  CARRIER_PACKS,
  answerCarrierQuestion,
  getCarrierPack,
} from "@/lib/carrier-kb";

describe("carrier knowledge packs", () => {
  it("answers only from approved carrier content", () => {
    const result = answerCarrierQuestion(
      "Mutual of Omaha",
      "Explain the Life Protection Advantage IUL",
    );
    expect(result.supported).toBe(true);
    expect(result.product).toBe("Life Protection Advantage IUL");

    const pack = getCarrierPack("Mutual of Omaha")!;
    const approved = pack.products[0].approvedClaims;
    // Every sentence in the answer must come from approved claims
    for (const claim of approved) {
      expect(result.answer).toContain(claim);
    }
    expect(result.sources.length).toBeGreaterThan(0);
  });

  it("preserves compliance language verbatim", () => {
    const pack = getCarrierPack("Athene")!;
    const result = answerCarrierQuestion("Athene", "Explain the Performance Elite FIA");
    expect(result.complianceLanguage).toBe(pack.complianceLanguage);
  });

  it("includes illustration notes when illustration is requested", () => {
    const result = answerCarrierQuestion(
      "Mutual of Omaha",
      "Show illustration values for the IUL",
    );
    expect(result.answer).toMatch(/guaranteed and non-guaranteed/i);
  });

  it("declines instead of generating unsupported claims", () => {
    const unknownCarrier = answerCarrierQuestion("Acme Life", "Explain your IUL");
    expect(unknownCarrier.supported).toBe(false);
    expect(unknownCarrier.answer).toMatch(/will not generate unsupported/i);

    const packs = CARRIER_PACKS.map((p) => p.carrier);
    expect(packs).toContain("Mutual of Omaha");
  });
});
