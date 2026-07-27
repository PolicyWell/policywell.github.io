"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PolicyWellCLIShowcase } from "@/components/PolicyWellCLIShowcase";
import { SiteNav } from "@/components/ui";
import {
  PRODUCT_AUTOPLAY_TOTAL_MS,
  PRODUCT_DEMO_DOWNLOAD_HREF,
  PRODUCT_DEMO_DOWNLOAD_LABEL,
  PRODUCT_MODULES,
  PRODUCT_TOP_TABS,
  activeDemoStep,
  demoStepIndex,
  type ProductModuleId,
  type ProductTopTab,
} from "@/lib/product-tour-data";
import {
  AnalyzerMock,
  AppUploadMock,
  ClaimsTrackerMock,
  CrmMock,
  MarketComparisonMock,
  RiskAssessmentMock,
  TextVoiceAgentMock,
} from "@/components/product-tour/ProductTourMocks";

const TOTAL_SEC = Math.round(PRODUCT_AUTOPLAY_TOTAL_MS / 1000);

export function ProductTour() {
  const [activeId, setActiveId] = useState<ProductModuleId>("dashboard");
  const [playing, setPlaying] = useState(true);
  const [elapsedInModule, setElapsedInModule] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [uploadTick, setUploadTick] = useState(0);

  const moduleIndex = PRODUCT_MODULES.findIndex((m) => m.id === activeId);
  const module = PRODUCT_MODULES[moduleIndex] ?? PRODUCT_MODULES[0];
  const topTab = module.topTab;

  const moduleProgress = Math.min(1, elapsedInModule / module.durationMs);
  const globalElapsed = useMemo(() => {
    const prior = PRODUCT_MODULES.slice(0, moduleIndex).reduce(
      (sum, m) => sum + m.durationMs,
      0,
    );
    return prior + elapsedInModule;
  }, [moduleIndex, elapsedInModule]);
  const globalProgress = Math.min(
    1,
    globalElapsed / PRODUCT_AUTOPLAY_TOTAL_MS,
  );

  const step = activeDemoStep(module, moduleProgress);
  const stepIdx = demoStepIndex(module, moduleProgress);
  const totalSteps = PRODUCT_MODULES.reduce((n, m) => n + m.steps.length, 0);
  const completedSteps =
    PRODUCT_MODULES.slice(0, moduleIndex).reduce(
      (n, m) => n + m.steps.length,
      0,
    ) + stepIdx;

  const selectModule = useCallback((id: ProductModuleId) => {
    setActiveId(id);
    setElapsedInModule(0);
    setUploadTick(0);
  }, []);

  const selectTab = useCallback((tab: ProductTopTab) => {
    const first = PRODUCT_MODULES.find((m) => m.topTab === tab);
    if (first) selectModule(first.id);
  }, [selectModule]);

  const next = useCallback(() => {
    setActiveId((id) => {
      const i = PRODUCT_MODULES.findIndex((m) => m.id === id);
      if (i >= PRODUCT_MODULES.length - 1) {
        setPlaying(false);
        return id;
      }
      return PRODUCT_MODULES[i + 1].id;
    });
    setElapsedInModule(0);
    setUploadTick(0);
  }, []);

  const prev = useCallback(() => {
    const i = PRODUCT_MODULES.findIndex((m) => m.id === activeId);
    if (i <= 0) return;
    selectModule(PRODUCT_MODULES[i - 1].id);
  }, [activeId, selectModule]);

  const restart = useCallback(() => {
    selectModule("dashboard");
    setPlaying(true);
  }, [selectModule]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setPrefersReducedMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!playing || prefersReducedMotion) return;
    const started = performance.now();
    setElapsedInModule(0);
    let frame = 0;
    const tick = (now: number) => {
      const elapsed = now - started;
      setElapsedInModule(elapsed);
      if (activeId === "app") {
        setUploadTick(Math.min(100, Math.round((elapsed / module.durationMs) * 100)));
      }
      if (elapsed >= module.durationMs) {
        next();
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, activeId, module.durationMs, next, prefersReducedMotion]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      } else if (e.key === "p" || e.key === "P") {
        setPlaying((p) => !p);
      } else if (e.key === "r" || e.key === "R") {
        restart();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, restart]);

  const agentMode: "text" | "voice" = "voice";
  const agentTick = Math.round(moduleProgress * 100);

  return (
    <div className="pw-product-tour">
      <SiteNav />
      <div className="pw-shell pw-pt-shell">
        <header className="pw-pt-banner">
          <div>
            <p className="pw-pt-kicker">
              YC application demo · exactly {formatTime(PRODUCT_AUTOPLAY_TOTAL_MS)}{" "}
              · {totalSteps} interactive steps · under 100MB download
            </p>
            <h1 className="pw-pt-banner-title">PolicyWell product demo</h1>
          </div>
          <div className="pw-pt-controls" aria-label="Tour controls">
            <button type="button" className="pw-pt-ctrl" onClick={prev} disabled={moduleIndex === 0}>
              Prev
            </button>
            <button
              type="button"
              className="pw-pt-ctrl"
              onClick={() => setPlaying((p) => !p)}
            >
              {playing ? "Pause" : "Play"}
            </button>
            <button
              type="button"
              className="pw-pt-ctrl"
              onClick={next}
              disabled={moduleIndex === PRODUCT_MODULES.length - 1}
            >
              Next
            </button>
            <button type="button" className="pw-pt-ctrl" onClick={restart}>
              Restart
            </button>
            <a
              className="pw-pt-ctrl pw-pt-ctrl-download"
              href={PRODUCT_DEMO_DOWNLOAD_HREF}
              download="PolicyWell-YC-Demo-3min.zip"
            >
              Download
            </a>
          </div>
        </header>

        <div
          className="pw-pt-progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(globalProgress * 100)}
          aria-label="Demo progress"
        >
          <span style={{ width: `${globalProgress * 100}%` }} />
        </div>
        <p className="pw-pt-timer">
          {formatTime(globalElapsed)} / {formatTime(PRODUCT_AUTOPLAY_TOTAL_MS)} ·
          step {completedSteps + 1}/{totalSteps}: {step.label}
        </p>
        <p className="pw-pt-step-banner" aria-live="polite">
          <strong>
            {moduleIndex + 1}/{PRODUCT_MODULES.length} · {module.label}
          </strong>
          <span>{step.label}</span>
        </p>

        {/* Central app shell */}
        <div className="pw-pt-app">
          <aside className="pw-pt-rail" aria-label="Product modules">
            <div className="pw-pt-rail-brand">
              <img
                className="pw-pt-rail-logo"
                src="/favicon.svg"
                alt="PolicyWell"
                width={32}
                height={32}
                decoding="async"
              />
              <span>PolicyWell</span>
            </div>
            <p className="pw-pt-rail-section">Workspace</p>
            <nav className="pw-pt-rail-nav">
              {PRODUCT_MODULES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={`pw-pt-rail-item${
                    activeId === m.id ? " is-active" : ""
                  }`}
                  onClick={() => {
                    selectModule(m.id);
                    setPlaying(false);
                  }}
                >
                  <span className="pw-pt-rail-dot" aria-hidden />
                  {m.label}
                </button>
              ))}
            </nav>
            <div className="pw-pt-rail-foot">
              <a href={PRODUCT_DEMO_DOWNLOAD_HREF} download="PolicyWell-YC-Demo-3min.zip">
                Download YC ZIP
              </a>
              <Link href="/book-a-call/">Book a call</Link>
            </div>
          </aside>

          <div className="pw-pt-center">
            <div className="pw-pt-topnav" role="tablist" aria-label="Product areas">
              {PRODUCT_TOP_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={topTab === tab.id}
                  className={`pw-pt-topnav-item${
                    topTab === tab.id ? " is-active" : ""
                  }`}
                  onClick={() => {
                    selectTab(tab.id);
                    setPlaying(false);
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="pw-pt-workspace">
              <header className="pw-pt-workspace-head">
                <div>
                  <h2>{module.title}</h2>
                  <p>{module.subtitle}</p>
                </div>
                <span className="pw-pt-workspace-badge">
                  {Math.round(TOTAL_SEC / 60)}:
                  {(TOTAL_SEC % 60).toString().padStart(2, "0")} demo
                </span>
              </header>

              <div
                className="pw-pt-workspace-body"
                aria-live="polite"
                onPointerDownCapture={() => setPlaying(false)}
              >
                <ModuleView
                  id={activeId}
                  uploadProgress={activeId === "app" ? uploadTick : 0}
                  agentMode={agentMode}
                  agentTick={agentTick}
                  onJump={(id) => {
                    selectModule(id);
                    setPlaying(false);
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <footer className="pw-pt-foot">
          <a
            href={PRODUCT_DEMO_DOWNLOAD_HREF}
            className="pw-btn"
            download="PolicyWell-YC-Demo-3min.zip"
          >
            {PRODUCT_DEMO_DOWNLOAD_LABEL}
          </a>
          <Link href="/book-a-call/" className="pw-btn pw-btn-secondary">
            Book a call
          </Link>
          <Link href="/demo/" className="pw-pt-link">
            Lifecycle demo
          </Link>
        </footer>
      </div>
    </div>
  );
}

function ModuleView({
  id,
  uploadProgress,
  agentMode,
  agentTick,
  onJump,
}: {
  id: ProductModuleId;
  uploadProgress: number;
  agentMode: "text" | "voice";
  agentTick: number;
  onJump: (id: ProductModuleId) => void;
}) {
  switch (id) {
    case "dashboard":
      return (
        <div className="pw-pt-dash">
          <p className="pw-pt-dash-lede">
            Select a module in the left rail — or let autoplay walk YC partners
            through the full surface in one window.
          </p>
          <ul className="pw-pt-dash-list" aria-label="Module suggestions">
            {PRODUCT_MODULES.filter((m) => m.id !== "dashboard").map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  className="pw-pt-dash-row"
                  onClick={() => onJump(m.id)}
                >
                  <span className="pw-pt-dash-check" aria-hidden>
                    ✓
                  </span>
                  <span className="pw-pt-dash-label">
                    <strong>{m.label}</strong>
                    <em>{m.title}</em>
                  </span>
                  <span className="pw-pt-dash-status">available</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      );
    case "risk":
      return (
        <div className="pw-pt-scene">
          <RiskAssessmentMock onNavigate={onJump} />
          <p className="pw-pt-caption">
            Risk dashboard: gaps and exposure before renewal. Side squares jump
            Risk → Market → Claims.
          </p>
        </div>
      );
    case "market":
      return (
        <div className="pw-pt-scene">
          <MarketComparisonMock onNavigate={onJump} />
          <p className="pw-pt-caption">
            Market comparison: carrier quotes on price, terms, and match. Use
            the side squares to switch sections.
          </p>
        </div>
      );
    case "claims":
      return (
        <div className="pw-pt-scene">
          <ClaimsTrackerMock onNavigate={onJump} />
          <p className="pw-pt-caption">
            Claims tracker: timelines, documents, and adjuster handoff. Side
            squares open Risk or Market.
          </p>
        </div>
      );
    case "cli":
      return (
        <div className="pw-pt-scene pw-pt-cli">
          <PolicyWellCLIShowcase compact hideIntro />
          <p className="pw-pt-caption">
            White-label CLI — switch audiences and try live commands.
          </p>
        </div>
      );
    case "crm":
      return (
        <div className="pw-pt-scene">
          <CrmMock />
          <p className="pw-pt-caption">
            CRM: customer rows, suitability status, and clickable advisor
            greetings for send / mass follow-up.
          </p>
        </div>
      );
    case "analyzer":
      return (
        <div className="pw-pt-scene">
          <AnalyzerMock />
          <p className="pw-pt-caption">
            In-force analyzer across household, carrier, IMO, and commercial.
          </p>
        </div>
      );
    case "app":
      return (
        <div className="pw-pt-scene pw-pt-app-scene">
          <AppUploadMock
            progress={uploadProgress}
            onContinueToVoice={() => onJump("agents")}
          />
          <p className="pw-pt-caption">
            iOS: upload or live API → ask lapse &amp; overfund questions with a
            cash-value chart → continue to voice.
          </p>
        </div>
      );
    case "agents":
      return (
        <div className="pw-pt-scene pw-pt-app-scene">
          <TextVoiceAgentMock mode={agentMode} tick={agentTick} />
          <p className="pw-pt-caption">
            Voice assistant: pick an IUL option to see growth illustration, then
            connect with a broker.
          </p>
        </div>
      );
    default:
      return null;
  }
}

function formatTime(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
