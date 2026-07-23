"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  CLI_AUDIENCES,
  type CliAudience,
  type TerminalTone,
} from "@/lib/cli-showcase-data";

const LINE_MS = 48;

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

function TerminalBody({
  audience,
  visibleCount,
  done,
  reducedMotion,
}: {
  audience: CliAudience;
  visibleCount: number;
  done: boolean;
  reducedMotion: boolean;
}) {
  const bodyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [visibleCount, audience.id]);

  const lines = audience.lines.slice(
    0,
    reducedMotion ? audience.lines.length : visibleCount,
  );

  return (
    <div className="pw-cli-body" ref={bodyRef} tabIndex={0} role="log" aria-live="polite">
      {audience.architecture && (
        <ArchitectureStrip steps={audience.architecture} />
      )}
      <pre className="pw-cli-pre">
        {lines.map((line, i) => (
          <div key={`${audience.id}-${i}`} className={toneClass(line.tone)}>
            {line.text || "\u00A0"}
          </div>
        ))}
        {!done && !reducedMotion && (
          <div className="pw-cli-cursor-row" aria-hidden>
            <span className="pw-cli-prompt">$</span>
            <span className="pw-cli-cursor" />
          </div>
        )}
        {done && !reducedMotion && (
          <div className="pw-cli-cursor-row" aria-hidden>
            <span className="pw-cli-prompt">$</span>
            <span className="pw-cli-cursor is-idle" />
          </div>
        )}
      </pre>
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
  const [visibleCount, setVisibleCount] = useState(0);
  const [done, setDone] = useState(false);
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

  useEffect(() => {
    setVisibleCount(0);
    setDone(false);

    if (reducedMotion) {
      setVisibleCount(audience.lines.length);
      setDone(true);
      return;
    }

    let i = 0;
    let timer = 0;
    const tick = () => {
      i += 1;
      setVisibleCount(i);
      if (i >= audience.lines.length) {
        setDone(true);
        return;
      }
      const next = audience.lines[i];
      const wait = next?.delayMs ?? LINE_MS;
      timer = window.setTimeout(tick, wait);
    };
    timer = window.setTimeout(tick, 120);
    return () => window.clearTimeout(timer);
  }, [audience, reducedMotion]);

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
      aria-label="PolicyWell CLI showcase"
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
          <p className="pw-cli-title">policywell — insurance intelligence</p>
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
          <TerminalBody
            audience={audience}
            visibleCount={visibleCount}
            done={done}
            reducedMotion={reducedMotion}
          />
        </div>
      </div>
    </section>
  );
}
