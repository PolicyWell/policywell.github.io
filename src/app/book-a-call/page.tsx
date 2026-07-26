import type { Metadata } from "next";
import Link from "next/link";
import { CalEmbed } from "@/components/CalEmbed";
import { JsonLd } from "@/components/seo/JsonLd";
import { SiteNav } from "@/components/ui";
import { breadcrumbJsonLd, marketingMetadata } from "@/lib/seo";

export const metadata: Metadata = marketingMetadata({
  title: "Book a Call",
  description:
    "Book a PolicyWell discovery call — talk with an advisor about coverage, workflows, and whether PolicyWell is a fit. Not a hard sell.",
  path: "/book-a-call",
});

const FIT_YES = [
  "You run an agency, MGA, carrier team, or advisory practice evaluating AI workflows",
  "You want explainable recommendations with licensed human review — not a black box",
  "You need help comparing commercial, life, or annuity options across carriers",
  "You're ready to share sample policies, loss runs, or advisor workflows",
  "You want infrastructure and decision support, not a one-off quote widget",
] as const;

const FIT_NO = [
  "You're looking for the cheapest click-to-bind consumer quote with no advisor",
  "You want to hand off decisions completely and never review AI output",
  "You need a single-channel shopping site with no workflow or integration path",
  "You're not willing to collaborate on data, underwriting context, or product fit",
] as const;

export default function BookACallPage() {
  return (
    <div className="flex-1 flex flex-col min-w-0 w-full max-w-full overflow-x-clip">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Book a Call", path: "/book-a-call" },
        ])}
      />
      <SiteNav />
      <main className="pw-book min-w-0 w-full">
        <section className="pw-book-hero animate-rise">
          <div className="pw-shell pw-book-hero-inner">
            <p className="pw-book-eyebrow">Talk to PolicyWell</p>
            <h1 className="pw-book-h1">Book Your Discovery Call</h1>
            <p className="pw-book-lede">
              Let&apos;s talk about how to get your team clearer coverage
              decisions and insurance workflows that actually hold up.
            </p>
            <div className="pw-book-divider" aria-hidden />
            <p className="pw-book-reassurance">
              Not a hard sell — just a real conversation about your goals.
            </p>
          </div>
        </section>

        <section
          className="pw-book-scheduler animate-rise-delay"
          aria-label="Schedule a call"
        >
          <div className="pw-shell">
            <CalEmbed />
          </div>
        </section>

        <section className="pw-book-fit animate-rise-delay-2">
          <div className="pw-shell">
            <header className="pw-book-fit-head">
              <p className="pw-book-eyebrow">Are we a fit?</p>
              <h2 className="pw-book-h2">
                PolicyWell is built for a specific kind of insurance team.
              </h2>
            </header>

            <div className="pw-book-fit-grid">
              <div className="pw-book-fit-col is-yes">
                <h3>We&apos;re a fit if…</h3>
                <ul>
                  {FIT_YES.map((item) => (
                    <li key={item}>
                      <span className="pw-book-fit-mark" aria-hidden>
                        ✓
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pw-book-fit-col is-no">
                <h3>We probably aren&apos;t if…</h3>
                <ul>
                  {FIT_NO.map((item) => (
                    <li key={item}>
                      <span className="pw-book-fit-mark" aria-hidden>
                        ✗
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="pw-book-fit-alt">
              Prefer a form instead?{" "}
              <Link href="/quote/#contact">Request a quote</Link>
              {" · "}
              <a href="tel:+14708870449">(470) 887-0449</a>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
