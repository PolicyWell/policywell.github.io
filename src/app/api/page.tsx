import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { SiteBreadcrumbs } from "@/components/seo/SiteBreadcrumbs";
import { SiteNav } from "@/components/ui";
import { API_BASE_URL, API_GROUPS, API_META } from "@/lib/api-reference-data";
import { breadcrumbJsonLd, marketingMetadata } from "@/lib/seo";

const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "API", path: "/api" },
] as const;

export const metadata: Metadata = marketingMetadata({
  title: "PolicyWell API | Insurance Intelligence for Developers",
  description:
    "Integrate PolicyWell insurance intelligence into carrier, IMO, and agency systems. Explore REST endpoints for documents, policies, quotes, and workflows.",
  path: "/api",
  absoluteTitle: true,
});

export default function ApiLandingPage() {
  const publicGroups = API_GROUPS.filter((g) => g.status !== "Planned").slice(
    0,
    6,
  );

  return (
    <div className="flex-1 flex flex-col min-w-0 w-full max-w-full overflow-x-clip">
      <JsonLd data={breadcrumbJsonLd([...CRUMBS])} />
      <SiteNav />
      <main className="pw-shell py-8 md:py-12 space-y-10 min-w-0 w-full">
        <SiteBreadcrumbs items={[...CRUMBS]} />
        <header className="animate-rise max-w-2xl space-y-3">
          <p className="text-xs uppercase tracking-[0.22em] text-moss">API</p>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-pine">
            Insurance intelligence for developers
          </h1>
          <p className="text-stone text-sm md:text-base leading-relaxed">
            {API_META.description} Use the PolicyWell API to wire document
            ingest, policy context, quote intake, and carrier workflows into
            your stack.
          </p>
        </header>

        <section className="animate-rise-delay max-w-2xl space-y-3">
          <h2 className="font-display text-2xl text-pine">Base URL</h2>
          <p className="text-sm text-stone">
            <code className="rounded bg-mist/80 px-2 py-1 text-pine">
              {API_BASE_URL}
            </code>
          </p>
          <p className="text-sm text-stone leading-relaxed">
            Authenticate with bearer API keys (
            <code className="text-pine">pw_test_</code> for sandbox,{" "}
            <code className="text-pine">pw_live_</code> for production). Machine
            readable contract:{" "}
            <Link href="/openapi.json" className="underline hover:text-pine">
              openapi.json
            </Link>
            .
          </p>
        </section>

        <section
          className="animate-rise-delay-2 space-y-4"
          aria-labelledby="api-groups"
        >
          <h2 id="api-groups" className="font-display text-2xl text-pine">
            API groups
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {publicGroups.map((group) => (
              <li key={group.slug}>
                <Link
                  href={`/docs/api/${group.slug}/`}
                  className="block rounded-[var(--radius)] border border-pine/10 bg-foam/70 p-4 hover:border-pine/30"
                >
                  <span className="font-display text-pine">{group.title}</span>
                  <span className="block text-sm text-stone mt-1">
                    {group.summary}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="text-sm text-stone">
            Full reference lives in{" "}
            <Link href="/docs/api/" className="underline hover:text-pine">
              PolicyWell API documentation
            </Link>{" "}
            and the{" "}
            <Link
              href="/docs/api/reference/"
              className="underline hover:text-pine"
            >
              single-page API reference
            </Link>
            .
          </p>
        </section>
      </main>
    </div>
  );
}
