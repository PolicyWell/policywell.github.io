import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { SiteBreadcrumbs } from "@/components/seo/SiteBreadcrumbs";
import { SiteNav } from "@/components/ui";
import { BOOK_A_CALL_PATH } from "@/lib/book-a-call";
import { breadcrumbJsonLd, marketingMetadata } from "@/lib/seo";

const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "Contact", path: "/contact" },
] as const;

const PHONE_DISPLAY = "(470) 887-0449";
const PHONE_HREF = "tel:+14708870449";

export const metadata: Metadata = marketingMetadata({
  title: "Contact PolicyWell",
  description:
    "Contact PolicyWell for coverage reviews, product questions, partnerships, or media. Call (470) 887-0449 or email info@policywell.ai.",
  path: "/contact",
  absoluteTitle: true,
});

export default function ContactPage() {
  return (
    <div className="flex-1 flex flex-col min-w-0 w-full max-w-full overflow-x-clip">
      <JsonLd data={breadcrumbJsonLd([...CRUMBS])} />
      <SiteNav />
      <main className="pw-shell py-8 md:py-12 space-y-10 min-w-0 w-full">
        <SiteBreadcrumbs items={[...CRUMBS]} />
        <header className="animate-rise max-w-2xl space-y-3">
          <p className="text-xs uppercase tracking-[0.22em] text-moss">
            Contact
          </p>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-pine">
            Contact PolicyWell
          </h1>
          <p className="text-stone text-sm md:text-base leading-relaxed">
            Reach the team for coverage reviews, product questions, partnership
            conversations, or media inquiries. A licensed advisor reviews every
            insurance quote request.
          </p>
        </header>

        <section
          className="animate-rise-delay grid gap-4 sm:grid-cols-2 max-w-3xl"
          aria-labelledby="contact-channels"
        >
          <h2 id="contact-channels" className="sr-only">
            Contact channels
          </h2>
          <article className="rounded-[var(--radius)] border border-pine/10 bg-foam/70 p-5">
            <h3 className="font-display text-lg text-pine">Email</h3>
            <p className="text-sm text-stone mt-2">
              <a
                className="underline hover:text-pine"
                href="mailto:info@policywell.ai"
              >
                info@policywell.ai
              </a>
            </p>
          </article>
          <article className="rounded-[var(--radius)] border border-pine/10 bg-foam/70 p-5">
            <h3 className="font-display text-lg text-pine">Phone</h3>
            <p className="text-sm text-stone mt-2">
              <a className="underline hover:text-pine" href={PHONE_HREF}>
                {PHONE_DISPLAY}
              </a>
            </p>
          </article>
        </section>

        <section className="animate-rise-delay-2 max-w-2xl space-y-4">
          <h2 className="font-display text-2xl text-pine">Next steps</h2>
          <ul className="space-y-3 text-sm text-stone">
            <li>
              <Link href="/quote/#contact" className="underline hover:text-pine">
                Request a coverage quote
              </Link>{" "}
              for life, annuity, or business insurance.
            </li>
            <li>
              <Link href={BOOK_A_CALL_PATH} className="underline hover:text-pine">
                Book a discovery call
              </Link>{" "}
              to discuss platform or partnership fit.
            </li>
            <li>
              <Link href="/press/" className="underline hover:text-pine">
                Press and media resources
              </Link>{" "}
              for interviews and briefings.
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}
