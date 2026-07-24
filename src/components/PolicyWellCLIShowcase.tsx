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
import { parseAudienceDemo } from "@/lib/cli-audience-context";
import {
  CLI_AUDIENCES,
  type CliAudience,
  type TerminalLine,
  type TerminalTone,
} from "@/lib/cli-showcase-data";
import { createEmptyProfile } from "@/lib/profile";
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

const LINE_MS = 36;

const HELP_LINES: TerminalLine[] = [
  { text: "Interactive PolicyWell Insurance Intelligence Agent", tone: "accent" },
  { text: "Type a question, or try:", tone: "muted" },
  { text: "  help                 Show this help", tone: "default" },
  { text: "  context              Show live household / org context", tone: "default" },
  { text: "  scores               Run deterministic PolicyWell scores", tone: "default" },
  { text: "  recommend            Generate pending recommendations", tone: "default" },
  { text: "  ask <question>       Grounded policy Q&A", tone: "default" },
  { text: "  clear                Clear interactive history", tone: "default" },
  { text: "  demo                 Replay the scripted audience demo", tone: "default" },
  { text: "", tone: "blank" },
  {
    text: "Switch Policyholder / Carriers / IMOs anytime - the prompt stays on the bottom line.",
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

export function PolicyWellCLIShowcase({
  className = "",
  compact = false,
  hideIntro = false,
}: {
  className?: string;
  compact?: boolean;
  hideIntro?: boolean;
}) {
  const tabsId = useId();
  const [activeId, setActiveId] = useState(CLI_AUDIENCES[0].id);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [visibleCount, setVisibleCount] = useState(0);
  const [demoDone, setDemoDone] = useState(false);
  const [history, setHistory] = useState<TerminalLine[]>([]);
  const [command, setCommand] = useState("");
  const [busy, setBusy] = useState(false);
  const [demoEpoch, setDemoEpoch] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const logRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const busyRef = useRef(false);
  const seededAudienceRef = useRef<string | null>(null);

  const session = useSession();
  const profile = useProfile();
  const documents = useDocuments();
  const recommendations = useRecommendations();
  const tasks = useTasks();
  const latest = useRef({ session, profile, documents, recommendations, tasks });

  useEffect(() => {
    latest.current = { session, profile, documents, recommendations, tasks };
  }, [session, profile, documents, recommendations, tasks]);

  const audience =
    CLI_AUDIENCES.find((a) => a.id === activeId) ?? CLI_AUDIENCES[0];

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const applyAudienceContext = useCallback((target: CliAudience) => {
    const parsed = parseAudienceDemo(target);
    persistSession(parsed.user);
    persistProfile(parsed.profile);
    persistDocuments(parsed.documents);
    persistRecommendations([]);
    persistTasks([]);
    latest.current = {
      session: parsed.user,
      profile: parsed.profile,
      documents: parsed.documents,
      recommendations: [],
      tasks: [],
    };
    seededAudienceRef.current = target.id;
    return parsed;
  }, []);

  // Animate (or instantly show) the active audience script. Prompt stays mounted below.
  useEffect(() => {
    const total = audience.lines.length;
    let cancelled = false;
    let timer = 0;

    const finish = () => {
      if (cancelled) return;
      setDemoDone(true);
      const parsed = applyAudienceContext(audience);
      setHistory([
        { text: "", tone: "blank" },
        { text: `✓ ${parsed.statusLine}`, tone: "success" },
        {
          text: "Prompt stays on the bottom line. Type a question or `help`.",
          tone: "dim",
        },
      ]);
    };

    // Defer resets so this effect only schedules work (lint-safe).
    timer = window.setTimeout(() => {
      if (cancelled) return;
      setHistory([]);

      if (reducedMotion) {
        setVisibleCount(total);
        finish();
        return;
      }

      setVisibleCount(0);
      setDemoDone(false);
      let i = 0;
      const tick = () => {
        if (cancelled) return;
        i += 1;
        setVisibleCount(i);
        if (i >= total) {
          finish();
          return;
        }
        const next = audience.lines[i];
        timer = window.setTimeout(tick, next?.delayMs ?? LINE_MS);
      };
      timer = window.setTimeout(tick, 90);
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [audience, reducedMotion, demoEpoch, applyAudienceContext]);

  useEffect(() => {
    const el = logRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [visibleCount, history, busy, activeId]);

  useEffect(() => {
    if (busy) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 80);
    return () => window.clearTimeout(t);
  }, [activeId, demoDone, busy]);

  function ensureSession(): SessionUser {
    const current = latest.current.session;
    if (current) return current;
    if (seededAudienceRef.current !== audience.id) {
      return applyAudienceContext(audience).user;
    }
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
    if (seededAudienceRef.current !== audience.id) {
      applyAudienceContext(audience);
    }
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
    if (demoDone) return;
    setVisibleCount(audience.lines.length);
    setDemoDone(true);
    const parsed = applyAudienceContext(audience);
    setHistory([
      { text: "", tone: "blank" },
      { text: `✓ ${parsed.statusLine}`, tone: "success" },
      {
        text: "Prompt stays on the bottom line. Type a question or `help`.",
        tone: "dim",
      },
    ]);
  }

  function selectTab(id: string) {
    if (id === activeId) return;
    // Keep whatever the user is mid-typing on the sticky prompt.
    setActiveId(id);
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
            text: "Interactive history cleared. Audience demo kept above.",
            tone: "muted",
          },
          { text: "", tone: "blank" },
        ],
      };
    }
    if (lower === "demo" || lower === "replay") {
      return { mode: "demo", lines: [] };
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

    if (!demoDone) skipDemo();

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
        setDemoEpoch((n) => n + 1);
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

  const scriptLines = audience.lines.slice(
    0,
    reducedMotion || demoDone ? audience.lines.length : visibleCount,
  );

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
                aria-controls={`${tabsId}-panel`}
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
          id={`${tabsId}-panel`}
          aria-labelledby={`${tabsId}-${audience.id}`}
          className="pw-cli-panel"
        >
          <div
            className="pw-cli-log"
            ref={logRef}
            role="log"
            aria-live="polite"
            onClick={() => {
              if (!demoDone) skipDemo();
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
                  key={`h-${audience.id}-${i}-${line.tone}-${line.text.slice(0, 24)}`}
                  className={toneClass(line.tone)}
                >
                  {line.text || "\u00A0"}
                </div>
              ))}
              {!demoDone && !reducedMotion && (
                <div className="pw-cli-cursor-row" aria-hidden>
                  <span className="pw-cli-prompt">$</span>
                  <span className="pw-cli-cursor" />
                </div>
              )}
            </pre>
            {!demoDone && (
              <p className="pw-cli-skip-hint">
                Click the log to skip · prompt stays below
              </p>
            )}
          </div>

          <form
            className="pw-cli-prompt-form pw-cli-prompt-sticky"
            onSubmit={onSubmit}
            onClick={(e) => e.stopPropagation()}
          >
            <label className="sr-only" htmlFor={`${tabsId}-cmd`}>
              Agent command
            </label>
            <span className="pw-cli-prompt" aria-hidden>
              $
            </span>
            <input
              id={`${tabsId}-cmd`}
              ref={inputRef}
              className="pw-cli-prompt-input"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              disabled={busy}
              autoComplete="off"
              spellCheck={false}
              placeholder={
                busy
                  ? "Running…"
                  : `ask as ${audience.shortLabel.toLowerCase()} or type help`
              }
              aria-label="Type a PolicyWell agent command"
              onKeyDown={(e) => {
                if (e.key === "Escape") setCommand("");
              }}
              onFocus={() => {
                if (!demoDone) skipDemo();
              }}
            />
            {busy && <span className="pw-cli-cursor" aria-hidden />}
          </form>
        </div>
      </div>
    </section>
  );
}
