"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import {
  PEAR2_TERMINAL_A_SCRIPT,
  PEAR2_TERMINAL_B_STARTERS,
  runPear2CliCommand,
  type PearTermLine,
  type PearTermTone,
} from "@/lib/v1/pear2-terminals";
import { PEAR_CASE_NAME } from "@/lib/v1/pear-malik-context";

const LINE_MS = 42;

function toneClass(tone: PearTermTone = "default"): string {
  switch (tone) {
    case "command":
      return "pw-cli-line-command";
    case "success":
      return "pw-cli-line-success";
    case "muted":
      return "pw-cli-line-muted";
    case "warn":
      return "pw-cli-line-warn";
    case "accent":
      return "pw-cli-line-accent";
    case "dim":
      return "pw-cli-line-dim";
    case "blank":
      return "pw-cli-line-blank";
    default:
      return "pw-cli-line-default";
  }
}

function TerminalWindow({
  title,
  subtitle,
  lines,
  footer,
  bodyRef,
  dark,
}: {
  title: string;
  subtitle?: string;
  lines: PearTermLine[];
  footer?: ReactNode;
  bodyRef?: RefObject<HTMLDivElement | null>;
  dark?: boolean;
}) {
  return (
    <div
      className={`pw-cli-window${dark ? " pw-cli-window-dark" : ""} pear2-term`}
    >
      <div className="pw-cli-chrome">
        <div className="pw-cli-dots" aria-hidden>
          <span />
          <span />
          <span />
        </div>
        <div className="pw-cli-title">
          {title}
          {subtitle ? (
            <span className="pear2-term-sub"> · {subtitle}</span>
          ) : null}
        </div>
      </div>
      <div className="pw-cli-body pear2-term-body" ref={bodyRef} tabIndex={0}>
        {lines.map((line, i) => (
          <div
            key={`${i}-${line.text.slice(0, 24)}`}
            className={`pw-cli-line ${toneClass(line.tone)}`}
          >
            {line.text || "\u00a0"}
          </div>
        ))}
      </div>
      {footer}
    </div>
  );
}

export function PearDualTerminals() {
  const formId = useId();
  const [aLines, setALines] = useState<PearTermLine[]>([]);
  const [aDone, setADone] = useState(false);
  const [bLines, setBLines] = useState<PearTermLine[]>([
    { text: "PolicyWell", tone: "accent" },
    { text: "", tone: "blank" },
    {
      text: "Terminal B ready. Type a command or pick a starter below.",
      tone: "dim",
    },
    { text: 'Try: help · init · ingest · summary · ask "any better options?"', tone: "muted" },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [replayKey, setReplayKey] = useState(0);

  const aBodyRef = useRef<HTMLDivElement>(null);
  const bBodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    let i = 0;
    let timeoutId = 0;

    const tick = () => {
      if (cancelled) return;
      if (i >= PEAR2_TERMINAL_A_SCRIPT.length) {
        setADone(true);
        return;
      }
      const next = PEAR2_TERMINAL_A_SCRIPT[i]!;
      setALines((prev) => (i === 0 ? [next] : [...prev, next]));
      i += 1;
      timeoutId = window.setTimeout(
        tick,
        next.tone === "blank" ? 120 : LINE_MS * 3,
      );
    };

    timeoutId = window.setTimeout(tick, 400);
    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [replayKey]);

  useEffect(() => {
    aBodyRef.current?.scrollTo({
      top: aBodyRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [aLines]);

  useEffect(() => {
    bBodyRef.current?.scrollTo({
      top: bBodyRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [bLines, busy]);

  function appendB(lines: PearTermLine[]) {
    setBLines((prev) => [...prev, ...lines]);
  }

  function runCommand(raw: string) {
    const cmd = raw.trim();
    if (!cmd || busy) return;

    if (cmd.toLowerCase() === "clear" || cmd.toLowerCase() === "cls") {
      setBLines([
        { text: "PolicyWell", tone: "accent" },
        { text: "", tone: "blank" },
        { text: "Cleared.", tone: "dim" },
      ]);
      setInput("");
      return;
    }

    setBusy(true);
    setInput("");
    appendB([
      { text: "", tone: "blank" },
      { text: `josh@policywell % npm run policywell -- ${cmd}`, tone: "command" },
    ]);

    window.setTimeout(() => {
      const out = runPear2CliCommand(cmd.replace(/^policywell\s+/i, ""));
      appendB([{ text: "", tone: "blank" }, ...out]);
      setBusy(false);
      inputRef.current?.focus();
    }, 280);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    runCommand(input);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "l" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      runCommand("clear");
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[linear-gradient(165deg,#0c1210_0%,#14201a_45%,#0f1814_100%)] text-foam">
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="pw-shell py-4 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-moss">
              PolicyWell · {PEAR_CASE_NAME}
            </p>
            <h1 className="font-display text-2xl sm:text-3xl text-foam mt-1">
              Two-terminal live demo
            </h1>
            <p className="text-sm text-white/65 mt-1 max-w-2xl">
              Terminal A boots the stack. Terminal B runs the PolicyWell CLI
              walkthrough — funding, lapse, cash value, scenarios, better
              options — same math as the live demo.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="pw-btn pw-btn-secondary !py-2 !px-3 text-xs"
              onClick={() => {
                setALines([]);
                setADone(false);
                setReplayKey((k) => k + 1);
              }}
            >
              Replay Terminal A
            </button>
            <button
              type="button"
              className="pw-btn pw-btn-secondary !py-2 !px-3 text-xs"
              onClick={() => runCommand("clear")}
            >
              Clear Terminal B
            </button>
          </div>
        </div>
      </header>

      <main className="pw-shell flex-1 py-4 md:py-6 grid lg:grid-cols-2 gap-4 md:gap-5 items-stretch">
        <section className="flex flex-col min-h-[55vh]">
          <p className="text-[10px] uppercase tracking-[0.16em] text-moss mb-2">
            Terminal A · stack
          </p>
          <TerminalWindow
            title="zsh — supabase + next"
            subtitle={aDone ? "ready" : "booting"}
            lines={aLines}
            bodyRef={aBodyRef}
            dark
          />
        </section>

        <section className="flex flex-col min-h-[55vh]">
          <p className="text-[10px] uppercase tracking-[0.16em] text-moss mb-2">
            Terminal B · policywell CLI
          </p>
          <TerminalWindow
            title="zsh — policywell"
            subtitle="interactive"
            lines={bLines}
            bodyRef={bBodyRef}
            dark
            footer={
              <form
                id={formId}
                className="pear2-term-input"
                onSubmit={onSubmit}
              >
                <span className="pear2-term-prompt" aria-hidden>
                  %
                </span>
                <input
                  ref={inputRef}
                  className="pear2-term-field"
                  value={input}
                  disabled={busy}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder='funding · cashvalue --age 52 · ask "any better options?"'
                  aria-label="PolicyWell CLI command"
                  autoComplete="off"
                  spellCheck={false}
                />
                <button
                  type="submit"
                  className="pw-btn !py-1.5 !px-3 text-xs shrink-0"
                  disabled={busy || !input.trim()}
                >
                  Run
                </button>
              </form>
            }
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {PEAR2_TERMINAL_B_STARTERS.map((s) => (
              <button
                key={s}
                type="button"
                disabled={busy}
                onClick={() => runCommand(s)}
                className="text-[11px] px-2.5 py-1 rounded-md border border-white/15 text-white/70 hover:text-foam hover:border-moss/50 disabled:opacity-40"
              >
                {s}
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
