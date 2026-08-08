import type { ProvenancedField } from "./commercial-types";

/** Create a provenanced field. Never invent — pass null when unknown. */
export function provenanced<T>(
  value: T | null,
  opts: {
    confidence?: number;
    sourceDocumentId?: string | null;
    sourceDocumentName?: string | null;
    pageNumber?: number | null;
    sourceExcerpt?: string | null;
  } = {},
): ProvenancedField<T> {
  const missing =
    value === null ||
    value === undefined ||
    (typeof value === "string" && value === "");
  return {
    value: missing ? null : value,
    confidence: missing ? 0 : (opts.confidence ?? 0),
    sourceDocumentId: opts.sourceDocumentId ?? null,
    sourceDocumentName: opts.sourceDocumentName ?? null,
    pageNumber: opts.pageNumber ?? null,
    sourceExcerpt: opts.sourceExcerpt ?? null,
    missing,
  };
}

export function emptyProvenanced<T>(): ProvenancedField<T> {
  return provenanced<T>(null);
}
