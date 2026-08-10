import type { Metadata } from "next";
import Link from "next/link";
import { noindexMetadata } from "@/lib/seo";

export const metadata: Metadata = noindexMetadata({
  title: "Engineering",
  description:
    "Architecture overview for the PolicyWell insurance intelligence platform.",
  path: "/docs/engineering",
});

const LAYERS = [
  {
    title: "Document Intelligence",
    body: "Personal and commercial document ingest with verification before trust.",
  },
  {
    title: "Personal Policy Intelligence",
    body: "Household and life/annuity policy context with deterministic scoring.",
  },
  {
    title: "Illustration Intelligence",
    body: "Illustration extraction, funding projections, and comparison support.",
  },
  {
    title: "Commercial Risk Intelligence",
    body: "Business profiles, coverage gaps, loss runs, certificates, and commercial scores.",
  },
  {
    title: "Underwriting Intelligence",
    body: "Preliminary risk tiers and evidence checklists - decision support only.",
  },
  {
    title: "Carrier Appetite Intelligence",
    body: "Normalized appetite matches with sources, confidence, and non-fit reasons.",
  },
  {
    title: "Distribution Intelligence",
    body: "Advisor, agency, MGA/IMO, and producer workflow surfaces.",
  },
  {
    title: "Claims Intelligence",
    body: "Claims and loss-run timelines feeding risk and renewal readiness.",
  },
  {
    title: "Recommendation Engine",
    body: "Grounded recommendations that stay pending until human approval.",
  },
  {
    title: "Governance and Audit Layer",
    body: "Role-based access patterns, evidence citations, and append-only audit references in the API contract.",
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
          integration contracts - not internal delivery planning.
        </p>
      </header>

      <section className="pw-docs-section">
        <h2>Insurance Intelligence Engine</h2>
        <pre className="pw-docs-pre overflow-x-auto text-sm leading-relaxed">
{`Insurance Intelligence Engine
├── Document Intelligence
├── Personal Policy Intelligence
├── Illustration Intelligence
├── Commercial Risk Intelligence
├── Underwriting Intelligence
├── Carrier Appetite Intelligence
├── Distribution Intelligence
├── Claims Intelligence
├── Recommendation Engine
└── Governance and Audit Layer`}
        </pre>
        <p className="pw-docs-lede mt-4">
          Commercial and underwriting modules extend the same engine through
          line-of-business schemas - not a separate application.
        </p>
      </section>

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
            - REST contract for backend wiring
          </li>
          <li>
            <Link href="/docs/cli" className="pw-docs-inline-link">
              CLI
            </Link>{" "}
            - batch and enterprise automation (Preview)
          </li>
          <li>
            <Link href="/openapi.json" className="pw-docs-inline-link">
              OpenAPI
            </Link>{" "}
            - machine-readable endpoint spec
          </li>
          <li>
            <Link href="/agent" className="pw-docs-inline-link">
              Assistant
            </Link>{" "}
            - grounded insurance intelligence chat
          </li>
        </ul>
      </section>

      <section className="pw-docs-section">
        <h2>Design principles</h2>
        <ul className="pw-docs-bullet-list">
          <li>Context first - household and policy data before recommendations</li>
          <li>Explainable outputs - scores and answers cite available evidence</li>
          <li>Human approval - licensed review before client-facing delivery</li>
          <li>Deterministic core - analysis tools remain auditable and repeatable</li>
        </ul>
        <p className="pw-docs-note">
          Internal delivery notes and planning artifacts are not published on
          product documentation pages.
        </p>
      </section>
    </article>
  );
}
