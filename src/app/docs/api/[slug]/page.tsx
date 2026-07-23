import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiEndpointBlock } from "@/components/docs/ApiEndpointBlock";
import { API_GROUPS, getApiGroup } from "@/lib/api-reference-data";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return API_GROUPS.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const group = getApiGroup(slug);
  if (!group) return { title: "Not found" };
  return {
    title: group.title,
    description: group.summary,
    openGraph: {
      title: `${group.title} · PolicyWell API`,
      description: group.summary,
      url: `https://policywell.ai/docs/api/${group.slug}`,
    },
  };
}

export default async function ApiGroupPage({ params }: PageProps) {
  const { slug } = await params;
  const group = getApiGroup(slug);
  if (!group) notFound();

  const index = API_GROUPS.findIndex((g) => g.slug === slug);
  const prev = index > 0 ? API_GROUPS[index - 1] : null;
  const next =
    index >= 0 && index < API_GROUPS.length - 1 ? API_GROUPS[index + 1] : null;

  return (
    <article className="pw-docs-article pw-docs-article-wide">
      <header className="pw-docs-article-header">
        <div className="pw-docs-title-row">
          <h1>{group.title}</h1>
          <span className={`pw-docs-status pw-docs-status-${group.status.toLowerCase()}`}>
            {group.status}
          </span>
        </div>
        <p className="pw-docs-lede">{group.summary}</p>
      </header>

      <nav className="pw-api-toc" aria-label={`${group.title} endpoints`}>
        <ul>
          {group.endpoints.map((endpoint) => (
            <li key={endpoint.id}>
              <a href={`#${endpoint.id}`}>
                <span
                  className={`pw-api-method pw-api-method-${endpoint.method.toLowerCase()}`}
                >
                  {endpoint.method}
                </span>
                <code>{endpoint.path}</code>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="pw-api-endpoint-list">
        {group.endpoints.map((endpoint) => (
          <ApiEndpointBlock key={endpoint.id} endpoint={endpoint} />
        ))}
      </div>

      <nav className="pw-docs-pager" aria-label="Adjacent API groups">
        {prev ? (
          <Link href={`/docs/api/${prev.slug}`} className="pw-docs-pager-link">
            <span className="pw-docs-pager-label">Previous</span>
            <span className="pw-docs-pager-title">{prev.title}</span>
          </Link>
        ) : (
          <Link href="/docs/api" className="pw-docs-pager-link">
            <span className="pw-docs-pager-label">Previous</span>
            <span className="pw-docs-pager-title">API reference</span>
          </Link>
        )}
        {next ? (
          <Link href={`/docs/api/${next.slug}`} className="pw-docs-pager-link is-next">
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
