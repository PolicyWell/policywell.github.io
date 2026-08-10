import { describe, expect, it } from "vitest";
import {
  buildReportBook,
  fundingBenchmarks,
  gapSeverity,
} from "@/lib/intelligence/report-book";
import { buildDemoSeed } from "@/lib/seed";

describe("report book", () => {
  it("builds simulated advisor rows with deterministic scores", () => {
    const book = buildReportBook();
    expect(book.rows.length).toBeGreaterThanOrEqual(3);
    expect(book.simulatedCount).toBe(book.rows.length);
    expect(book.liveCount).toBe(0);
    for (const row of book.rows) {
      expect(row.provenance).toBe("simulated");
      if (row.scored) {
        expect(row.scores?.policyHealthScore).toBeGreaterThanOrEqual(0);
        expect(row.scores?.policyHealthScore).toBeLessThanOrEqual(100);
      }
    }
  });

  it("tags workspace household as live without inventing scores", () => {
    const seed = buildDemoSeed();
    const book = buildReportBook({
      liveProfile: seed.profile,
      liveDocuments: seed.documents,
    });
    expect(book.liveCount).toBe(1);
    expect(book.rows.some((r) => r.provenance === "live")).toBe(true);
    const live = book.rows.find((r) => r.provenance === "live");
    expect(live?.scored).toBe(true);
    expect(live?.scores?.policyHealthScore).toBeTypeOf("number");
  });

  it("marks funding schedule lines as derived when premiums exist", () => {
    const book = buildReportBook();
    const row = book.rows[0]!;
    const bench = fundingBenchmarks(row);
    if (row.currentPremium != null && row.targetPremium != null) {
      expect(bench.derived).toBe(true);
      expect(bench.noLapse).not.toBeNull();
    }
    expect(gapSeverity("Underfunded")).toBe("high");
  });
});
