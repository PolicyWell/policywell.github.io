import { describe, expect, it } from "vitest";
import { BOOK_OF_BUSINESS_SCENES } from "./book-of-business-cli";

describe("book of business CLI scenes", () => {
  it("exposes ingest and opportunities demos", () => {
    expect(BOOK_OF_BUSINESS_SCENES.map((s) => s.id)).toEqual([
      "ingest",
      "opportunities",
    ]);
  });

  it("includes the commercial funnel and vertical examples", () => {
    const ingest = BOOK_OF_BUSINESS_SCENES.find((s) => s.id === "ingest")!;
    const blob = JSON.stringify(ingest.lines);
    expect(blob).toContain("2,500");
    expect(blob).toContain("800");
    expect(blob).toContain("1,100");
    expect(blob).toContain("12");
    expect(blob).toContain("HOA");
    expect(blob).toContain("Trucking");
    expect(blob).toContain("$4.8M");
  });

  it("color-codes money and lapse risk in opportunities", () => {
    const ops = BOOK_OF_BUSINESS_SCENES.find((s) => s.id === "opportunities")!;
    const money = ops.lines.flatMap((l) => l.segments ?? []).filter(
      (s) => s.tone === "money",
    );
    const danger = ops.lines.flatMap((l) => l.segments ?? []).filter(
      (s) => s.tone === "danger",
    );
    expect(money.length).toBeGreaterThanOrEqual(5);
    expect(danger.length).toBeGreaterThanOrEqual(3);
    expect(JSON.stringify(ops.lines)).toContain("Oakridge HOA Board");
    expect(JSON.stringify(ops.lines)).toContain("Summit Regional Freight");
    expect(JSON.stringify(ops.lines)).toContain("Harbor Fabrication");
  });
});
