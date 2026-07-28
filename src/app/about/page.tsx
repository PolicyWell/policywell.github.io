import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { SiteBreadcrumbs } from "@/components/seo/SiteBreadcrumbs";
import { SiteNav } from "@/components/ui";
import { breadcrumbJsonLd, marketingMetadata } from "@/lib/seo";

const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
] as const;

export const metadata: Metadata = marketingMetadata({
  title: "About PolicyWell | Building Insurance Intelligence",
  description:
    "PolicyWell builds AI infrastructure for insurance — policy intelligence, commercial risk review, and advisor-ready workflows with human oversight. Based in Atlanta and Boston.",
  path: "/about",
  absoluteTitle: true,
});

export default function AboutPage() {
  return (
    <div className="flex-1 flex flex-col min-w-0 w-full max-w-full overflow-x-clip">
      <JsonLd data={breadcrumbJsonLd([...CRUMBS])} />
      <SiteNav />
      <main className="pw-shell py-8 md:py-12 space-y-10 min-w-0 w-full">
        <SiteBreadcrumbs items={[...CRUMBS]} />
        <header className="animate-rise max-w-2xl space-y-3">
          <p className="text-xs uppercase tracking-[0.22em] text-moss">About</p>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-pine">
            Building insurance intelligence
          </h1>
          <p className="text-stone text-sm md:text-base leading-relaxed">
            PolicyWell is the agentic operating system for insurance and
            financial services. We help insurers, agencies, advisors, and
            policyholders analyze coverage, automate workflows, identify risks,
            and make better insurance decisions — with licensed humans in the
            loop.
          </p>
        </header>

        <section className="animate-rise-delay max-w-2xl space-y-3">
          <h2 className="font-display text-2xl text-pine">What we build</h2>
          <p className="text-sm text-stone leading-relaxed">
            Our platform covers personal lines (including life insurance and
            annuities), commercial industry verticals, and developer APIs for
            carriers and distribution partners. We sit above CRMs, brokerage
            portals, and carrier admin systems rather than replacing them.
          </p>
          <p className="text-sm text-stone leading-relaxed">
            Learn more in{" "}
            <Link href="/press/" className="underline hover:text-pine">
              Press
            </Link>
            , explore open roles on{" "}
            <Link href="/careers/" className="underline hover:text-pine">
              Careers
            </Link>
            , or browse the{" "}
            <Link href="/platform/" className="underline hover:text-pine">
              Platform
            </Link>
            .
          </p>
        </section>

        <section className="animate-rise-delay-2 max-w-2xl space-y-3">
          <h2 className="font-display text-2xl text-pine">Where we work</h2>
          <p className="text-sm text-stone leading-relaxed">
            PolicyWell is built with care in Atlanta and Boston. For media,
            partnerships, or general inquiries, visit{" "}
            <Link href="/contact/" className="underline hover:text-pine">
              Contact
            </Link>{" "}
            or email{" "}
            <a
              className="underline hover:text-pine"
              href="mailto:info@policywell.ai"
            >
              info@policywell.ai
            </a>
            .
          </p>
        </section>
      </main>
    </div>
  );
}
