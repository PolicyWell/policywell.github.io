import { describe, expect, it } from "vitest";
import {
  computeIngestionStats,
  formatAnalyzedCounter,
  type IngestionRowInput,
} from "@/lib/v1/ingestion-stats";

function row(
  partial: Partial<IngestionRowInput> &
    Pick<IngestionRowInput, "id" | "document_id" | "status">,
): IngestionRowInput {
  return {
    created_at: partial.created_at ?? "2026-08-10T00:00:00.000Z",
    ...partial,
  };
}

describe("computeIngestionStats", () => {
  it("returns zeros with no documents", () => {
    const stats = computeIngestionStats({ documentCount: 0, ingestions: [] });
    expect(stats.documents.uploaded).toBe(0);
    expect(stats.documents.successfullyIngested).toBe(0);
    expect(stats.ingestions).toEqual({
      queued: 0,
      processing: 0,
      completed: 0,
      failed: 0,
    });
    expect(stats.active).toBe(0);
  });

  it("counts one completed document", () => {
    const stats = computeIngestionStats({
      documentCount: 1,
      ingestions: [
        row({
          id: "i1",
          document_id: "d1",
          status: "completed",
        }),
      ],
    });
    expect(stats.documents.uploaded).toBe(1);
    expect(stats.documents.successfullyIngested).toBe(1);
    expect(stats.ingestions.completed).toBe(1);
  });

  it("counts multiple completed documents", () => {
    const stats = computeIngestionStats({
      documentCount: 2,
      ingestions: [
        row({ id: "i1", document_id: "d1", status: "completed" }),
        row({ id: "i2", document_id: "d2", status: "completed" }),
      ],
    });
    expect(stats.documents.successfullyIngested).toBe(2);
    expect(stats.ingestions.completed).toBe(2);
  });

  it("tracks queued and processing on latest rows", () => {
    const stats = computeIngestionStats({
      documentCount: 2,
      ingestions: [
        row({ id: "i1", document_id: "d1", status: "queued" }),
        row({ id: "i2", document_id: "d2", status: "processing" }),
      ],
    });
    expect(stats.ingestions.queued).toBe(1);
    expect(stats.ingestions.processing).toBe(1);
    expect(stats.active).toBe(2);
    expect(stats.documents.successfullyIngested).toBe(0);
  });

  it("tracks failed on latest row", () => {
    const stats = computeIngestionStats({
      documentCount: 1,
      ingestions: [row({ id: "i1", document_id: "d1", status: "failed" })],
    });
    expect(stats.ingestions.failed).toBe(1);
    expect(stats.documents.successfullyIngested).toBe(0);
  });

  it("does not inflate successfullyIngested on retries", () => {
    const stats = computeIngestionStats({
      documentCount: 1,
      ingestions: [
        row({
          id: "i1",
          document_id: "d1",
          status: "failed",
          created_at: "2026-08-10T01:00:00.000Z",
        }),
        row({
          id: "i2",
          document_id: "d1",
          status: "completed",
          created_at: "2026-08-10T02:00:00.000Z",
        }),
        row({
          id: "i3",
          document_id: "d1",
          status: "completed",
          created_at: "2026-08-10T03:00:00.000Z",
        }),
      ],
    });
    expect(stats.documents.successfullyIngested).toBe(1);
    expect(stats.ingestions.completed).toBe(1);
    expect(stats.ingestions.failed).toBe(0);
  });

  it("uses latest status after retry following failure", () => {
    const stats = computeIngestionStats({
      documentCount: 1,
      ingestions: [
        row({
          id: "i1",
          document_id: "d1",
          status: "failed",
          created_at: "2026-08-10T01:00:00.000Z",
        }),
        row({
          id: "i2",
          document_id: "d1",
          status: "processing",
          created_at: "2026-08-10T02:00:00.000Z",
        }),
      ],
    });
    expect(stats.documents.successfullyIngested).toBe(0);
    expect(stats.ingestions.failed).toBe(0);
    expect(stats.ingestions.processing).toBe(1);
    expect(stats.active).toBe(1);
  });

  it("keeps successfullyIngested when a completed doc is re-queued", () => {
    const stats = computeIngestionStats({
      documentCount: 1,
      ingestions: [
        row({
          id: "i1",
          document_id: "d1",
          status: "completed",
          created_at: "2026-08-10T01:00:00.000Z",
        }),
        row({
          id: "i2",
          document_id: "d1",
          status: "queued",
          created_at: "2026-08-10T02:00:00.000Z",
        }),
      ],
    });
    expect(stats.documents.successfullyIngested).toBe(1);
    expect(stats.ingestions.queued).toBe(1);
    expect(stats.ingestions.completed).toBe(0);
    expect(stats.active).toBe(1);
  });
});

describe("formatAnalyzedCounter", () => {
  it("omits + below 100 and pluralizes", () => {
    expect(formatAnalyzedCounter(0)).toEqual({
      numberText: "0",
      label: "Documents analyzed • Live",
    });
    expect(formatAnalyzedCounter(1)).toEqual({
      numberText: "1",
      label: "Document analyzed • Live",
    });
    expect(formatAnalyzedCounter(98).numberText).toBe("98");
    expect(formatAnalyzedCounter(100).numberText).toBe("100+");
  });
});
