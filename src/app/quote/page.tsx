import type { Metadata } from "next";
import Link from "next/link";
import { QuoteRequestForm } from "@/components/QuoteRequestForm";
import { JsonLd } from "@/components/seo/JsonLd";
import { SiteNav } from "@/components/ui";
import { breadcrumbJsonLd, marketingMetadata } from "@/lib/seo";

export const metadata: Metadata = marketingMetadata({
  title: "Get a Quote",
  description:
    "Request a PolicyWell coverage quote. A licensed advisor reviews every request.",
  path: "/quote",
});

export default function QuotePage() {
  return (
    <div className="flex-1 flex flex-col min-w-0 w-full max-w-full overflow-x-clip">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Get a Quote", path: "/quote" },
        ])}
      />
      <SiteNav />
      <main className="pw-shell py-8 md:py-12 min-w-0 w-full">
        <section id="contact" className="pw-quote-shell animate-rise">
          <aside className="pw-quote-aside">
            <div className="pw-quote-aside-inner">
              <p className="pw-quote-aside-kicker">PolicyWell Quotes</p>
              <h2 className="font-display text-3xl md:text-4xl text-foam leading-tight">
                Ready for better coverage?
              </h2>
              <p className="pw-quote-aside-copy">
                Fill out the form and a PolicyWell advisor will get back to you
                within the next hour - with explainable recommendations and human
                review.
              </p>
              <div className="pw-quote-aside-actions">
                <a className="pw-quote-ghost-btn" href="tel:+14708870449">
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    aria-hidden
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 16.9v2a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h2a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L7.1 9.9a16 16 0 0 0 6 6l1.5-1.1a2 2 0 0 1 2.1-.4c.8.3 1.7.5 2.6.6A2 2 0 0 1 22 16.9z" />
                  </svg>
                  (470) 887-0449
                </a>
                <a
                  className="pw-quote-ghost-btn"
                  href="/book-a-call/"
                >
                  Or book a call
                </a>
                <Link className="pw-quote-ghost-btn" href="/agent">
                  Or talk to the agent
                </Link>
              </div>
            </div>
          </aside>
          <div className="pw-quote-panel">
            <QuoteRequestForm />
          </div>
        </section>
      </main>
    </div>
  );
}
