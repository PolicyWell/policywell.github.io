import { jsonError, jsonOk } from "@/lib/v1/http";
import {
  loadIngestionStats,
  toPublicIngestionStatsPayload,
} from "@/lib/v1/load-ingestion-stats";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Aggregate ingestion counters only — no document IDs, filenames, or case data.
 * Public for the homepage live counter.
 */
export async function GET() {
  try {
    const stats = await loadIngestionStats();
    return jsonOk(toPublicIngestionStatsPayload(stats));
  } catch (error) {
    return jsonError(error);
  }
}
