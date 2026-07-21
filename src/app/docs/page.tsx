import Link from "next/link";
import { SiteNav } from "@/components/ui";

const DOCS = [
  {
    href: "/docs/cli",
    title: "CLI design",
    status: "Sprint 8 candidate",
    summary:
      "Compliance-first pw CLI for clients, producers, IMOs, and carriers — role ACL, approval gates, carrier pack isolation, audit log.",
  },
  {
    href: "/docs/engineering",
    title: "Engineering manual",
    status: "v0.1",
    summary:
      "Sprint status, architecture, demo accounts, and development rules for the PolicyWell intelligence layer.",
  },
];

export default function DocsIndexPage() {
  return (
    <div className="flex-1 flex flex-col">
      <SiteNav />
      <main className="pw-shell py-12 md:py-16 space-y-10">
        <header className="animate-rise max-w-2xl">
          <p className="text-xs uppercase tracking-[0.22em] text-moss mb-3">
            Documentation
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-pine">
            PolicyWell Docs
          </h1>
          <p className="text-stone mt-4 text-lg">
            Product and compliance design for the intelligence layer — web agent
            today, CLI next.
          </p>
        </header>

        <ul className="grid md:grid-cols-2 gap-4 animate-rise-delay">
          {DOCS.map((doc) => (
            <li key={doc.href}>
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
      </main>
    </div>
  );
}
