"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AppNav, ConfidenceBadge } from "@/components/ui";
import {
  answerPolicyQuestion,
  buildAnalysisTimeline,
  buildHybridContext,
  generateAgentReport,
} from "@/lib/context-engine";
import { createFeedback, summarizeFeedback } from "@/lib/feedback";
import { computePolicyWellScores } from "@/lib/scoring";
import {
  persistFeedback,
  useDocuments,
  useFeedbackEntries,
  useProfile,
  useSession,
} from "@/lib/use-workspace";
import type { FeedbackEntry } from "@/lib/types";

type Grounded = ReturnType<typeof answerPolicyQuestion>;

export default function WorkspacePage() {
  const session = useSession();
  const profile = useProfile();
  const docs = useDocuments();
  const feedback = useFeedbackEntries();
  const [question, setQuestion] = useState("Will my policy lapse?");
  const [answer, setAnswer] = useState<Grounded | null>(null);

  const scores = useMemo(
    () => (profile ? computePolicyWellScores(profile, docs) : null),
    [profile, docs],
  );
  const context = useMemo(
    () => (profile ? buildHybridContext(profile, docs) : null),
    [profile, docs],
  );
  const timeline = useMemo(
    () => (profile ? buildAnalysisTimeline(profile, docs) : []),
    [profile, docs],
  );
  const report = useMemo(
    () => (profile ? generateAgentReport(profile, docs) : null),
    [profile, docs],
  );
  const fbSummary = summarizeFeedback(feedback);

  function ask(q: string) {
    if (!profile) return;
    const result = answerPolicyQuestion(q, profile, docs);
    setAnswer(result);
    setQuestion(q);
  }

  function onFeedback(kind: FeedbackEntry["kind"]) {
    if (!session || !answer) return;
    let correction: string | undefined;
    if (kind === "needs_correction") {
      correction = window.prompt("What should be corrected?") || undefined;
    }
    const entry = createFeedback({
      userId: session.id,
      recommendationId: `rec_${Date.now()}`,
      kind,
      correction,
    });
    persistFeedback([entry, ...feedback]);
  }

  if (!session) {
    return (
      <div className="pw-shell py-20">
        <p className="text-stone">
          Please <Link href="/login" className="underline">sign in</Link>.
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex-1 flex flex-col">
        <AppNav role={session.role} />
        <main className="pw-shell py-16">
          <h1 className="font-display text-4xl text-pine mb-3">Agent workspace</h1>
          <p className="text-stone mb-6">Load context via onboarding or the investor demo first.</p>
          <div className="flex gap-3">
            <Link href="/onboarding" className="pw-btn">Onboarding</Link>
            <Link href="/demo" className="pw-btn pw-btn-secondary">Investor demo</Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <AppNav role={session.role} />
      <main className="pw-shell py-10 space-y-8">
        <div className="animate-rise">
          <h1 className="font-display text-4xl md:text-5xl text-pine">Agent workspace</h1>
          <p className="text-stone mt-2 max-w-2xl">
            Hybrid contextual intelligence — every answer is grounded in who is asking, what they own, and what was uploaded.
          </p>
        </div>

        {scores && (
          <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 animate-rise-delay">
            {scores.explanations.map((e) => (
              <div key={e.scoreKey} className="pw-panel p-4">
                <div className="text-xs uppercase tracking-wider text-stone mb-1">{e.label}</div>
                <div className="font-display text-3xl text-pine">{e.value}</div>
                <div className="score-bar mt-3">
                  <span style={{ width: `${e.value}%` }} />
                </div>
              </div>
            ))}
          </section>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          <section className="pw-panel p-5 animate-rise space-y-4">
            <h2 className="font-display text-2xl text-pine">Ask with context</h2>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                ask(question);
              }}
            >
              <input
                className="pw-input"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <button type="submit" className="pw-btn shrink-0">Ask</button>
            </form>
            <div className="flex flex-wrap gap-2">
              {[
                "Will my policy lapse?",
                "How much should I fund annually?",
                "How much can I borrow?",
                "What happens if I stop paying?",
                "Can I increase cash value?",
              ].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => ask(q)}
                  className="text-xs px-3 py-1.5 rounded-full border border-pine/15 text-stone hover:text-pine"
                >
                  {q}
                </button>
              ))}
            </div>

            {answer && (
              <div className="rounded-2xl bg-white/70 border border-pine/10 p-4 space-y-3">
                <p className="text-ink leading-relaxed">{answer.answer}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <ConfidenceBadge value={answer.references.confidence} />
                  {answer.references.document && (
                    <span className="text-xs text-stone">Doc: {answer.references.document}</span>
                  )}
                </div>
                <div className="text-xs text-stone space-y-1">
                  <div>Extracted: {answer.references.extractedValues.join(" · ") || "—"}</div>
                  <div>Assumptions: {answer.references.assumptions.join(" · ")}</div>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <button type="button" className="pw-btn pw-btn-secondary !py-2 text-sm" onClick={() => onFeedback("accurate")}>
                    Accurate
                  </button>
                  <button type="button" className="pw-btn pw-btn-secondary !py-2 text-sm" onClick={() => onFeedback("needs_correction")}>
                    Needs correction
                  </button>
                  <button type="button" className="pw-btn pw-btn-secondary !py-2 text-sm" onClick={() => onFeedback("not_helpful")}>
                    Not helpful
                  </button>
                </div>
                <p className="text-[11px] text-stone">
                  Feedback stored for review — it does not automatically change scoring logic.
                  ({fbSummary.accurate} accurate · {fbSummary.needsCorrection} corrections · {fbSummary.notHelpful} not helpful)
                </p>
              </div>
            )}
          </section>

          <section className="pw-panel p-5 animate-rise-delay space-y-4">
            <h2 className="font-display text-2xl text-pine">Analysis timeline</h2>
            <ol className="space-y-4">
              {timeline.map((evt) => (
                <li key={evt.id} className="relative pl-4 border-l border-moss/40">
                  <div className="text-sm text-ink font-medium">{evt.title}</div>
                  <div className="text-xs text-stone mt-1">{evt.detail}</div>
                  <div className="text-[11px] text-stone mt-1">{new Date(evt.at).toLocaleString()}</div>
                </li>
              ))}
            </ol>
            {context && (
              <div className="text-xs text-stone border-t border-pine/10 pt-4 space-y-1">
                <div>Who: {context.who} ({context.role})</div>
                <div>Household: {context.household}</div>
                <div>Carrier: {context.carrier} · State: {context.state}</div>
                <div>Goals: {context.goals.join(", ") || "—"}</div>
                <div>Documents: {context.documents.join(", ") || "—"}</div>
              </div>
            )}
          </section>
        </div>

        {report && (
          <section className="pw-panel p-6 animate-rise-delay-2">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="font-display text-2xl text-pine">Client / advisor report preview</h2>
              <Link href="/report" className="pw-btn pw-btn-secondary !py-2 text-sm">
                Open full report
              </Link>
            </div>
            <p className="text-sm text-ink mb-2">{report.clientSummary}</p>
            <p className="text-sm text-stone">{report.advisorSummary}</p>
          </section>
        )}
      </main>
    </div>
  );
}
