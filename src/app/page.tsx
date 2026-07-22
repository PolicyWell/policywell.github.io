import Link from "next/link";
import { SiteNav } from "@/components/ui";

const DECK_SRC = "/PolicyWell-Pitch-Deck.pdf";

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col">
      <SiteNav />
      <main className="relative flex-1">
        {/* Full-bleed natural hero plane */}
        <section className="relative overflow-hidden min-h-[calc(100vh-5.5rem)] flex flex-col">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "linear-gradient(120deg, rgba(15,47,40,0.92) 0%, rgba(61,107,90,0.75) 42%, rgba(143,175,160,0.35) 100%), url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230f2f28' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            }}
          />
          <div className="pw-shell flex-1 flex flex-col justify-center py-16 text-foam">
            <p className="animate-rise text-sm uppercase tracking-[0.28em] text-sage/90 mb-6">
              Insurance intelligence
            </p>
            <h1 className="animate-rise-delay font-display text-5xl md:text-7xl lg:text-8xl leading-[0.95] max-w-4xl">
              PolicyWell
            </h1>
            <p className="animate-rise-delay-2 mt-6 max-w-xl text-lg md:text-xl text-foam/85">
              Building the Intelligence Layer for Insurance — context first,
              recommendations second, always with human approval.
            </p>
            <div className="animate-rise-delay-2 mt-10 flex flex-wrap gap-3">
              <Link
                href="/agent"
                className="pw-btn !bg-foam !text-pine hover:!bg-white"
              >
                Talk to the agent
              </Link>
              <Link
                href="/demo"
                className="pw-btn pw-btn-secondary !border-foam/35 !text-foam hover:!bg-foam/10"
              >
                Run investor demo
              </Link>
            </div>
          </div>
        </section>

        {/* Deck section — one job: view the pitch deck */}
        <section
          id="deck"
          className="border-t border-pine/10 bg-foam/40 backdrop-blur-sm"
        >
          <div className="pw-shell py-16 md:py-20 space-y-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-xl">
                <h2 className="font-display text-3xl md:text-4xl text-pine">
                  View our deck
                </h2>
                <p className="text-stone mt-3">
                  The PolicyWell pitch — product thesis, market, and path for
                  producers, IMOs, carriers, and clients.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href="/deck" className="pw-btn !py-2.5 text-sm">
                  Open full deck
                </Link>
                <a
                  href={DECK_SRC}
                  download="PolicyWell-Pitch-Deck.pdf"
                  className="pw-btn pw-btn-secondary !py-2.5 text-sm"
                >
                  Download PDF
                </a>
              </div>
            </div>

            <div className="overflow-hidden rounded-[var(--radius)] border border-pine/10 bg-white/80 shadow-[var(--shadow-soft)]">
              <iframe
                title="PolicyWell pitch deck"
                src={`${DECK_SRC}#view=FitH`}
                className="w-full h-[min(70vh,780px)] bg-mist"
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
