import Link from "next/link";

export const metadata = {
  title: "Engineering",
  description:
    "Architecture overview for the PolicyWell insurance intelligence platform.",
};

const LAYERS = [
  {
    title: "Document ingestion",
    body: "Upload and parse policies, illustrations, and statements into structured fields with verification before trust.",
  },
  {
    title: "Household and policy context",
    body: "Combine verified document fields with household goals, dependents, income, and carrier context.",
  },
  {
    title: "Policy analysis engine",
    body: "Deterministic scoring for policy health, funding adequacy, lapse risk, and related signals.",
  },
  {
    title: "Recommendation and approval",
    body: "Generate grounded recommendations that remain pending until licensed professional review.",
  },
  {
    title: "Assistant and reports",
    body: "Grounded Q&A, client-ready reports, and follow-up tasks driven by approved recommendations.",
  },
  {
    title: "Enterprise surfaces",
    body: "Advisor, IMO, and carrier workflows plus planned APIs, webhooks, CLI, and batch jobs.",
  },
];

export default function EngineeringDocsPage() {
  return (
    <article className="pw-docs-article">
      <header className="pw-docs-article-header">
        <p className="pw-docs-eyebrow">
          <Link href="/docs" className="pw-docs-inline-link">
            Platform
          </Link>
        </p>
        <h1>Engineering</h1>
        <p className="pw-docs-lede">
          Architecture overview for the PolicyWell insurance intelligence
          platform. Public documentation describes product capabilities and
          integration contracts — not internal delivery planning.
        </p>
      </header>

      <section className="pw-docs-section">
        <h2>Platform layers</h2>
        <ul className="pw-docs-capability-list">
          {LAYERS.map((layer) => (
            <li key={layer.title}>
              <strong>{layer.title}.</strong> {layer.body}
            </li>
          ))}
        </ul>
      </section>

      <section className="pw-docs-section">
        <h2>Integration surfaces</h2>
        <ul className="pw-docs-bullet-list">
          <li>
            <Link href="/docs/api" className="pw-docs-inline-link">
              API reference
            </Link>{" "}
            — REST contract for backend wiring
          </li>
          <li>
            <Link href="/docs/cli" className="pw-docs-inline-link">
              CLI
            </Link>{" "}
            — batch and enterprise automation (Preview)
          </li>
          <li>
            <Link href="/openapi.json" className="pw-docs-inline-link">
              OpenAPI
            </Link>{" "}
            — machine-readable endpoint spec
          </li>
          <li>
            <Link href="/agent" className="pw-docs-inline-link">
              Assistant
            </Link>{" "}
            — grounded insurance intelligence chat
          </li>
        </ul>
      </section>

      <section className="pw-docs-section">
        <h2>Design principles</h2>
        <ul className="pw-docs-bullet-list">
          <li>Context first — household and policy data before recommendations</li>
          <li>Explainable outputs — scores and answers cite available evidence</li>
          <li>Human approval — licensed review before client-facing delivery</li>
          <li>Deterministic core — analysis tools remain auditable and repeatable</li>
        </ul>
        <p className="pw-docs-note">
          Internal delivery notes and planning artifacts are not published on
          product documentation pages.
        </p>
      </section>
    </article>
  );
}
