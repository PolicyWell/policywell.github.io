import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { SiteNav } from "@/components/ui";
import { breadcrumbJsonLd, marketingMetadata } from "@/lib/seo";

export const metadata: Metadata = marketingMetadata({
  title: "Press",
  description:
    "Press resources for PolicyWell — product narrative, media contacts, and company background for journalists and partners.",
  path: "/press",
});

export default function PressPage() {
  return (
    <div className="flex-1 flex flex-col min-w-0 w-full max-w-full overflow-x-clip">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Company", path: "/press" },
          { name: "Press", path: "/press" },
        ])}
      />
      <SiteNav />
      <main className="pw-shell py-10 md:py-14 space-y-8 min-w-0 w-full">
        <header className="animate-rise max-w-2xl space-y-3">
          <p className="text-xs uppercase tracking-[0.22em] text-moss">
            Company
          </p>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-pine">
            Press
          </h1>
          <p className="text-stone text-sm md:text-base">
            PolicyWell is the agentic operating system for insurance and
            financial services — policy intelligence, commercial risk, and
            advisor-ready workflows with human review.
          </p>
        </header>

        <section className="animate-rise-delay max-w-xl">
          <article className="rounded-[var(--radius)] border border-pine/10 bg-foam/70 p-5 md:p-6">
            <h2 className="font-display text-xl text-pine">Media contact</h2>
            <p className="text-sm text-stone mt-2 leading-relaxed">
              For interviews, product briefings, or logo assets, email{" "}
              <a
                className="underline hover:text-pine"
                href="mailto:info@policywell.ai"
              >
                info@policywell.ai
              </a>{" "}
              or call{" "}
              <a className="underline hover:text-pine" href="tel:+14708870449">
                (470) 887-0449
              </a>
              .
            </p>
          </article>
        </section>

        <p className="animate-rise-delay-2 text-sm text-stone">
          Looking for product documentation?{" "}
          <Link href="/docs/" className="underline hover:text-pine">
            Open Documentation
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
