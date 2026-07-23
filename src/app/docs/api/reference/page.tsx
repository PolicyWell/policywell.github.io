import type { Metadata } from "next";
import Link from "next/link";
import { ApiEndpointBlock } from "@/components/docs/ApiEndpointBlock";
import {
  API_BASE_URL,
  API_GROUPS,
  API_META,
  allApiEndpoints,
} from "@/lib/api-reference-data";

export const metadata: Metadata = {
  title: "Full API reference",
  description:
    "Complete PolicyWell REST API reference — every endpoint on one page.",
};

export default function FullApiReferencePage() {
  const count = allApiEndpoints().length;

  return (
    <article className="pw-docs-article pw-docs-article-wide">
      <header className="pw-docs-article-header">
        <div className="pw-docs-title-row">
          <h1>Full API reference</h1>
          <span className="pw-docs-status pw-docs-status-planned">Planned</span>
        </div>
        <p className="pw-docs-lede">
          Every PolicyWell REST endpoint on one page. Base URL{" "}
          <code className="pw-api-inline-code">{API_BASE_URL}</code>.{" "}
          {count} endpoints across {API_GROUPS.length} resources.
        </p>
        <p className="pw-docs-note" style={{ marginTop: "1rem" }}>
          Prefer browsing by resource? Start at the{" "}
          <Link href="/docs/api" className="pw-docs-inline-link">
            API overview
          </Link>{" "}
          or download{" "}
          <Link href="/openapi.json" className="pw-docs-inline-link">
            openapi.json
          </Link>
          .
        </p>
      </header>

      {API_GROUPS.map((group) => (
        <section
          key={group.slug}
          id={group.slug}
          className="pw-docs-section pw-api-full-group"
          aria-labelledby={`${group.slug}-heading`}
        >
          <div className="pw-api-full-group-head">
            <h2 id={`${group.slug}-heading`}>{group.title}</h2>
            <Link
              href={`/docs/api/${group.slug}`}
              className="pw-guide-api-view-all"
            >
              Open group
            </Link>
          </div>
          <p className="pw-docs-body">{group.summary}</p>
          <div className="pw-api-endpoint-list" style={{ marginTop: "1rem" }}>
            {group.endpoints.map((endpoint) => (
              <ApiEndpointBlock key={endpoint.id} endpoint={endpoint} />
            ))}
          </div>
        </section>
      ))}

      <p className="pw-docs-body" style={{ marginTop: "2rem" }}>
        {API_META.description}
      </p>
    </article>
  );
}
