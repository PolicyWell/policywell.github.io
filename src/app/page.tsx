import Link from "next/link";
import { DeckViewer } from "@/components/DeckViewer";
import { LiveAnalysisCounter } from "@/components/LiveAnalysisCounter";
import { PolicyWellCLIShowcase } from "@/components/PolicyWellCLIShowcase";
import { SiteNav } from "@/components/ui";

const AUDIENCES = [
  { href: "/agent", label: "Individuals and Families" },
  { href: "/commercial", label: "Businesses" },
  { href: "/login", label: "Producers and Advisors" },
  { href: "/pricing", label: "MGAs and IMOs" },
  { href: "/docs/api", label: "Insurance Carriers" },
] as const;

const ENGINE = [
  "Policy Intelligence",
  "Illustration Intelligence",
  "Underwriting Intelligence",
  "Commercial Risk Intelligence",
  "Carrier Intelligence",
  "Distribution Intelligence",
  "Claims Intelligence",
  "Recommendation Intelligence",
  "Document Intelligence",
] as const;

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col min-w-0 w-full max-w-full overflow-x-clip">
      <SiteNav />
      <main className="relative flex-1 min-w-0 w-full overflow-x-clip">
        <section className="relative overflow-hidden flex flex-col">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "linear-gradient(120deg, rgba(15,47,40,0.92) 0%, rgba(61,107,90,0.75) 42%, rgba(143,175,160,0.35) 100%), url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230f2f28' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            }}
          />
          <div className="pw-shell flex-1 flex flex-col justify-center items-center text-center pt-10 pb-6 md:pt-14 md:pb-8 text-foam">
            <LiveAnalysisCounter className="animate-rise mb-5 md:mb-6" />
            <p className="animate-rise text-[11px] uppercase tracking-[0.22em] text-foam/75 mb-3">
              PolicyWell
            </p>
            <h1 className="animate-rise font-display text-[2rem] leading-[1.05] sm:text-3xl md:text-5xl lg:text-6xl max-w-4xl tracking-tight">
              The Agentic Operating System for the Insurance &amp; Financial
              Services Industry
            </h1>
            <p className="pw-hero-subline animate-rise-delay">
              Policy, risk, underwriting and distribution intelligence for
              personal and commercial insurance.
            </p>
          </div>

          <div className="pw-shell pb-4 md:pb-6 animate-rise-delay-2">
            <PolicyWellCLIShowcase compact />
          </div>

          <div className="pw-shell pb-8 md:pb-10 flex flex-col sm:flex-row flex-wrap gap-3 animate-rise-delay-2">
            <Link
              href="/agent"
              className="pw-btn !bg-foam !text-pine hover:!bg-white w-full sm:w-auto justify-center"
            >
              Talk to the agent
            </Link>
            <Link
              href="/quote"
              className="pw-btn pw-btn-secondary !border-foam/35 !text-foam hover:!bg-foam/10 w-full sm:w-auto justify-center"
            >
              Get a Quote
            </Link>
            <Link
              href="/demo"
              className="pw-btn pw-btn-secondary !border-foam/35 !text-foam hover:!bg-foam/10 w-full sm:w-auto justify-center"
            >
              Product demo
            </Link>
          </div>
        </section>

        <section className="border-t border-pine/10 bg-foam/50">
          <div className="pw-shell py-10 md:py-14 space-y-6">
            <div className="max-w-2xl">
              <h2 className="font-display text-2xl md:text-3xl text-pine">
                Built for every side of the market
              </h2>
              <p className="text-stone mt-2 text-sm md:text-base">
                PolicyWell sits above existing workflows - it is not a CRM,
                brokerage portal, carrier admin system, or autonomous underwriter.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {AUDIENCES.map((a) => (
                <Link
                  key={a.label}
                  href={a.href}
                  className="px-3.5 py-2 rounded-full border border-pine/15 bg-white/70 text-sm text-pine hover:border-pine/35"
                >
                  {a.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-pine/10">
          <div className="pw-shell py-10 md:py-14 space-y-5">
            <div className="max-w-2xl">
              <h2 className="font-display text-2xl md:text-3xl text-pine">
                Insurance Intelligence Engine
              </h2>
              <p className="text-stone mt-2 text-sm md:text-base">
                Modular intelligence across personal and commercial lines - with
                evidence, confidence, and human approval gates.
              </p>
            </div>
            <ul className="flex flex-wrap gap-2">
              {ENGINE.map((item) => (
                <li
                  key={item}
                  className="px-3 py-1.5 rounded-full bg-mist/80 text-sm text-pine border border-pine/10"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          id="deck"
          className="border-t border-pine/10 bg-foam/40 backdrop-blur-sm"
        >
          <div className="pw-shell py-12 md:py-20 space-y-6 md:space-y-8">
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end justify-between gap-4">
              <div className="max-w-xl">
                <h2 className="font-display text-3xl md:text-4xl text-pine">
                  View our deck
                </h2>
              </div>
              <Link
                href="/deck"
                className="pw-btn !py-2.5 text-sm w-full sm:w-auto justify-center"
              >
                Open full deck
              </Link>
            </div>

            <DeckViewer compact />
          </div>
        </section>
      </main>
    </div>
  );
}
