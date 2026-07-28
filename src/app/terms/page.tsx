import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { SiteBreadcrumbs } from "@/components/seo/SiteBreadcrumbs";
import { SiteNav } from "@/components/ui";
import { breadcrumbJsonLd, marketingMetadata } from "@/lib/seo";

const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "Terms of Service", path: "/terms" },
] as const;

export const metadata: Metadata = marketingMetadata({
  title: "Terms of Service | PolicyWell",
  description:
    "Terms governing use of the PolicyWell website and insurance intelligence products at policywell.ai.",
  path: "/terms",
  absoluteTitle: true,
});

export default function TermsPage() {
  return (
    <div className="flex-1 flex flex-col min-w-0 w-full max-w-full overflow-x-clip">
      <JsonLd data={breadcrumbJsonLd([...CRUMBS])} />
      <SiteNav />
      <main className="pw-shell py-8 md:py-12 space-y-8 min-w-0 w-full max-w-3xl">
        <SiteBreadcrumbs items={[...CRUMBS]} />
        <header className="space-y-3">
          <h1 className="font-display text-3xl sm:text-4xl text-pine">
            Terms of Service
          </h1>
          <p className="text-sm text-stone">Last updated: July 28, 2026</p>
        </header>

        <section className="space-y-3 text-sm text-stone leading-relaxed">
          <h2 className="font-display text-xl text-pine">Agreement</h2>
          <p>
            By accessing policywell.ai or using PolicyWell products, you agree
            to these Terms. If you use PolicyWell on behalf of an organization,
            you represent that you have authority to bind that organization.
          </p>
        </section>

        <section className="space-y-3 text-sm text-stone leading-relaxed">
          <h2 className="font-display text-xl text-pine">
            Decision support only
          </h2>
          <p>
            PolicyWell provides insurance intelligence and decision support. It
            does not issue bindable insurance quotes, make final underwriting
            decisions, or replace licensed advisors, brokers, or carriers.
            Always confirm coverage with a licensed professional and the
            issuing carrier.
          </p>
        </section>

        <section className="space-y-3 text-sm text-stone leading-relaxed">
          <h2 className="font-display text-xl text-pine">Acceptable use</h2>
          <p>
            You may not misuse the site, attempt unauthorized access, scrape in
            a way that degrades service, upload unlawful content, or use the
            platform to provide regulated insurance advice without appropriate
            licenses.
          </p>
        </section>

        <section className="space-y-3 text-sm text-stone leading-relaxed">
          <h2 className="font-display text-xl text-pine">Accounts and data</h2>
          <p>
            You are responsible for credentials you control and for the accuracy
            of information you submit. Our handling of personal data is
            described in the{" "}
            <Link href="/privacy/" className="underline hover:text-pine">
              Privacy Policy
            </Link>
            .
          </p>
        </section>

        <section className="space-y-3 text-sm text-stone leading-relaxed">
          <h2 className="font-display text-xl text-pine">Contact</h2>
          <p>
            Questions about these Terms:{" "}
            <a
              className="underline hover:text-pine"
              href="mailto:info@policywell.ai"
            >
              info@policywell.ai
            </a>{" "}
            or{" "}
            <Link href="/contact/" className="underline hover:text-pine">
              Contact
            </Link>
            .
          </p>
        </section>
      </main>
    </div>
  );
}
