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
        <p className="pw-docs-eyebrow">Overview</p>
        <h1>{DOCS_META.title}</h1>
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
            <h3>Create an account</h3>
            <p>
              Sign in at{" "}
              <Link href="/login" className="pw-docs-inline-link">
                policywell.ai/login
              </Link>{" "}
              and complete household or advisor onboarding.
            </p>
          </li>
          <li className="pw-docs-step">
            <h3>Connect a policy or illustration</h3>
            <p>
              Upload a life insurance policy or illustration, or explore the{" "}
              <Link href="/demo" className="pw-docs-inline-link">
                product demo
              </Link>{" "}
              with an illustrative scenario.
            </p>
          </li>
          <li className="pw-docs-step">
            <h3>Review intelligence with a human in the loop</h3>
            <p>
              Ask the{" "}
              <Link href="/agent" className="pw-docs-inline-link">
                AI Insurance Assistant
              </Link>
              , review policy-health signals, and approve recommendations before
              client presentation.
            </p>
          </li>
          <li className="pw-docs-step">
            <h3>Integrate across the ecosystem</h3>
            <p>
              Carriers, IMOs, and technology teams can explore the{" "}
              <Link href="/docs/cli" className="pw-docs-inline-link">
                CLI
              </Link>
              , planned APIs, webhooks, and white-label deployment options.
            </p>
          </li>
        </ol>
      </section>

      <section aria-labelledby="build-heading" className="pw-docs-section">
        <h2 id="build-heading">Or build with PolicyWell</h2>
        <p className="pw-docs-body">
          You are writing software that uses PolicyWell: a carrier workflow, IMO
          operations console, advisor CRM sync, or batch analysis pipeline.
        </p>
        <ul className="pw-docs-bullet-list">
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
            <Link href="/docs/cli" className="pw-docs-inline-link">
              CLI design
            </Link>{" "}
            for batch and enterprise automation.
          </li>
          <li>
            See packaging on the{" "}
            <Link href="/pricing" className="pw-docs-inline-link">
              pricing page
            </Link>
            .
          </li>
        </ul>
        <p className="pw-docs-note">
          Capabilities marked <strong>Preview</strong> or <strong>Planned</strong>{" "}
          are not generally available. Do not treat them as production-ready
          integrations until status changes to Available.
        </p>
      </section>
    </article>
  );
}
