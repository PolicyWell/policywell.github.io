import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/docs/UseCaseCard";
import { DOCS_USE_CASES, getUseCase } from "@/lib/docs-data";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return DOCS_USE_CASES.map((u) => ({ slug: u.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const useCase = getUseCase(slug);
  if (!useCase) return { title: "Not found" };
  return {
    title: useCase.title,
    description: useCase.summary,
    openGraph: {
      title: `${useCase.title} · PolicyWell Docs`,
      description: useCase.summary,
      url: `https://policywell.ai/docs/guides/${useCase.slug}`,
    },
  };
}

export default async function DocsGuidePage({ params }: PageProps) {
  const { slug } = await params;
  const useCase = getUseCase(slug);
  if (!useCase) notFound();

  const index = DOCS_USE_CASES.findIndex((u) => u.slug === slug);
  const prev = index > 0 ? DOCS_USE_CASES[index - 1] : null;
  const next =
    index >= 0 && index < DOCS_USE_CASES.length - 1
      ? DOCS_USE_CASES[index + 1]
      : null;

  return (
    <article className="pw-docs-article">
      <header className="pw-docs-article-header">
        <div className="pw-docs-title-row">
          <h1>{useCase.title}</h1>
          <StatusBadge status={useCase.status} />
        </div>
        <p className="pw-docs-lede">{useCase.summary}</p>
      </header>

      <section className="pw-docs-section">
        <h2>Overview</h2>
        <p className="pw-docs-body">{useCase.overview}</p>
      </section>

      <section className="pw-docs-section">
        <h2>Capabilities</h2>
        <ul className="pw-docs-capability-list">
          {useCase.capabilities.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      {useCase.nextSteps && useCase.nextSteps.length > 0 && (
        <section className="pw-docs-section">
          <h2>Next steps</h2>
          <div className="pw-docs-next-steps">
            {useCase.nextSteps.map((step) => (
              <Link key={step.href} href={step.href} className="pw-docs-next-step">
                {step.label}
              </Link>
            ))}
          </div>
        </section>
      )}

      <nav className="pw-docs-pager" aria-label="Adjacent use cases">
        {prev ? (
          <Link href={`/docs/guides/${prev.slug}`} className="pw-docs-pager-link">
            <span className="pw-docs-pager-label">Previous</span>
            <span className="pw-docs-pager-title">{prev.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/docs/guides/${next.slug}`}
            className="pw-docs-pager-link is-next"
          >
            <span className="pw-docs-pager-label">Next</span>
            <span className="pw-docs-pager-title">{next.title}</span>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}
