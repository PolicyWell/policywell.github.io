import type { Metadata } from "next";
import Link from "next/link";
import { UseCaseCard } from "@/components/docs/UseCaseCard";
import { DOCS_META, DOCS_USE_CASES } from "@/lib/docs-data";

export const metadata: Metadata = {
  title: DOCS_META.title,
  description: DOCS_META.description,
  openGraph: {
    title: `${DOCS_META.title} · PolicyWell Docs`,
    description: DOCS_META.description,
    url: "https://policywell.ai/docs",
  },
};

export default function DocsStartHerePage() {
  return (
    <article className="pw-docs-article">
      <header className="pw-docs-article-header">
        <div className="pw-docs-title-row">
          <h1>{DOCS_META.title}</h1>
        </div>
        <p className="pw-docs-lede">{DOCS_META.description}</p>
      </header>

      <section aria-labelledby="use-cases-heading" className="pw-docs-section">
        <h2 id="use-cases-heading">Common use cases</h2>
        <div className="pw-docs-card-grid">
          {DOCS_USE_CASES.map((useCase) => (
            <UseCaseCard key={useCase.slug} useCase={useCase} />
          ))}
        </div>
      </section>

      <section aria-labelledby="using-heading" className="pw-docs-section">
        <h2 id="using-heading">Using PolicyWell</h2>
        <ol className="pw-docs-steps">
          <li className="pw-docs-step">
            <h3>Sign up</h3>
            <p>
              Sign in at{" "}
              <Link href="/login" className="pw-docs-inline-link">
                policywell.ai/login
              </Link>{" "}
              and complete household or advisor onboarding in the product.
            </p>
          </li>
          <li className="pw-docs-step">
            <h3>Connect insurance data</h3>
            <p>
              Upload a life insurance policy or illustration, or explore the{" "}
              <Link href="/demo" className="pw-docs-inline-link">
                product demo
              </Link>{" "}
              with an illustrative scenario. Then ask the{" "}
              <Link href="/agent" className="pw-docs-inline-link">
                AI Insurance Assistant
              </Link>
              .
            </p>
            <div className="pw-docs-codeblock" role="region" aria-label="Example prompt">
              <code>What does this policy cover, and is it appropriately funded?</code>
            </div>
          </li>
          <li className="pw-docs-step">
            <h3>Or build with PolicyWell</h3>
            <p>
              You are writing software that uses PolicyWell: a carrier workflow,
              IMO operations console, advisor CRM sync, or batch analysis
              pipeline.
            </p>
            <ol className="pw-docs-nested-steps">
              <li>
                Start with{" "}
                <Link href="/docs/guides/document-processing" className="pw-docs-inline-link">
                  Document Processing
                </Link>{" "}
                and{" "}
                <Link href="/docs/guides/policy-intelligence" className="pw-docs-inline-link">
                  Policy Intelligence
                </Link>
                .
              </li>
              <li>
                Review the{" "}
                <Link href="/docs/api" className="pw-docs-inline-link">
                  API Reference
                </Link>{" "}
                tab and{" "}
                <Link href="/docs/cli" className="pw-docs-inline-link">
                  CLI
                </Link>{" "}
                for batch and enterprise automation. Each use-case guide also
                links the related endpoints.
              </li>
              <li>
                See packaging on the{" "}
                <Link href="/pricing" className="pw-docs-inline-link">
                  pricing page
                </Link>
                .
              </li>
            </ol>
            <p className="pw-docs-note">
              Capabilities marked <strong>Preview</strong> or{" "}
              <strong>Planned</strong> on guide pages are not generally
              available yet.
            </p>
          </li>
        </ol>
      </section>
    </article>
  );
}
