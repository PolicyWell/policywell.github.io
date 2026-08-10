import { describe, expect, it } from "vitest";
import { buildProposalBook, statusAt } from "./proposal-book";

describe("buildProposalBook", () => {
  it("builds premium shares that sum to ~100%", () => {
    const book = buildProposalBook();
    expect(book.premiumRows.length).toBeGreaterThan(0);
    expect(book.totalPremium).toBeGreaterThan(0);
    const share = book.premiumRows.reduce((s, r) => s + r.share, 0);
    expect(share).toBeGreaterThan(0.99);
    expect(share).toBeLessThan(1.01);
  });

  it("includes cohort strength ladder and status matrix", () => {
    const book = buildProposalBook();
    expect(book.cohort).toHaveLength(5);
    expect(book.statusCoverages.length).toBeGreaterThan(0);
    expect(book.statusPerils.length).toBeGreaterThan(0);
    expect(statusAt(book, "gl", "abuse")).toBe("missing");
    expect(statusAt(book, "physical", "wind_hail")).toBe("waived");
  });
});
