/**
 * Aggregate ingestion statistics from documents + ingestions rows.
 * Never includes PII / filenames / IDs in the returned payload.
 */

export type IngestionStatus = "queued" | "processing" | "completed" | "failed";

export type IngestionRowInput = {
  id: string;
  document_id: string;
  status: IngestionStatus;
  created_at: string;
};

export type IngestionStats = {
  documents: {
    uploaded: number;
    successfullyIngested: number;
  };
  ingestions: {
    queued: number;
    processing: number;
    completed: number;
    failed: number;
  };
  /** Distinct documents whose latest ingestion is queued or processing. */
  active: number;
  updatedAt: string;
};

function pickLatestByDocument(
  rows: IngestionRowInput[],
): Map<string, IngestionRowInput> {
  const latest = new Map<string, IngestionRowInput>();
  for (const row of rows) {
    const prev = latest.get(row.document_id);
    if (!prev) {
      latest.set(row.document_id, row);
      continue;
    }
    const prevTime = Date.parse(prev.created_at);
    const nextTime = Date.parse(row.created_at);
    if (
      nextTime > prevTime ||
      (nextTime === prevTime && row.id > prev.id)
    ) {
      latest.set(row.document_id, row);
    }
  }
  return latest;
}

export function computeIngestionStats(input: {
  documentCount: number;
  ingestions: IngestionRowInput[];
  updatedAt?: string;
}): IngestionStats {
  const latest = pickLatestByDocument(input.ingestions);

  let queued = 0;
  let processing = 0;
  let completedLatest = 0;
  let failed = 0;
  for (const row of latest.values()) {
    switch (row.status) {
      case "queued":
        queued += 1;
        break;
      case "processing":
        processing += 1;
        break;
      case "completed":
        completedLatest += 1;
        break;
      case "failed":
        failed += 1;
        break;
      default:
        break;
    }
  }

  // Documents that have ever completed at least one ingestion (retry-safe).
  const successfullyIngested = new Set(
    input.ingestions
      .filter((row) => row.status === "completed")
      .map((row) => row.document_id),
  ).size;

  return {
    documents: {
      uploaded: input.documentCount,
      successfullyIngested,
    },
    ingestions: {
      queued,
      processing,
      completed: completedLatest,
      failed,
    },
    active: queued + processing,
    updatedAt: input.updatedAt ?? new Date().toISOString(),
  };
}

/** Format the homepage / marketing counter number + label. */
export function formatAnalyzedCounter(successfullyIngested: number): {
  numberText: string;
  label: string;
} {
  const n = Math.max(0, Math.floor(successfullyIngested));
  if (n >= 100) {
    return {
      numberText: `${n.toLocaleString("en-US")}+`,
      label: "Documents analyzed • Live",
    };
  }
  if (n === 1) {
    return {
      numberText: "1",
      label: "Document analyzed • Live",
    };
  }
  return {
    numberText: n.toLocaleString("en-US"),
    label: "Documents analyzed • Live",
  };
}
