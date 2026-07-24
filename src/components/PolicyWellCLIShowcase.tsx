"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { runAgentTurn, type AgentWorkspace } from "@/lib/agent";
import {
  CLI_AUDIENCES,
  type CliAudience,
  type TerminalLine,
  type TerminalTone,
} from "@/lib/cli-showcase-data";
import { createEmptyProfile } from "@/lib/profile";
import { buildDemoSeed } from "@/lib/seed";
import type { SessionUser } from "@/lib/types";
import {
  persistDocuments,
  persistProfile,
  persistRecommendations,
  persistSession,
  persistTasks,
  useDocuments,
  useProfile,
  useRecommendations,
  useSession,
  useTasks,
} from "@/lib/use-workspace";

const LINE_MS = 48;

const HELP_LINES: TerminalLine[] = [
  { text: "Interactive PolicyWell Insurance Intelligence Agent", tone: "accent" },
  { text: "Type a question, or try:", tone: "muted" },
  { text: "  help                 Show this help", tone: "default" },
  { text: "  seed                 Load sample household (Alex Rivera)", tone: "default" },
  { text: "  context              Show live household context", tone: "default" },
  { text: "  scores               Run deterministic PolicyWell scores", tone: "default" },
  { text: "  recommend            Generate pending recommendations", tone: "default" },
  { text: "  ask <question>       Grounded policy Q&A", tone: "default" },
  { text: "  clear                Clear interactive history", tone: "default" },
  { text: "  demo                 Replay the scripted audience demo", tone: "default" },
  { text: "", tone: "blank" },
  { text: "Tip: free-form questions work too - e.g. “Will my policy lapse?”", tone: "dim" },
];

const READY_HINT: TerminalLine[] = [
  { text: "", tone: "blank" },
  {
    text: "Ready. Type a question or `help` - press Enter to run.",
    tone: "dim",
  },
];

