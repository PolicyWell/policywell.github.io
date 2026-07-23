import type { Metadata } from "next";
import Link from "next/link";
import {
  API_BASE_URL,
  API_GROUPS,
  API_META,
  allApiEndpoints,
} from "@/lib/api-reference-data";

export const metadata: Metadata = {
  title: API_META.title,
  description: API_META.description,
  openGraph: {
    title: `${API_META.title} · PolicyWell Docs`,
    description: API_META.description,
    url: "https://policywell.ai/docs/api",
  },
};

export default function ApiReferenceIndexPage() {
  const endpoints = allApiEndpoints();

  return (
    <article className="pw-docs-article pw-docs-article-wide">
      <header className="pw-docs-article-header">
        <div className="pw-docs-title-row">
          <h1>{API_META.title}</h1>
          <span className="pw-docs-status pw-docs-status-planned">Planned</span>
        </div>
        <p className="pw-docs-lede">{API_META.description}</p>
      </header>

      <section className="pw-docs-section">
        <h2>Base URL</h2>
        <pre className="pw-api-code">
          <code>{API_BASE_URL}</code>
        </pre>
        <p className="pw-docs-body" style={{ marginTop: "0.85rem" }}>
          Authenticate with{" "}
          <code className="pw-api-inline-code">{API_META.authHeader}</code>.
          Test keys use the <code className="pw-api-inline-code">pw_test_</code>{" "}
          prefix. Live keys use <code className="pw-api-inline-code">pw_live_</code>.
        </p>
        <p className="pw-docs-note">
          These endpoints define the integration contract for backend wiring.
          They are documented now so carriers, IMOs, and developers can design
          against a stable shape. Runtime availability is marked per endpoint.
          Machine-readable spec:{" "}
          <Link href="/openapi.json" className="pw-docs-inline-link">
            /openapi.json
          </Link>
          . Prefer one long page? Open the{" "}
          <Link href="/docs/api/reference" className="pw-docs-inline-link">
            full reference
          </Link>
          .
        </p>
      </section>

      <section className="pw-docs-section">
        <h2>Reference docs</h2>
        <p className="pw-docs-body" style={{ marginBottom: "0.9rem" }}>
          Browse each resource group for methods, paths, parameters, request and
          response examples, and cURL. These pages are also listed under{" "}
          <strong>API reference</strong> in the docs sidebar.
        </p>
        <div className="pw-docs-card-grid">
          {API_GROUPS.map((group) => (
            <Link
              key={group.slug}
              href={`/docs/api/${group.slug}`}
              className="pw-docs-card"
            >
              <div className="pw-docs-card-icon" aria-hidden>
                <span className="pw-api-group-count">{group.endpoints.length}</span>
              </div>
              <h3 className="pw-docs-card-title">{group.title}</h3>
              <p className="pw-docs-card-summary">{group.summary}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="pw-docs-section">
        <h2>Endpoint index</h2>
        <div className="pw-api-index">
          {API_GROUPS.map((group) => (
            <div key={group.slug} className="pw-api-index-group">
              <h3>
                <Link href={`/docs/api/${group.slug}`} className="pw-docs-inline-link">
                  {group.title}
                </Link>
              </h3>
              <ul>
                {group.endpoints.map((endpoint) => (
                  <li key={endpoint.id}>
                    <Link href={`/docs/api/${group.slug}#${endpoint.id}`}>
                      <span
                        className={`pw-api-method pw-api-method-${endpoint.method.toLowerCase()}`}
                      >
                        {endpoint.method}
                      </span>
                      <code>{endpoint.path}</code>
                      <span className="pw-api-index-title">{endpoint.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="pw-docs-body" style={{ marginTop: "1rem" }}>
          {endpoints.length} endpoints across {API_GROUPS.length} resource groups.
        </p>
      </section>

      <section className="pw-docs-section">
        <h2>Errors</h2>
        <p className="pw-docs-body">
          Errors use a consistent JSON envelope:
        </p>
        <pre className="pw-api-code">
          <code>{`{
  "error": {
    "code": "validation_error",
    "message": "household_id is required",
    "request_id": "req_01J8ERROR"
  }
}`}</code>
        </pre>
        <ul className="pw-docs-bullet-list">
          <li>
            <code className="pw-api-inline-code">400</code> validation or malformed request
          </li>
          <li>
            <code className="pw-api-inline-code">401</code> missing or invalid API key
          </li>
          <li>
            <code className="pw-api-inline-code">403</code> insufficient scope
          </li>
          <li>
            <code className="pw-api-inline-code">404</code> resource not found
          </li>
          <li>
            <code className="pw-api-inline-code">409</code> state conflict
          </li>
          <li>
            <code className="pw-api-inline-code">429</code> rate limited
          </li>
          <li>
            <code className="pw-api-inline-code">500</code> unexpected server error
          </li>
        </ul>
      </section>

      <section className="pw-docs-section">
        <h2>Id conventions</h2>
        <ul className="pw-docs-bullet-list">
          <li>
            <code className="pw-api-inline-code">hh_</code> household
          </li>
          <li>
            <code className="pw-api-inline-code">doc_</code> document
          </li>
          <li>
            <code className="pw-api-inline-code">pol_</code> policy
          </li>
          <li>
            <code className="pw-api-inline-code">anl_</code> analysis
          </li>
          <li>
            <code className="pw-api-inline-code">rec_</code> recommendation
          </li>
          <li>
            <code className="pw-api-inline-code">wh_</code> webhook
          </li>
          <li>
            <code className="pw-api-inline-code">job_</code> batch job
          </li>
        </ul>
      </section>
    </article>
  );
}
