import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { SiteNav } from "@/components/ui";
import { breadcrumbJsonLd, marketingMetadata } from "@/lib/seo";

export const metadata: Metadata = marketingMetadata({
  title: "Careers",
  description:
    "Careers at PolicyWell — join a Boston-built team building AI infrastructure for insurance and financial services.",
  path: "/careers",
});

export default function CareersPage() {
  return (
    <div className="flex-1 flex flex-col min-w-0 w-full max-w-full overflow-x-clip">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Company", path: "/careers" },
          { name: "Careers", path: "/careers" },
        ])}
      />
      <SiteNav />
      <main className="pw-shell py-10 md:py-14 space-y-8 min-w-0 w-full">
        <header className="animate-rise max-w-2xl space-y-3">
          <p className="text-xs uppercase tracking-[0.22em] text-moss">
            Company
          </p>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-pine">
            Careers
          </h1>
          <p className="text-stone text-sm md:text-base">
            We&apos;re building the agentic layer for insurance — with high
            standards for accuracy, explainability, and human control. Built
            with care in Boston.
          </p>
        </header>

        <section className="animate-rise-delay max-w-xl space-y-3">
          <h2 className="font-display text-2xl text-pine">How to apply</h2>
          <p className="text-sm text-stone leading-relaxed">
            Send a short note on the role you want, relevant work, and why
            insurance systems interest you to{" "}
            <a
              className="underline hover:text-pine"
              href="mailto:careers@policywell.ai"
            >
              careers@policywell.ai
            </a>
            .
          </p>
          <p className="text-sm text-stone">
            Prefer product context first?{" "}
            <Link href="/docs/" className="underline hover:text-pine">
              Read the docs
            </Link>{" "}
            or{" "}
            <Link href="/demo/" className="underline hover:text-pine">
              watch the product demo
            </Link>
            .
          </p>
        </section>
      </main>
    </div>
  );
}
