"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type DragEvent,
} from "react";
import type { CompetitiveOption } from "@/lib/v1/competitive-options";
import {
  answerPearConversation,
  type PearChatReply,
} from "@/lib/v1/pear-agent";
import {
  buildIngestCompleteMessage,
  buildPearIngestSteps,
  type IngestField,
  type PearIngestStep,
} from "@/lib/v1/pear-ingest";
import {
  getPearMalikAskContext,
  PEAR_CASE_NAME,
} from "@/lib/v1/pear-malik-context";
import {
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  speakPearScript,
  startPearListen,
  stopPearSpeech,
  type PearListenHandle,
} from "@/lib/pear-speech";

function subscribeNoop() {
  return () => {};
}

function useBrowserSpeechSupport() {
  const tts = useSyncExternalStore(
    subscribeNoop,
    isSpeechSynthesisSupported,
    () => false,
  );
  const mic = useSyncExternalStore(
    subscribeNoop,
    isSpeechRecognitionSupported,
    () => false,
  );
  return { tts, mic };
}

type Phase = "upload" | "ingesting" | "ready";

type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  spokenScript?: string;
  intent?: string;
  options?: CompetitiveOption[];
  disclaimer?: string | null;
  math?: PearChatReply["math"];
};

type SimulationState = {
  intent: string;
  title: string;
  spokenScript: string;
  rows: { label: string; value: string }[];
  options?: CompetitiveOption[];
  disclaimer?: string | null;
};

const STARTERS = [
  "Tell me about this policy",
  "Is this funded above no-lapse?",
  "When does coverage lapse?",
  "Cash value at age 52",
  "What if premium 180?",
  "Any better options?",
  "Best option vs Foresters",
];

const SAMPLE_FILENAME = "Malik Illustrations.pdf";

function money(n: number | string | null | undefined): string {
  if (n == null || n === "" || Number.isNaN(Number(n))) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(n));
}

function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function intentTitle(intent: string): string {
  const map: Record<string, string> = {
    welcome: "Ready",
    summary: "Policy summary",
    identity: "Insured",
    funding: "Funding simulation",
    lapse: "Lapse simulation",
    cashvalue: "Cash value simulation",
    scenario: "Premium scenario",
    death_benefit: "Death benefit",
    better_options: "Competitive options",
    help: "How to ask",
    ingest: "Ingestion",
  };
  return map[intent] ?? intent.replace(/_/g, " ");
}

function buildSimulation(reply: PearChatReply): SimulationState {
  const rows: { label: string; value: string }[] = [];
  const m = reply.math;

  switch (reply.intent) {
    case "summary":
    case "identity":
      rows.push(
        { label: "Insured", value: String(m.insuredName ?? "—") },
        { label: "Death benefit", value: money(m.deathBenefit) },
        { label: "Monthly premium", value: money(m.monthlyPremium) },
        { label: "Annual premium", value: money(m.annualPremium) },
      );
      break;
    case "funding":
      rows.push(
        { label: "Monthly", value: money(m.monthlyPremium) },
        { label: "Annual funding", value: money(m.annualFunding) },
        { label: "No-lapse annual", value: money(m.noLapseAnnualPremium) },
        { label: "Above / below NLG", value: money(m.amountAboveNoLapse) },
        { label: "Guideline room", value: money(m.remainingGuidelineRoom) },
      );
      break;
    case "lapse":
      rows.push(
        {
          label: "Guaranteed cease",
          value: `Age ${m.guaranteedCessationAge ?? "—"}`,
        },
        {
          label: "Midpoint cease",
          value: `Age ${m.midpointCessationAge ?? "—"}`,
        },
      );
      break;
    case "cashvalue":
      rows.push(
        { label: "Age asked", value: String(m.requestedAge ?? "—") },
        { label: "Ledger age", value: String(m.matchedAge ?? "—") },
        { label: "Premiums paid", value: money(m.cumulativePremiumOutlay) },
        {
          label: "Illustrated AV",
          value: money(m.illustratedAccumulationValue),
        },
        {
          label: "Illustrated SV",
          value: money(m.illustratedSurrenderValue),
        },
        { label: "Net of charges", value: money(m.illustratedNetOfCharges) },
        { label: "Death benefit", value: money(m.deathBenefit) },
      );
      break;
    case "scenario":
      rows.push(
        { label: "New monthly", value: money(m.newMonthlyPremium) },
        { label: "New annual", value: money(m.newAnnualPremium) },
        {
          label: "Additional annual",
          value: money(m.additionalAnnualFunding),
        },
        {
          label: "Vs guideline max",
          value: money(m.differenceFromGuidelineMaximum),
        },
      );
      break;
    case "better_options":
      rows.push(
        { label: "Alternatives", value: String(m.optionCount ?? 5) },
        { label: "Baseline monthly", value: money(m.baselineMonthly) },
        { label: "Baseline DB", value: money(m.baselineDeathBenefit) },
        { label: "Baseline CV@52", value: money(m.baselineCv52) },
      );
      break;
    default:
      break;
  }

  return {
    intent: reply.intent,
    title: intentTitle(reply.intent),
    spokenScript: reply.spokenScript,
    rows,
    options: reply.options,
    disclaimer: reply.disclaimer,
  };
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function PearWell({ active }: { active: boolean }) {
  return (
    <div
      className={`pw-well-art pear-upload-art${active ? " is-active" : ""}`}
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- animated GIF upload asset */}
      <img
        src="/pear-upload-well.gif"
        alt=""
        width={512}
        height={512}
        className="pear-upload-asset"
        decoding="async"
      />
    </div>
  );
}

