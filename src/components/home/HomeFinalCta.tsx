import Link from "next/link";
import { RequestAccessTeaser } from "@/components/access/RequestAccessGate";

export function HomeFinalCta() {
  return (
    <section className="pw-wc-final" aria-labelledby="pw-wc-final-heading">
      <div className="pw-shell pw-shell-wide pw-wc-final-inner">
        <h2 id="pw-wc-final-heading" className="pw-wc-final-title">
          Focus On Your Book. We&apos;ll Handle The Intelligence.
        </h2>
        <Link href="/book-a-call/" className="pw-wc-btn-light">
          Talk to our team
        </Link>
      </div>
      <div id="deck" className="pw-shell pw-shell-wide pw-wc-final-deck">
        <RequestAccessTeaser
          surface="deck"
          title="View our deck"
          description="The full PolicyWell deck is available on request. We’ll send an access code after review."
          href="/deck/"
        />
      </div>
    </section>
  );
}
