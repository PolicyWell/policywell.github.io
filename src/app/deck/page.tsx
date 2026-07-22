import Link from "next/link";
import { SiteNav } from "@/components/ui";

const DECK_SRC = "/PolicyWell-Pitch-Deck.pdf";

export const metadata = {
  title: "Pitch deck — PolicyWell",
  description: "PolicyWell investor pitch deck.",
};

export default function DeckPage() {
  return (
    <div className="flex-1 flex flex-col">
      <SiteNav />
      <main className="pw-shell py-10 md:py-14 space-y-6">
        <header className="animate-rise flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-moss mb-3">
              Investors
            </p>
            <h1 className="font-display text-4xl md:text-5xl text-pine">
              Pitch deck
            </h1>
            <p className="text-stone mt-3 max-w-xl">
              Building the Intelligence Layer for Insurance — view the deck
              below or download the PDF.
            </p>
          </div>
          <a
            href={DECK_SRC}
            download="PolicyWell-Pitch-Deck.pdf"
            className="pw-btn pw-btn-secondary !py-2.5 text-sm"
          >
            Download PDF
          </a>
        </header>

        <div className="animate-rise-delay overflow-hidden rounded-[var(--radius)] border border-pine/10 bg-white/70 shadow-[var(--shadow-soft)]">
          <iframe
            title="PolicyWell pitch deck"
            src={`${DECK_SRC}#view=FitH`}
            className="w-full h-[min(80vh,900px)] bg-mist"
          />
        </div>

        <p className="text-sm text-stone animate-rise-delay-2">
          Prefer the product?{" "}
          <Link href="/agent" className="underline hover:text-pine">
            Talk to the agent
          </Link>{" "}
          or{" "}
          <Link href="/demo" className="underline hover:text-pine">
            run the investor demo
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
