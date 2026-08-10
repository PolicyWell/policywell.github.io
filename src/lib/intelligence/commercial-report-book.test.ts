import { describe, expect, it } from "vitest";
import {
  buildCommercialReportBook,
  HEATMAP_COVERAGES,
  HEATMAP_PERILS,
  cellAt,
} from "@/lib/intelligence/commercial-report-book";

describe("commercial report book", () => {
  it("builds Harbor Fab commercial simulations with gaps and diligence", () => {
    const book = buildCommercialReportBook();
    expect(book.accountName).toMatch(/Harbor/i);
    expect(book.provenance).toBe("simulated");
    expect(book.totalPolicies).toBeGreaterThanOrEqual(3);
    expect(book.gaps.length).toBeGreaterThan(0);
    expect(book.diligence.length).toBeGreaterThan(0);
    expect(book.cases.length).toBeGreaterThan(0);
    expect(book.appetite.length).toBeGreaterThan(0);
    expect(book.perilCells.length).toBe(
      HEATMAP_COVERAGES.length * HEATMAP_PERILS.length,
    );
  });

  it("marks missing WC cells as attention/critical rather than inventing rates", () => {
    const book = buildCommercialReportBook();
    const wcOccurrence = cellAt(book, "workers_compensation", "occurrence");
    expect(wcOccurrence).toBeTruthy();
    expect(["attention", "critical", "unknown"]).toContain(wcOccurrence!.status);
    expect(wcOccurrence!.status).not.toBe("healthy");
  });

  it("keeps GL property cells on-file as healthy or monitor", () => {
    const book = buildCommercialReportBook();
    const gl = cellAt(book, "general_liability", "occurrence");
    expect(gl?.status === "healthy" || gl?.status === "monitor").toBe(true);
  });
});
