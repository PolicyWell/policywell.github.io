import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { SiteBreadcrumbs } from "@/components/seo/SiteBreadcrumbs";
import { SiteNav } from "@/components/ui";
import { breadcrumbJsonLd, marketingMetadata } from "@/lib/seo";

const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "Platform", path: "/platform" },
] as const;

export const metadata: Metadata = marketingMetadata({
  title: "PolicyWell Platform | AI Insurance Intelligence",
  description:
    "Explore the PolicyWell platform — product tour, interactive demo, and insurance intelligence workflows for advisors, agencies, carriers, and policyholders.",
  path: "/platform",
  absoluteTitle: true,
});

const MODULES = [
  {
    href: "/platform/coverage-library/",
    title: "Coverage Library",
    body: "Browse benchmark coverage standards by industry, open requirement sets, and apply profiles to live gap assessments.",
    cta: "Open the Coverage Library",
  },
  {
    href: "/product/",
    title: "Interactive product tour",
    body: "Walk through dashboard, risk, marketplace, claims, CRM, and policy analyzer modules in a guided tour.",
    cta: "Open the product tour",
  },
  {
    href: "/demo/",
    title: "Lifecycle demo",
    body: "See how PolicyWell ingests a policy, builds context, and surfaces advisor-ready recommendations.",
    cta: "Watch the demo",
  },
  {
    href: "/docs/",
    title: "Platform documentation",
    body: "Guides for getting started, common use cases, CLI patterns, and engineering notes.",
    cta: "Read the docs",
  },
  {
    href: "/api/",
    title: "Developer API",
    body: "Insurance intelligence endpoints for documents, policies, quotes, and carrier workflows.",
    cta: "Explore the API",
  },
] as const;

export default function PlatformPage() {
  return (
    <div className="flex-1 flex flex-col min-w-0 w-full max-w-full overflow-x-clip">
      <JsonLd data={breadcrumbJsonLd([...CRUMBS])} />
      <SiteNav />
      <main className="pw-shell py-8 md:py-12 space-y-10 min-w-0 w-full">
        <SiteBreadcrumbs items={[...CRUMBS]} />
        <header className="animate-rise max-w-2xl space-y-3">
          <p className="text-xs uppercase tracking-[0.22em] text-moss">
            Platform
          </p>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-pine">
            AI insurance intelligence in one platform
          </h1>
          <p className="text-stone text-sm md:text-base leading-relaxed">
            PolicyWell sits above existing insurance workflows. Use the product
            tour and demo to see policy analysis, commercial risk review, and
            advisor-approved recommendations — with human review gates.
          </p>
        </header>

        <section className="animate-rise-delay space-y-4" aria-labelledby="platform-modules">
          <h2 id="platform-modules" className="font-display text-2xl text-pine">
            Explore platform modules
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {MODULES.map((mod) => (
              <li
                key={mod.href}
                className="rounded-[var(--radius)] border border-pine/10 bg-foam/70 p-5"
              >
                <h3 className="font-display text-lg text-pine">{mod.title}</h3>
                <p className="text-sm text-stone mt-2 leading-relaxed">
                  {mod.body}
                </p>
                <Link
                  href={mod.href}
                  className="inline-block mt-3 text-sm text-moss underline hover:text-pine"
                >
                  {mod.cta}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="animate-rise-delay-2 max-w-2xl space-y-3">
          <h2 className="font-display text-2xl text-pine">
            Built for the insurance ecosystem
          </h2>
          <p className="text-sm text-stone leading-relaxed">
            From individuals and families to IMOs and carriers, PolicyWell
            provides decision support — not a bindable quote engine or
            autonomous underwriter.{" "}
            <Link href="/pricing/" className="underline hover:text-pine">
              Compare plans and pricing
            </Link>{" "}
            or{" "}
            <Link href="/contact/" className="underline hover:text-pine">
              contact the team
            </Link>
            .
          </p>
        </section>
      </main>
    </div>
  );
}
