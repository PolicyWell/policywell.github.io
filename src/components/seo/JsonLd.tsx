type JsonLdValue =
  | Record<string, unknown>
  | ReadonlyArray<Record<string, unknown>>;

/**
 * Invisible JSON-LD script for search engines.
 * Renders no visible UI.
 */
export function JsonLd({ data }: { data: JsonLdValue }) {
  const payload = Array.isArray(data) ? data : [data];
  return (
    <script
      type="application/ld+json"
      // JSON-LD must be raw JSON in the document for crawlers.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload.length === 1 ? payload[0] : payload) }}
    />
  );
}
