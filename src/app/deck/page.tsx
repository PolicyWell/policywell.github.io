import Link from "next/link";
import { DeckViewer } from "@/components/DeckViewer";
import { SiteNav } from "@/components/ui";

export const metadata = {
  title: "Pitch deck",
  description: "PolicyWell investor pitch deck.",
};

export default function DeckPage() {
  return (
    <div className="flex-1 flex flex-col">
      <SiteNav />
      <main className="pw-shell py-8 md:py-14 space-y-6">
        <header className="animate-rise space-y-3">
          <p className="text-xs uppercase tracking-[0.22em] text-moss">
            Investors
          </p>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-pine">
            Pitch deck
          </h1>
          <p className="text-stone text-sm sm:text-base max-w-xl">
            Full 12-slide deck. On mobile, each slide scales to your screen
            width — nothing is cropped. Use Prev/Next or scroll all slides.
          </p>
        </header>

        <div className="animate-rise-delay">
          <DeckViewer />
        </div>

        <p className="text-sm text-stone animate-rise-delay-2">
          Prefer the product?{" "}
          <Link href="/agent" className="underline hover:text-pine">
            Talk to the agent
          </Link>{" "}
          or{" "}
          <Link href="/demo" className="underline hover:text-pine">
            see the product demo
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
