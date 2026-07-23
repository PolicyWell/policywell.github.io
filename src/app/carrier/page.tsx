"use client";

import Link from "next/link";
import { useState } from "react";
import { AppNav } from "@/components/ui";
import {
  CARRIER_PACKS,
  answerCarrierQuestion,
  type CarrierAnswer,
} from "@/lib/carrier-kb";
import { useSession } from "@/lib/use-workspace";

export default function CarrierConsolePage() {
  const session = useSession();
  const [carrier, setCarrier] = useState(CARRIER_PACKS[0].carrier);
  const [question, setQuestion] = useState("Explain the Life Protection Advantage IUL");
  const [answer, setAnswer] = useState<CarrierAnswer | null>(null);

  if (!session) {
    return (
      <div className="pw-shell py-20">
        <p className="text-stone">
          Please <Link href="/login" className="underline">sign in</Link>.
        </p>
      </div>
    );
  }

  const pack = CARRIER_PACKS.find((p) => p.carrier === carrier);

  return (
    <div className="flex-1 flex flex-col">
      <AppNav role={session.role} />
      <main className="pw-shell py-10 space-y-8">
        <div className="animate-rise">
          <h1 className="font-display text-4xl text-pine">Carrier console</h1>
          <p className="text-stone mt-2 max-w-2xl">
            Answers are assembled only from approved carrier content packs.
            Compliance language is preserved verbatim, and unsupported claims are
            refused rather than generated.
          </p>
        </div>

        <section className="pw-panel p-6 animate-rise-delay space-y-4">
          <div className="grid sm:grid-cols-[220px_1fr_auto] gap-3 items-end">
            <label className="text-sm text-stone">
              Carrier pack
              <select
                className="pw-input mt-1"
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
              >
                {CARRIER_PACKS.map((p) => (
                  <option key={p.carrier} value={p.carrier}>
                    {p.carrier}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm text-stone">
              Question
              <input
                className="pw-input mt-1"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </label>
            <button
              type="button"
              className="pw-btn"
              onClick={() => setAnswer(answerCarrierQuestion(carrier, question))}
            >
              Ask
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              "Explain the Life Protection Advantage IUL",
              "Show illustration values for the IUL",
              "Explain the Performance Elite FIA",
              "Is this product guaranteed to beat the market?",
            ].map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => {
                  setQuestion(q);
                  setAnswer(answerCarrierQuestion(carrier, q));
                }}
                className="text-xs px-3 py-1.5 rounded-full border border-pine/15 text-stone hover:text-pine"
              >
                {q}
              </button>
            ))}
          </div>

          {answer && (
            <div
              className={`rounded-2xl border p-4 space-y-3 ${
                answer.supported
                  ? "bg-white/70 border-pine/10"
                  : "bg-danger/5 border-danger/20"
              }`}
            >
              {answer.product && (
                <div className="text-xs uppercase tracking-wider text-moss">
                  {answer.product}
                </div>
              )}
              <p className="text-ink leading-relaxed">{answer.answer}</p>
              {answer.complianceLanguage && (
                <p className="text-xs text-stone border-t border-pine/10 pt-3 italic">
                  {answer.complianceLanguage}
                </p>
              )}
              {answer.sources.length > 0 && (
                <div className="text-[11px] text-stone">
                  Sources: {answer.sources.join(" · ")}
                </div>
              )}
              {!answer.supported && (
                <p className="text-xs text-danger">
                  Declined - outside approved content. No unsupported claims generated.
                </p>
              )}
            </div>
          )}
        </section>

        {pack && (
          <section className="pw-panel p-6 animate-rise-delay-2">
            <h2 className="font-display text-2xl text-pine mb-3">
              Approved pack - {pack.carrier}
            </h2>
            {pack.products.map((p) => (
              <div key={p.productName} className="mb-4">
                <div className="text-sm font-medium text-ink">
                  {p.productName} · {p.productType}
                </div>
                <ul className="mt-1 space-y-1 text-sm text-stone list-disc pl-5">
                  {p.approvedClaims.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
            ))}
            <p className="text-xs text-stone italic">{pack.complianceLanguage}</p>
          </section>
        )}
      </main>
    </div>
  );
}
