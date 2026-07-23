import Link from "next/link";
import { DeckViewer } from "@/components/DeckViewer";
import { PolicyWellCLIShowcase } from "@/components/PolicyWellCLIShowcase";
import { SiteNav } from "@/components/ui";

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col">
      <SiteNav />
      <main className="relative flex-1">
        <section className="relative overflow-hidden flex flex-col">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "linear-gradient(120deg, rgba(15,47,40,0.92) 0%, rgba(61,107,90,0.75) 42%, rgba(143,175,160,0.35) 100%), url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230f2f28' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            }}
          />
          <div className="pw-shell flex-1 flex flex-col justify-center pt-10 pb-6 md:pt-14 md:pb-8 text-foam">
            <h1 className="animate-rise font-display text-[2.75rem] leading-[0.95] sm:text-5xl md:text-7xl lg:text-8xl max-w-4xl">
              PolicyWell AI
            </h1>
            <p className="animate-rise-delay mt-5 md:mt-6 max-w-2xl font-display text-2xl sm:text-3xl md:text-4xl leading-[1.15] tracking-tight text-foam">
              The AI Operating System for the Insurance Industry
            </p>
            <p className="animate-rise-delay-2 mt-4 md:mt-5 max-w-xl text-base sm:text-lg md:text-xl text-foam/85">
              Analyze policies.
              <br className="sm:hidden" /> Recommend actions.
              <br className="sm:hidden" /> Keep humans in control.
            </p>
          </div>

          <div className="pw-shell pb-4 md:pb-6 animate-rise-delay-2">
            <PolicyWellCLIShowcase compact />
          </div>

          <div className="pw-shell pb-12 md:pb-16 flex flex-col sm:flex-row flex-wrap gap-3 animate-rise-delay-2">
            <Link
              href="/agent"
              className="pw-btn !bg-foam !text-pine hover:!bg-white w-full sm:w-auto justify-center"
            >
              Talk to the agent
            </Link>
            <Link
              href="/demo"
              className="pw-btn pw-btn-secondary !border-foam/35 !text-foam hover:!bg-foam/10 w-full sm:w-auto justify-center"
            >
              Product demo
            </Link>
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
