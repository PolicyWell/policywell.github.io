import type { Metadata } from "next";
import Link from "next/link";
import { DeckViewer } from "@/components/DeckViewer";
import { LiveAnalysisCounter } from "@/components/LiveAnalysisCounter";
import { PolicyWellCLIShowcase } from "@/components/PolicyWellCLIShowcase";
import { JsonLd } from "@/components/seo/JsonLd";
import { SiteNav } from "@/components/ui";
import {
  marketingMetadata,
  organizationJsonLd,
  softwareApplicationJsonLd,
  webSiteJsonLd,
} from "@/lib/seo";

export const metadata: Metadata = marketingMetadata({
  title: "PolicyWell | AI Infrastructure for Insurance",
  description:
    "PolicyWell helps insurers, agencies, advisors, and policyholders analyze coverage, automate insurance workflows, identify risks, and make better insurance decisions.",
  path: "/",
  absoluteTitle: true,
  ogTitle: "PolicyWell | AI Infrastructure for Insurance",
});

const PRIMARY_LINKS = [
  {
    href: "/platform/",
    label: "Explore the PolicyWell Platform",
    blurb: "Product tour, demos, and insurance intelligence modules.",
  },
  {
    href: "/industries/",
    label: "Browse insurance industry solutions",
    blurb: "Life, annuities, commercial verticals, and more.",
  },
  {
    href: "/demo/",
    label: "Watch the PolicyWell demo",
    blurb: "See policy ingest, context, and recommendations in action.",
  },
  {
    href: "/api/",
    label: "Explore the PolicyWell API",
    blurb: "Developer endpoints for documents, policies, and quotes.",
  },
  {
    href: "/docs/",
    label: "Read product documentation",
    blurb: "Guides, CLI notes, and integration references.",
  },
  {
    href: "/pricing/",
    label: "View PolicyWell pricing",
    blurb: "Plans for policyholders, advisors, IMOs, and carriers.",
  },
  {
    href: "/about/",
    label: "About the company",
    blurb: "Mission, locations, press, and careers.",
  },
  {
    href: "/contact/",
    label: "Contact PolicyWell",
    blurb: "Email, phone, quote requests, and discovery calls.",
  },
] as const;

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col min-w-0 w-full max-w-full overflow-x-clip">
      <JsonLd
        data={[
          organizationJsonLd(),
          webSiteJsonLd(),
          softwareApplicationJsonLd(),
        ]}
      />
      <SiteNav />
      <main className="relative flex-1 min-w-0 w-full overflow-x-clip">
        <section className="relative overflow-hidden flex flex-col pw-home-hero">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 pw-home-hero-bg"
          />
          <div className="pw-shell flex-1 flex flex-col justify-center items-center text-center pt-10 pb-6 md:pt-14 md:pb-8">
            <LiveAnalysisCounter className="animate-rise mb-5 md:mb-6" />
            <p className="animate-rise text-[11px] uppercase tracking-[0.22em] text-moss mb-3">
              PolicyWell
            </p>
            <h1 className="animate-rise font-display text-[2rem] leading-[1.05] sm:text-3xl md:text-5xl lg:text-6xl max-w-4xl tracking-tight text-pine">
              The Agentic Operating System for the Insurance &amp; Financial
              Services Industry
            </h1>
            <p className="animate-rise-delay mt-4 max-w-2xl text-sm md:text-base text-stone">
              PolicyWell transforms insurance data into personalized
              recommendations and actionable insights with AI agents
            </p>
          </div>

          <div className="pw-shell pb-4 md:pb-6 animate-rise-delay-2">
            <PolicyWellCLIShowcase compact />
          </div>

          <div className="pw-shell pb-8 md:pb-10 flex flex-col sm:flex-row flex-wrap gap-3 animate-rise-delay-2">
            <Link
              href="/platform/"
              className="pw-btn w-full sm:w-auto justify-center"
            >
              Explore the Platform
            </Link>
            <Link
              href="/quote/#contact"
              className="pw-btn pw-btn-secondary w-full sm:w-auto justify-center"
            >
              Get a Quote
            </Link>
            <Link
              href="/demo/"
              className="pw-btn pw-btn-secondary w-full sm:w-auto justify-center"
            >
              Watch the demo
            </Link>
          </div>
        </section>

        <section
          className="border-t border-pine/10 bg-foam/50"
          aria-labelledby="home-platform"
        >
          <div className="pw-shell py-10 md:py-14 space-y-6">
            <div className="max-w-2xl">
              <h2
                id="home-platform"
                className="font-display text-2xl md:text-3xl text-pine"
              >
                Platform
              </h2>
              <p className="text-stone mt-2 text-sm md:text-base">
                Insurance intelligence modules for policy analysis, commercial
                risk, and advisor-ready workflows.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/platform/"
                className="pw-btn"
              >
                Explore the PolicyWell Platform
              </Link>
              <Link
                href="/product/"
                className="pw-btn pw-btn-secondary"
              >
                Open the product tour
              </Link>
            </div>
          </div>
        </section>

        <section
          className="border-t border-pine/10"
          aria-labelledby="home-industries"
        >
          <div className="pw-shell py-10 md:py-14 space-y-6">
            <div className="max-w-2xl">
              <h2
                id="home-industries"
                className="font-display text-2xl md:text-3xl text-pine"
              >
                Industries
              </h2>
              <p className="text-stone mt-2 text-sm md:text-base">
                Coverage review for life insurance, annuities, and commercial
                verticals from contractors to restaurants and trucking.
              </p>
            </div>
            <Link
              href="/industries/"
              className="inline-flex text-sm text-moss underline hover:text-pine"
            >
              Browse insurance industry solutions
            </Link>
          </div>
        </section>

        <section
          className="border-t border-pine/10 bg-foam/40"
          aria-labelledby="home-demo"
        >
          <div className="pw-shell py-10 md:py-14 space-y-6">
            <div className="max-w-2xl">
              <h2
                id="home-demo"
                className="font-display text-2xl md:text-3xl text-pine"
              >
                Demo
              </h2>
              <p className="text-stone mt-2 text-sm md:text-base">
                Watch PolicyWell ingest a policy, build household context, and
                surface recommendations with advisors in the loop.
              </p>
            </div>
            <Link href="/demo/" className="pw-btn">
              Watch the PolicyWell demo
            </Link>
          </div>
        </section>

        <section
          className="border-t border-pine/10"
          aria-labelledby="home-developers"
        >
          <div className="pw-shell py-10 md:py-14 space-y-6">
            <div className="max-w-2xl">
              <h2
                id="home-developers"
                className="font-display text-2xl md:text-3xl text-pine"
              >
                Developers
              </h2>
              <p className="text-stone mt-2 text-sm md:text-base">
                Integrate insurance intelligence into carrier and distribution
                systems with documented REST endpoints.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/api/" className="pw-btn">
                Explore the PolicyWell API
              </Link>
              <Link href="/docs/" className="pw-btn pw-btn-secondary">
                Read product documentation
              </Link>
            </div>
          </div>
        </section>

        <section
          className="border-t border-pine/10 bg-foam/50"
          aria-labelledby="home-pricing"
        >
          <div className="pw-shell py-10 md:py-14 space-y-6">
            <div className="max-w-2xl">
              <h2
                id="home-pricing"
                className="font-display text-2xl md:text-3xl text-pine"
              >
                Pricing
              </h2>
              <p className="text-stone mt-2 text-sm md:text-base">
                Free for policyholders, with plans for advisors, IMOs, and
                carriers across the insurance ecosystem.
              </p>
            </div>
            <Link href="/pricing/" className="pw-btn">
              View PolicyWell pricing
            </Link>
          </div>
        </section>

        <section
          className="border-t border-pine/10"
          aria-labelledby="home-company"
        >
          <div className="pw-shell py-10 md:py-14 space-y-6">
            <div className="max-w-2xl">
              <h2
                id="home-company"
                className="font-display text-2xl md:text-3xl text-pine"
              >
                Company
              </h2>
              <p className="text-stone mt-2 text-sm md:text-base">
                Built in Atlanta and Boston. Reach the team for partnerships,
                press, careers, or product questions.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              <Link href="/about/" className="underline hover:text-pine text-moss">
                About the company
              </Link>
              <Link
                href="/contact/"
                className="underline hover:text-pine text-moss"
              >
                Contact PolicyWell
              </Link>
              <Link href="/press/" className="underline hover:text-pine text-moss">
                Press
              </Link>
              <Link
                href="/careers/"
                className="underline hover:text-pine text-moss"
              >
                Careers
              </Link>
            </div>
          </div>
        </section>

        <section
          className="border-t border-pine/10 bg-foam/40"
          aria-labelledby="home-sitemap-links"
        >
          <div className="pw-shell py-10 md:py-14 space-y-5">
            <h2
              id="home-sitemap-links"
              className="font-display text-2xl md:text-3xl text-pine"
            >
              Explore PolicyWell
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2 max-w-4xl">
              {PRIMARY_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block rounded-[var(--radius)] border border-pine/10 bg-white/70 px-4 py-3 hover:border-pine/30"
                  >
                    <span className="text-sm font-medium text-pine">
                      {item.label}
                    </span>
                    <span className="block text-xs text-stone mt-1">
                      {item.blurb}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          id="deck"
          className="border-t border-pine/10 bg-foam/40 backdrop-blur-sm"
        >
          <div className="pw-shell py-12 md:py-20 space-y-6 md:space-y-8">
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end justify-between gap-4">
              <div className="max-w-xl">
                <h2 className="font-display text-3xl md:text-4xl text-pine">
                  View our deck
                </h2>
              </div>
              <Link
                href="/deck"
                className="pw-btn !py-2.5 text-sm w-full sm:w-auto justify-center"
              >
                Open full deck
              </Link>
            </div>
            <DeckViewer compact />
          </div>
        </section>
      </main>
    </div>
  );
}