function toneClass(tone: TerminalTone = "default"): string {
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

function replyToLines(reply: string): TerminalLine[] {
  const parts = reply.split("\n");
  const lines: TerminalLine[] = [{ text: "", tone: "blank" }];
  for (const part of parts) {
    if (!part.trim()) {
      lines.push({ text: "", tone: "blank" });
      continue;
    }
    lines.push({ text: part, tone: "default" });
  }
  lines.push({ text: "", tone: "blank" });
  return lines;
}

function ArchitectureStrip({ steps }: { steps: string[] }) {
  return (
    <div className="pw-cli-arch" aria-label="Integration architecture">
      {steps.map((step, i) => (
        <span key={step} className="pw-cli-arch-item">
          <span className="pw-cli-arch-chip">{step}</span>
          {i < steps.length - 1 && (
            <span className="pw-cli-arch-arrow" aria-hidden>
              →
            </span>
          )}
        </span>
      ))}
    </div>
  );
}

function CliAgentSession({
  audience,
  reducedMotion,
  inputId,
}: {
  audience: CliAudience;
  reducedMotion: boolean;
  inputId: string;
}) {
  const [visibleCount, setVisibleCount] = useState(
    reducedMotion ? audience.lines.length : 0,
  );
  const [done, setDone] = useState(reducedMotion);
  const [history, setHistory] = useState<TerminalLine[]>(
    reducedMotion ? READY_HINT : [],
  );
  const [command, setCommand] = useState("");
  const [busy, setBusy] = useState(false);
  const [demoKey, setDemoKey] = useState(0);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const busyRef = useRef(false);

  const session = useSession();
  const profile = useProfile();
  const documents = useDocuments();
  const recommendations = useRecommendations();
  const tasks = useTasks();
  const latest = useRef({ session, profile, documents, recommendations, tasks });

  useEffect(() => {
    latest.current = { session, profile, documents, recommendations, tasks };
  }, [session, profile, documents, recommendations, tasks]);

  // Animate scripted demo; only schedules timeouts (no sync setState on mount path beyond init).
  useEffect(() => {
    if (reducedMotion) return;
    let i = visibleCount;
    let timer = 0;
    if (i >= audience.lines.length) return;
    const tick = () => {
      i += 1;
      setVisibleCount(i);
      if (i >= audience.lines.length) {
        setDone(true);
        setHistory(READY_HINT);
        return;
      }
      const next = audience.lines[i];
      timer = window.setTimeout(tick, next?.delayMs ?? LINE_MS);
    };
    timer = window.setTimeout(tick, i === 0 ? 120 : LINE_MS);
    return () => window.clearTimeout(timer);
    // Restart only when demoKey bumps (tab remount handles audience changes).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoKey, reducedMotion, audience.lines]);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [visibleCount, history, busy, done]);

  useEffect(() => {
    if (!done || busy) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 120);
    return () => window.clearTimeout(t);
  }, [done, busy, demoKey]);

  function ensureSession(): SessionUser {
    const current = latest.current.session;
    if (current) return current;
    const guest: SessionUser = {
      id: "user_guest",
      email: "guest@policywell.local",
      name: "Guest Analyst",
      role: "policyholder",
    };
    persistSession(guest);
    if (!latest.current.profile) {
      persistProfile(
        createEmptyProfile(guest.id, guest.role, guest.name, guest.email),
      );
    }
    return guest;
  }

  function buildWorkspace(user: SessionUser): AgentWorkspace {
    const { profile: p, documents: docs, recommendations: recs, tasks: t } =
      latest.current;
    return {
      user,
      profile:
        p ?? createEmptyProfile(user.id, user.role, user.name, user.email),
      documents: docs,
      recommendations: recs,
      tasks: t,
    };
  }

  function skipDemo() {
    if (done) return;
    setVisibleCount(audience.lines.length);
    setDone(true);
    setHistory(READY_HINT);
  }

  function replayDemo() {
    setCommand("");
    setHistory([]);
    if (reducedMotion) {
      setVisibleCount(audience.lines.length);
      setDone(true);
      setHistory(READY_HINT);
      return;
    }
    setVisibleCount(0);
    setDone(false);
    setDemoKey((k) => k + 1);
  }

  function seedDemoHousehold(): TerminalLine[] {
    const user = ensureSession();
    const demoUser: SessionUser = {
      ...user,
      id: "user_alex",
      email: "alex@example.com",
      name: "Alex Rivera",
      role: "policyholder",
    };
    const { profile: p, documents: docs } = buildDemoSeed(demoUser);
    persistSession(demoUser);
    persistProfile(p);
    persistDocuments(docs);
    persistRecommendations([]);
    persistTasks([]);
    latest.current = {
      ...latest.current,
      session: demoUser,
      profile: p,
      documents: docs,
      recommendations: [],
      tasks: [],
    };
    return [
      { text: "✓ Sample household loaded: Alex Rivera", tone: "success" },
      {
        text: "✓ Indexed universal life policy ingested (illustrative)",
        tone: "success",
      },
      { text: "Try: scores · recommend · Will my policy lapse?", tone: "dim" },
      { text: "", tone: "blank" },
    ];
  }

  function runAgent(message: string): TerminalLine[] {
    const user = ensureSession();
    const workspace = buildWorkspace(user);
    const result = runAgentTurn(message, workspace);
    persistProfile(result.workspace.profile);
    persistRecommendations(result.workspace.recommendations);
    persistTasks(result.workspace.tasks);
    latest.current = {
      ...latest.current,
      profile: result.workspace.profile,
      recommendations: result.workspace.recommendations,
      tasks: result.workspace.tasks,
    };
    const toolLines: TerminalLine[] = result.toolResults.map((t) => ({
      text: `${t.ok ? "✓" : "!"} ${t.tool}: ${t.summary}`,
      tone: t.ok ? ("success" as const) : ("warn" as const),
    }));
    return [
      ...toolLines,
      ...replyToLines(result.reply),
      {
        text: "synthesis: deterministic · human review required for recommendations",
        tone: "dim",
      },
      { text: "", tone: "blank" },
    ];
  }

  function resolveCommand(raw: string): {
    lines: TerminalLine[];
    mode?: "clear" | "demo";
  } {
    const trimmed = raw.trim();
    const lower = trimmed.toLowerCase();
    if (!trimmed) return { lines: [] };

    if (lower === "help" || lower === "?") {
      return { lines: [...HELP_LINES, { text: "", tone: "blank" }] };
    }
    if (lower === "clear") {
      return {
        mode: "clear",
        lines: [
          {
            text: "Interactive history cleared. Demo script kept above.",
            tone: "muted",
          },
          { text: "", tone: "blank" },
        ],
      };
    }
    if (lower === "demo" || lower === "replay") {
      return { mode: "demo", lines: [] };
    }
    if (lower === "seed" || lower === "seed demo" || lower === "load sample") {
      return { lines: seedDemoHousehold() };
    }
    if (lower === "context" || lower === "who am i") {
      return { lines: runAgent("What do you know about me?") };
    }
    if (lower === "scores" || lower === "score") {
      return {
        lines: runAgent("Show my PolicyWell scores and policy health."),
      };
    }
    if (
      lower === "recommend" ||
      lower === "recs" ||
      lower === "recommendations"
    ) {
      return { lines: runAgent("What do you recommend?") };
    }
    const askMatch = trimmed.match(/^ask\s+(.+)$/i);
    if (askMatch) return { lines: runAgent(askMatch[1]) };
    return { lines: runAgent(trimmed) };
  }

  async function submitCommand(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed || busyRef.current) return;

    busyRef.current = true;
    setBusy(true);
    setCommand("");

    const echo: TerminalLine[] = [
      { text: "", tone: "blank" },
      { text: `$ ${trimmed}`, tone: "command" },
    ];

    try {
      await new Promise((r) => window.setTimeout(r, 10));
      const { lines, mode } = resolveCommand(trimmed);
      if (mode === "demo") {
        setHistory((h) => [...h, ...echo]);
        replayDemo();
        return;
      }
      if (mode === "clear") {
        setHistory([...echo, ...lines]);
        return;
      }
      if (lines.length) setHistory((h) => [...h, ...echo, ...lines]);
      else setHistory((h) => [...h, ...echo]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Command failed.";
      setHistory((h) => [
        ...h,
        ...echo,
        { text: `! ${msg}`, tone: "warn" },
        { text: "", tone: "blank" },
      ]);
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void submitCommand(command);
  }

  const scriptLines = audience.lines.slice(
    0,
    reducedMotion || done ? audience.lines.length : visibleCount,
  );

  return (
    <div
      className="pw-cli-body"
      ref={bodyRef}
      role="log"
      aria-live="polite"
      onClick={() => {
        if (!done) skipDemo();
        else inputRef.current?.focus();
      }}
    >
      {audience.architecture && (
        <ArchitectureStrip steps={audience.architecture} />
      )}
      <pre className="pw-cli-pre">
        {scriptLines.map((line, i) => (
          <div key={`${audience.id}-${i}`} className={toneClass(line.tone)}>
            {line.text || "\u00A0"}
          </div>
        ))}
        {history.map((line, i) => (
          <div
            key={`h-${i}-${line.tone}-${line.text.slice(0, 24)}`}
            className={toneClass(line.tone)}
          >
            {line.text || "\u00A0"}
          </div>
        ))}
        {!done && !reducedMotion && (
          <div className="pw-cli-cursor-row" aria-hidden>
            <span className="pw-cli-prompt">$</span>
            <span className="pw-cli-cursor" />
          </div>
        )}
      </pre>

      {done && (
        <form
          className="pw-cli-prompt-form"
          onSubmit={onSubmit}
          onClick={(e) => e.stopPropagation()}
        >
          <label className="sr-only" htmlFor={inputId}>
            Agent command
          </label>
          <span className="pw-cli-prompt" aria-hidden>
            $
          </span>
          <input
            id={inputId}
            ref={inputRef}
            className="pw-cli-prompt-input"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            disabled={busy}
            autoComplete="off"
            spellCheck={false}
            placeholder={busy ? "Running…" : "ask a question or type help"}
            aria-label="Type a PolicyWell agent command"
            onKeyDown={(e) => {
              if (e.key === "Escape") setCommand("");
            }}
          />
          {busy && <span className="pw-cli-cursor" aria-hidden />}
        </form>
      )}

      {!done && <p className="pw-cli-skip-hint">Click to skip demo and type…</p>}
    </div>
  );
}

export function PolicyWellCLIShowcase({
  className = "",
  compact = false,
  hideIntro = false,
}: {
  className?: string;
  /** Tighter spacing when embedded inside the dark hero */
  compact?: boolean;
  /** Hide the section heading and supporting copy */
  hideIntro?: boolean;
}) {
  const tabsId = useId();
  const [activeId, setActiveId] = useState(CLI_AUDIENCES[0].id);
  const [reducedMotion, setReducedMotion] = useState(false);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const audience =
    CLI_AUDIENCES.find((a) => a.id === activeId) ?? CLI_AUDIENCES[0];

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const selectTab = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const onTabKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const idx = CLI_AUDIENCES.findIndex((a) => a.id === activeId);
    if (idx < 0) return;
    let next = idx;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      next = (idx + 1) % CLI_AUDIENCES.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      next = (idx - 1 + CLI_AUDIENCES.length) % CLI_AUDIENCES.length;
    } else if (event.key === "Home") {
      event.preventDefault();
      next = 0;
    } else if (event.key === "End") {
      event.preventDefault();
      next = CLI_AUDIENCES.length - 1;
    } else {
      return;
    }
    selectTab(CLI_AUDIENCES[next].id);
    tabRefs.current[next]?.focus();
  };

  return (
    <section
      className={`pw-cli ${compact ? "pw-cli-compact" : ""} ${className}`}
      aria-label="PolicyWell Insurance Intelligence Agent"
    >
      {!(hideIntro || compact) && (
        <div className="pw-cli-intro">
          <h2 className="pw-cli-heading">
            Insurance intelligence for every part of the ecosystem.
          </h2>
          <p className="pw-cli-lede">
            PolicyWell turns policies, carrier data, and household context into
            explainable decisions, recommendations, and actions.
          </p>
        </div>
      )}

      <div className="pw-cli-window">
        <div className="pw-cli-chrome">
          <div className="pw-cli-traffic" aria-hidden>
            <span className="pw-cli-dot pw-cli-dot-red" />
            <span className="pw-cli-dot pw-cli-dot-yellow" />
            <span className="pw-cli-dot pw-cli-dot-green" />
          </div>
          <p className="pw-cli-title">PolicyWell - Insurance Intelligence Agent</p>
          <span className="pw-cli-chrome-spacer" aria-hidden />
        </div>

        <div
          className="pw-cli-tabs"
          role="tablist"
          aria-label="Audience"
          onKeyDown={onTabKeyDown}
        >
          {CLI_AUDIENCES.map((tab, i) => {
            const selected = tab.id === activeId;
            return (
              <button
                key={tab.id}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`${tabsId}-${tab.id}`}
                aria-selected={selected}
                aria-controls={`${tabsId}-panel-${tab.id}`}
                tabIndex={selected ? 0 : -1}
                className={`pw-cli-tab ${selected ? "is-active" : ""}`}
                onClick={() => selectTab(tab.id)}
              >
                <span className="pw-cli-tab-full">{tab.label}</span>
                <span className="pw-cli-tab-short">{tab.shortLabel}</span>
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          id={`${tabsId}-panel-${audience.id}`}
          aria-labelledby={`${tabsId}-${audience.id}`}
          className="pw-cli-panel"
        >
          <CliAgentSession
            key={`${audience.id}-${reducedMotion ? "rm" : "motion"}`}
            audience={audience}
            reducedMotion={reducedMotion}
            inputId={`${tabsId}-cmd`}
          />
        </div>
      </div>
    </section>
  );
}