export function PearLiveAgent() {
  const ctx = getPearMalikAskContext();
  const [phase, setPhase] = useState<Phase>("upload");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [speechNote, setSpeechNote] = useState<string | null>(null);
  const [simulation, setSimulation] = useState<SimulationState | null>(null);
  const [dragging, setDragging] = useState(false);
  const [filename, setFilename] = useState<string | null>(null);
  const [steps, setSteps] = useState<PearIngestStep[]>([]);
  const [stepIndex, setStepIndex] = useState(-1);
  const [extractedFields, setExtractedFields] = useState<IngestField[]>([]);
  const [statusLine, setStatusLine] = useState(
    "Drop an illustration to begin live synthesis",
  );

  const { tts: ttsReady, mic: micReady } = useBrowserSpeechSupport();

  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const busyRef = useRef(false);
  const listenRef = useRef<PearListenHandle | null>(null);
  const ingestCancel = useRef(false);
  const autoSpeakRef = useRef(autoSpeak);
  const ttsReadyRef = useRef(ttsReady);

  useEffect(() => {
    autoSpeakRef.current = autoSpeak;
  }, [autoSpeak]);

  useEffect(() => {
    ttsReadyRef.current = ttsReady;
  }, [ttsReady]);

  useEffect(() => {
    return () => {
      ingestCancel.current = true;
      stopPearSpeech();
      listenRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    });
  }, [messages, busy, speaking, stepIndex, phase]);

  async function narrate(script: string) {
    if (!ttsReadyRef.current || !script.trim()) return;
    setSpeaking(true);
    setSpeechNote(null);
    const status = await speakPearScript(script);
    if (status === "unsupported") {
      setSpeechNote("Speech isn’t available in this browser.");
    }
    setSpeaking(false);
  }

  async function runIngest(fileLabel: string) {
    ingestCancel.current = false;
    stopPearSpeech();
    setPhase("ingesting");
    setFilename(fileLabel);
    setMessages([]);
    setSimulation(null);
    setExtractedFields([]);
    setStepIndex(-1);
    setStatusLine(`Ingesting ${fileLabel}…`);

    const plan = buildPearIngestSteps(fileLabel, ctx);
    setSteps(plan);

    for (let i = 0; i < plan.length; i++) {
      if (ingestCancel.current) return;
      const step = plan[i]!;
      setStepIndex(i);
      setStatusLine(step.detail);

      const revealed = plan
        .slice(0, i + 1)
        .flatMap((s) => s.fields ?? []);

      if (step.fields?.length || revealed.length > 0) {
        setExtractedFields(revealed);
        setSimulation({
          intent: "ingest",
          title: step.label,
          spokenScript: step.spoken,
          rows: revealed.map((f) => ({ label: f.label, value: f.value })),
          disclaimer: null,
        });
      } else {
        setSimulation({
          intent: "ingest",
          title: step.label,
          spokenScript: step.spoken,
          rows: [],
          disclaimer: null,
        });
      }

      setMessages((m) => [
        ...m,
        {
          id: `sys_${step.id}`,
          role: "system",
          content: `${step.label} — ${step.detail}`,
          intent: "ingest",
          spokenScript: step.spoken,
        },
      ]);

      if (autoSpeakRef.current && ttsReadyRef.current) {
        await narrate(step.spoken);
      } else {
        await sleep(900);
      }
      if (ingestCancel.current) return;
      await sleep(280);
    }

    if (ingestCancel.current) return;

    const finalFields = plan.flatMap((s) => s.fields ?? []);
    const done = buildIngestCompleteMessage(ctx, fileLabel);
    const assistantId = `a_${newId()}`;
    setMessages((m) => [
      ...m,
      {
        id: assistantId,
        role: "assistant",
        content: done.content,
        spokenScript: done.spokenScript,
        intent: "summary",
      },
    ]);
    setSimulation({
      intent: "summary",
      title: "Synthesized policy",
      spokenScript: done.spokenScript,
      rows: finalFields,
      disclaimer:
        "Original illustration synthesis for Pear X 27 — not an in-force illustration.",
    });
    setStatusLine("Synthesis ready — ask the agent");
    setPhase("ready");
  }

  function onFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    void runIngest(file.name || SAMPLE_FILENAME);
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    onFiles(e.dataTransfer.files);
  }

  function resetToUpload() {
    ingestCancel.current = true;
    stopPearSpeech();
    setPhase("upload");
    setMessages([]);
    setSimulation(null);
    setExtractedFields([]);
    setSteps([]);
    setStepIndex(-1);
    setFilename(null);
    setSpeaking(false);
    setStatusLine("Drop an illustration to begin live synthesis");
  }

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busyRef.current || phase !== "ready") return;

    stopPearSpeech();
    listenRef.current?.stop();
    setListening(false);

    busyRef.current = true;
    setBusy(true);
    setInput("");
    setMessages((m) => [
      ...m,
      { id: `u_${newId()}`, role: "user", content: trimmed },
    ]);

    const reply = answerPearConversation(trimmed, ctx);
    const assistantId = `a_${newId()}`;
    setSimulation(buildSimulation(reply));
    setMessages((m) => [
      ...m,
      {
        id: assistantId,
        role: "assistant",
        content: reply.text,
        spokenScript: reply.spokenScript,
        intent: reply.intent,
        options: reply.options,
        disclaimer: reply.disclaimer,
        math: reply.math,
      },
    ]);

    busyRef.current = false;
    setBusy(false);

    if (autoSpeak) {
      void narrate(reply.spokenScript);
    }
  }

  function toggleListen() {
    if (listening) {
      listenRef.current?.stop();
      setListening(false);
      return;
    }
    if (!micReady) {
      setSpeechNote("Voice input isn’t supported here — type or use starters.");
      return;
    }
    setSpeechNote(null);
    setListening(true);
    listenRef.current = startPearListen({
      onResult: (transcript) => {
        setListening(false);
        send(transcript);
      },
      onError: (message) => {
        setListening(false);
        setSpeechNote(message);
      },
      onEnd: () => setListening(false),
    });
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[linear-gradient(165deg,#f7f4ef_0%,#eef3f0_45%,#e8efe9_100%)]">
      <header className="border-b border-pine/10 bg-foam/70 backdrop-blur-sm">
        <div className="pw-shell py-4 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-moss">
              PolicyWell · {PEAR_CASE_NAME}
            </p>
            <h1 className="font-display text-2xl sm:text-3xl text-pine mt-1">
              Upload · read · synthesize
            </h1>
            <p className="text-sm text-stone mt-1 max-w-2xl">
              Drop a policy illustration into the well. The oral agent reads it
              aloud while the response view fills — then ask anything.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex items-center gap-2 text-xs text-stone px-3 py-2 rounded-full border border-pine/15 bg-white/70 cursor-pointer">
              <input
                type="checkbox"
                checked={autoSpeak}
                onChange={(e) => setAutoSpeak(e.target.checked)}
                className="accent-[var(--pine,#1f4d3a)]"
              />
              Auto-speak
            </label>
            {phase !== "upload" ? (
              <button
                type="button"
                className="pw-btn pw-btn-secondary !py-2 !px-3 text-xs"
                onClick={resetToUpload}
              >
                New upload
              </button>
            ) : null}
            <button
              type="button"
              className="pw-btn pw-btn-secondary !py-2 !px-3 text-xs"
              disabled={!simulation?.spokenScript || !ttsReady || speaking}
              onClick={() => {
                if (!simulation) return;
                void narrate(simulation.spokenScript);
              }}
            >
              {speaking ? "Speaking…" : "Replay"}
            </button>
            <button
              type="button"
              className="pw-btn pw-btn-secondary !py-2 !px-3 text-xs"
              disabled={!speaking}
              onClick={() => {
                stopPearSpeech();
                setSpeaking(false);
              }}
            >
              Stop
            </button>
            {speaking ? (
              <span className="text-[10px] uppercase tracking-wider text-moss animate-pulse-soft">
                Reading aloud
              </span>
            ) : null}
          </div>
        </div>
      </header>

      <main className="pw-shell flex-1 grid lg:grid-cols-[1.15fr_0.85fr] gap-4 md:gap-6 py-4 md:py-6">
        <section className="pw-panel flex flex-col min-h-[65vh] shadow-[var(--shadow-soft)]">
          {phase === "upload" ? (
            <div className="flex-1 flex flex-col p-5 sm:p-8 justify-center">
              <p className="pw-well-eyebrow">Drop into the well</p>
              <h2 className="font-display text-2xl text-pine mt-1 mb-2">
                Upload Insurance PDF
              </h2>
              <p className="text-sm text-stone mb-6 max-w-xl">
                Drop a policy PDF and the agent will read, extract, and
                synthesize it into a live case you can ask about.
              </p>
              <div
                className={`pw-well-drop${dragging ? " is-dragging" : ""}`}
                onDragEnter={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
              >
                <PearWell active={dragging} />
                <div className="pw-well-drop-copy">
                  <p className="pw-well-drop-title">Upload Insurance PDF</p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <button
                      type="button"
                      className="pw-btn !py-2 !px-3 text-xs"
                      onClick={() => fileRef.current?.click()}
                    >
                      Browse file
                    </button>
                    <button
                      type="button"
                      className="pw-btn pw-btn-secondary !py-2 !px-3 text-xs"
                      onClick={() => void runIngest(SAMPLE_FILENAME)}
                    >
                      Use sample
                    </button>
                  </div>
                </div>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.txt,application/pdf,text/plain"
                className="sr-only"
                onChange={(e) => {
                  onFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </div>
          ) : (
            <>
              <div className="px-4 sm:px-5 py-3 border-b border-pine/10 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-moss">
                    {phase === "ingesting" ? "Live ingestion" : "Case ready"}
                  </p>
                  <p className="text-sm text-ink font-medium">
                    {filename ?? "illustration.pdf"}
                  </p>
                </div>
                <p className="text-xs text-stone animate-pulse-soft">
                  {statusLine}
                </p>
              </div>

              {phase === "ingesting" && steps.length > 0 ? (
                <ol className="px-4 sm:px-5 py-3 space-y-2 border-b border-pine/5">
                  {steps.map((step, i) => {
                    const done = i < stepIndex;
                    const current = i === stepIndex;
                    return (
                      <li
                        key={step.id}
                        className={`flex items-start gap-2 text-sm ${
                          current
                            ? "text-pine"
                            : done
                              ? "text-ink"
                              : "text-stone/50"
                        }`}
                      >
                        <span
                          className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${
                            current
                              ? "bg-moss animate-pulse-soft"
                              : done
                                ? "bg-pine"
                                : "bg-stone/30"
                          }`}
                        />
                        <span>
                          <span className="font-medium">{step.label}</span>
                          {current ? (
                            <span className="text-stone"> — {step.detail}</span>
                          ) : null}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              ) : null}

              <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-4">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`max-w-[94%] ${m.role === "user" ? "ml-auto" : ""}`}
                  >
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                        m.role === "user"
                          ? "bg-pine text-foam"
                          : m.role === "system"
                            ? "bg-amber/10 text-ink border border-amber/25"
                            : "bg-white/85 text-ink border border-pine/10"
                      }`}
                    >
                      {m.content}
                    </div>
                    {m.intent && m.role === "assistant" ? (
                      <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                        <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-moss/10 text-moss">
                          {m.intent.replace(/_/g, " ")}
                        </span>
                        {m.spokenScript ? (
                          <button
                            type="button"
                            className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border border-pine/15 text-stone hover:text-pine"
                            onClick={() => void narrate(m.spokenScript!)}
                          >
                            Speak
                          </button>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ))}
                {busy ? (
                  <div className="text-xs text-moss animate-pulse-soft">
                    Running simulation…
                  </div>
                ) : null}
                {speechNote ? (
                  <div className="text-xs text-danger border border-danger/20 rounded-xl px-3 py-2">
                    {speechNote}
                  </div>
                ) : null}
                <div ref={bottomRef} />
              </div>

              {phase === "ready" ? (
                <>
                  <div className="px-4 sm:px-5 pb-3 flex flex-wrap gap-2">
                    {STARTERS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        disabled={busy}
                        onClick={() => send(s)}
                        className="text-xs px-3 py-1.5 rounded-full border border-pine/15 text-stone hover:text-pine disabled:opacity-50 cursor-pointer"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <form
                    className="p-4 border-t border-pine/10 flex gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      send(input);
                    }}
                  >
                    <button
                      type="button"
                      className={`pw-btn pw-btn-secondary shrink-0 !px-3 ${
                        listening ? "!bg-moss/15 !border-moss/40" : ""
                      }`}
                      onClick={toggleListen}
                      disabled={busy}
                      aria-pressed={listening}
                    >
                      {listening ? "Listening…" : "Mic"}
                    </button>
                    <input
                      className="pw-input"
                      value={input}
                      disabled={busy}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask about the synthesized policy…"
                      aria-label="Ask the Pear live agent"
                    />
                    <button
                      type="submit"
                      className="pw-btn shrink-0"
                      disabled={busy || !input.trim()}
                    >
                      Send
                    </button>
                  </form>
                </>
              ) : (
                <div className="p-4 border-t border-pine/10 text-xs text-stone">
                  Agent is reading the illustration — chat unlocks when synthesis
                  completes.
                </div>
              )}
            </>
          )}
        </section>

        <aside className="space-y-4">
          <div className="pw-panel p-5 shadow-[var(--shadow-soft)] min-h-[280px]">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h2 className="font-display text-xl text-pine">
                {simulation?.title ??
                  (phase === "upload"
                    ? "Waiting for upload"
                    : "Live synthesis")}
              </h2>
              <span className="text-[10px] uppercase tracking-wider text-stone">
                {phase === "ingesting"
                  ? "Extracting"
                  : phase === "ready"
                    ? "Response view"
                    : "Idle"}
              </span>
            </div>

            {phase === "upload" ? (
              <p className="text-sm text-stone">
                Extracted facts will stream here as the agent reads the
                illustration — insured, premiums, funding, lapse ages.
              </p>
            ) : simulation ? (
              <>
                {simulation.rows.length > 0 ? (
                  <dl className="space-y-2 text-sm">
                    {simulation.rows.map((row) => (
                      <div
                        key={`${row.label}-${row.value}`}
                        className="flex justify-between gap-3 border-b border-pine/5 pb-1.5 animate-rise"
                      >
                        <dt className="text-stone">{row.label}</dt>
                        <dd className="text-ink text-right font-medium">
                          {row.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="text-sm text-stone animate-pulse-soft">
                    Reading pages…
                  </p>
                )}

                {simulation.options && simulation.options.length > 0 ? (
                  <div className="mt-4 space-y-2 max-h-[42vh] overflow-y-auto pr-1">
                    {simulation.options.map((o) => (
                      <article
                        key={o.rank}
                        className="rounded-xl border border-pine/10 bg-foam/80 px-3 py-3 text-sm"
                      >
                        <div className="flex items-baseline justify-between gap-2">
                          <h3 className="font-medium text-pine">
                            {o.rank}. {o.carrier}
                          </h3>
                          <span className="text-[10px] uppercase tracking-wider text-moss">
                            Hypothetical
                          </span>
                        </div>
                        <p className="text-xs text-stone mt-0.5">{o.product}</p>
                        <p className="mt-2 text-ink">
                          {money(o.monthlyPremium)}/mo · DB{" "}
                          {money(o.deathBenefit)} · CV@52{" "}
                          {money(o.illustratedCashValueAtAge52)}
                        </p>
                        <p className="text-xs text-moss mt-1.5">{o.highlight}</p>
                      </article>
                    ))}
                  </div>
                ) : null}

                {simulation.disclaimer ? (
                  <p className="mt-3 text-[11px] text-stone/80 leading-snug">
                    {simulation.disclaimer}
                  </p>
                ) : null}
              </>
            ) : (
              <p className="text-sm text-stone animate-pulse-soft">
                Opening document…
              </p>
            )}
          </div>

          <div className="pw-panel p-5 text-sm space-y-2">
            <h2 className="font-display text-xl text-pine">Pipeline</h2>
            <ul className="space-y-2 text-stone text-xs">
              <li className={phase !== "upload" ? "text-pine" : ""}>
                1. Upload into the well
              </li>
              <li
                className={
                  phase === "ingesting" || phase === "ready" ? "text-pine" : ""
                }
              >
                2. Read & extract aloud
              </li>
              <li className={phase === "ready" ? "text-pine" : ""}>
                3. Ask the synthesized case
              </li>
            </ul>
            {extractedFields.length > 0 ? (
              <p className="text-xs text-moss pt-2 border-t border-pine/5">
                {extractedFields.length} fields synthesized
                {filename ? ` from ${filename}` : ""}
              </p>
            ) : null}
          </div>
        </aside>
      </main>
    </div>
  );
}
