import "server-only";

import { createServiceSupabaseClient } from "@/lib/v1/life-illustration/LifeIllustrationIngestionService";
import {
  computeIngestionStats,
  type IngestionRowInput,
  type IngestionStats,
  type IngestionStatus,
} from "@/lib/v1/ingestion-stats";

const STATUS_SET = new Set<IngestionStatus>([
  "queued",
  "processing",
  "completed",
  "failed",
]);

function asStatus(value: string): IngestionStatus | null {
  return STATUS_SET.has(value as IngestionStatus)
    ? (value as IngestionStatus)
    : null;
}

/**
 * Load aggregate ingestion stats from Supabase.
 * Selects only id/status/timestamps — never filenames, case IDs, or PII.
 */
export async function loadIngestionStats(): Promise<IngestionStats> {
  const supabase = createServiceSupabaseClient();

  const [docsResult, ingestionsResult] = await Promise.all([
    supabase.from("documents").select("id", { count: "exact", head: true }),
    supabase
      .from("ingestions")
      .select("id, document_id, status, created_at"),
  ]);

  if (docsResult.error) {
    throw new Error(`documents count failed: ${docsResult.error.message}`);
  }
  if (ingestionsResult.error) {
    throw new Error(`ingestions query failed: ${ingestionsResult.error.message}`);
  }

  const rows: IngestionRowInput[] = [];
  for (const row of ingestionsResult.data ?? []) {
    const status = asStatus(row.status);
    if (!status) continue;
    rows.push({
      id: row.id,
      document_id: row.document_id,
      status,
      created_at: row.created_at,
    });
  }

  return computeIngestionStats({
    documentCount: docsResult.count ?? 0,
    ingestions: rows,
  });
}

/** Public JSON shape (active omitted from wire if unused by clients is fine to include). */
export function toPublicIngestionStatsPayload(stats: IngestionStats) {
  return {
    documents: {
      uploaded: stats.documents.uploaded,
      successfullyIngested: stats.documents.successfullyIngested,
    },
    ingestions: {
      queued: stats.ingestions.queued,
      processing: stats.ingestions.processing,
      completed: stats.ingestions.completed,
      failed: stats.ingestions.failed,
    },
    updatedAt: stats.updatedAt,
  };
}
