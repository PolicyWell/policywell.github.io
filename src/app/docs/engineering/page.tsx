import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/ui";

export const metadata: Metadata = {
  title: "Architecture",
  description:
    "How PolicyWell connects document ingestion, household context, policy analysis, and human-approved recommendations.",
};

export default function ArchitecturePage() {
  return (
    <div className="flex-1 flex flex-col">
      <SiteNav />
      <main className="pw-shell py-12 md:py-16 max-w-3xl space-y-8">
        <header className="space-y-3">
          <p className="text-xs text-moss">
            <Link href="/docs" className="hover:text-pine">
              Docs
            </Link>
            <span aria-hidden> / </span>
            <span className="text-pine">Architecture</span>
          </p>
          <h1 className="font-display text-4xl text-pine">
            Platform architecture
          </h1>
          <p className="text-stone text-lg leading-relaxed">
            PolicyWell is an insurance intelligence platform. Documents and
            carrier data feed a context engine; the policy analysis engine
            produces scores and grounded recommendations; licensed professionals
            approve actions before client delivery.
          </p>
        </header>

        <ol className="space-y-3">
          {[
            "Document ingestion engine",
            "Household and policy context engine",
            "Policy analysis and scoring",
            "Recommendation generation",
            "Human approval controls",
            "Reports, workflows, APIs, and CLI",
          ].map((step, i) => (
            <li
              key={step}
              className="flex gap-3 items-start rounded-xl border border-pine/10 bg-white/60 px-4 py-3"
            >
              <span className="text-xs text-moss font-semibold mt-0.5">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-ink">{step}</span>
            </li>
          ))}
        </ol>

        <p className="text-sm text-stone leading-relaxed">
          For CLI and batch automation, see the{" "}
          <Link href="/docs/cli" className="text-pine underline underline-offset-2">
            CLI reference
          </Link>
          . For packaging, see{" "}
          <Link href="/pricing" className="text-pine underline underline-offset-2">
            Pricing
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
