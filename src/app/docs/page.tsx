import Link from "next/link";
import { SiteNav } from "@/components/ui";

const DOCS = [
  {
    href: "/docs#overview",
    title: "Overview",
    status: "Available",
    summary:
      "How PolicyWell connects policies, household context, advisor workflows, and carrier systems.",
  },
  {
    href: "/docs/cli",
    title: "CLI reference",
    status: "Preview",
    summary:
      "Batch ingest, analysis, and enterprise automation for carriers, IMOs, and technology teams.",
  },
  {
    href: "/docs#integrations",
    title: "Integrations",
    status: "Available",
    summary:
      "APIs, CRM connections, policy administration systems, and legacy-friendly workflows.",
  },
  {
    href: "/pricing",
    title: "Pricing & packaging",
    status: "Available",
    summary:
      "Free for policyholders. Advisor, IMO/BGA, and carrier enterprise packaging.",
  },
];

const TOPICS = [
  "Authentication",
  "Policy ingestion",
  "Document processing",
  "Household context",
  "Policy analysis",
  "Recommendations",
  "Human approval",
  "Reports",
  "API reference",
  "CLI reference",
  "Batch workflows",
  "Webhooks",
  "Errors",
  "Security overview",
  "Data handling",
];

export default function DocsIndexPage() {
  return (
    <div className="flex-1 flex flex-col">
      <SiteNav />
      <main className="pw-shell py-12 md:py-16 space-y-12">
        <header id="overview" className="animate-rise max-w-2xl scroll-mt-24">
          <p className="text-xs uppercase tracking-[0.22em] text-moss mb-3">
            Documentation
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-pine">
            PolicyWell Docs
          </h1>
          <p className="text-stone mt-4 text-lg leading-relaxed">
            Product documentation for the insurance intelligence platform —
            web application, APIs, CLI tools, and human-approval workflows.
          </p>
        </header>

        <ul className="grid md:grid-cols-2 gap-4 animate-rise-delay">
          {DOCS.map((doc) => (
            <li key={doc.title}>
              <Link
                href={doc.href}
                className="block pw-panel p-6 h-full hover:border-pine/25 transition-colors border border-transparent"
              >
                <div className="flex items-baseline justify-between gap-3 mb-2">
                  <h2 className="font-display text-2xl text-pine">{doc.title}</h2>
                  <span className="text-[10px] uppercase tracking-wider text-moss shrink-0">
                    {doc.status}
                  </span>
                </div>
                <p className="text-sm text-stone leading-relaxed">{doc.summary}</p>
              </Link>
            </li>
          ))}
        </ul>

        <section id="integrations" className="scroll-mt-24 space-y-4">
          <h2 className="font-display text-2xl md:text-3xl text-pine">
            Documentation map
          </h2>
          <p className="text-stone max-w-2xl leading-relaxed">
            Topics marked Preview are design-complete and being implemented.
            Available topics are supported in the current product experience.
          </p>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {TOPICS.map((topic) => (
              <li
                key={topic}
                className="rounded-xl border border-pine/10 bg-white/60 px-4 py-3 text-sm text-ink"
              >
                {topic}
                <span className="block text-[10px] uppercase tracking-wider text-moss mt-1">
                  {["CLI reference", "Webhooks", "Batch workflows"].includes(topic)
                    ? "Preview"
                    : "Available"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
