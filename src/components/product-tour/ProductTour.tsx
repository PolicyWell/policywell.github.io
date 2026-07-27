"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PolicyWellCLIShowcase } from "@/components/PolicyWellCLIShowcase";
import { SiteNav } from "@/components/ui";
import {
  PRODUCT_SCENES,
  PRODUCT_TOUR_TOTAL_MS,
  type ProductSceneId,
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

const TOTAL_SEC = Math.round(PRODUCT_TOUR_TOTAL_MS / 1000);

export function ProductTour() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [elapsedInScene, setElapsedInScene] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const scene = PRODUCT_SCENES[index];
  const sceneProgress = Math.min(1, elapsedInScene / scene.durationMs);
  const globalElapsed = useMemo(() => {
    const prior = PRODUCT_SCENES.slice(0, index).reduce(
      (sum, s) => sum + s.durationMs,
      0,
    );
    return prior + elapsedInScene;
  }, [index, elapsedInScene]);
  const globalProgress = Math.min(1, globalElapsed / PRODUCT_TOUR_TOTAL_MS);

  const goTo = useCallback((next: number) => {
    const clamped = Math.max(0, Math.min(PRODUCT_SCENES.length - 1, next));
    setIndex(clamped);
    setElapsedInScene(0);
  }, []);

  const next = useCallback(() => {
    setIndex((i) => {
      if (i >= PRODUCT_SCENES.length - 1) {
        setPlaying(false);
        return i;
      }
      return i + 1;
    });
    setElapsedInScene(0);
  }, []);

  const prev = useCallback(() => {
    goTo(index - 1);
  }, [goTo, index]);

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
    setElapsedInScene(0);
    let frame = 0;
    const tick = (now: number) => {
      const elapsed = now - started;
      setElapsedInScene(elapsed);
      if (elapsed >= scene.durationMs) {
        next();
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, index, scene.durationMs, next, prefersReducedMotion]);

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
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const uploadProgress = Math.min(
    100,
    scene.id === "app" ? Math.round(sceneProgress * 100) : 0,
  );
  const agentTick = Math.round(sceneProgress * 100);
  const agentMode: "text" | "voice" =
    scene.id === "agents" && sceneProgress > 0.48 ? "voice" : "text";

  return (
    <div className="pw-product-tour">
      <SiteNav />
      <div className="pw-shell pw-pt-shell">
        <header className="pw-pt-top">
          <div>
            <p className="pw-pt-kicker">YC product walkthrough · under 3 min</p>
            <h1 className="pw-pt-h1">
              <span className="pw-pt-step">{scene.step}</span> {scene.title}
            </h1>
            <p className="pw-pt-sub">{scene.subtitle}</p>
          </div>
          <div className="pw-pt-controls" aria-label="Tour controls">
            <button type="button" className="pw-pt-ctrl" onClick={prev} disabled={index === 0}>
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
              disabled={index === PRODUCT_SCENES.length - 1}
            >
              Next
            </button>
          </div>
        </header>

        <div
          className="pw-pt-progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(globalProgress * 100)}
          aria-label="Tour progress"
        >
          <span style={{ width: `${globalProgress * 100}%` }} />
        </div>
        <p className="pw-pt-timer">
          {formatTime(globalElapsed)} / {formatTime(PRODUCT_TOUR_TOTAL_MS)} ·{" "}
          {TOTAL_SEC}s cap · lightweight UI mocks (no video)
        </p>

        <nav className="pw-pt-chapters" aria-label="Scenes">
          {PRODUCT_SCENES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className={`pw-pt-chapter${i === index ? " is-active" : ""}${
                i < index ? " is-done" : ""
              }`}
              onClick={() => {
                goTo(i);
                setPlaying(true);
              }}
            >
              {s.step} {shortLabel(s.id)}
            </button>
          ))}
        </nav>

        <section className="pw-pt-stage" aria-live="polite">
          <SceneStage
            id={scene.id}
            uploadProgress={uploadProgress}
            agentMode={agentMode}
            agentTick={agentTick}
          />
        </section>

        <footer className="pw-pt-foot">
          <Link href="/agent" className="pw-btn">
            Open live workspace
          </Link>
          <Link href="/book-a-call/" className="pw-btn pw-btn-secondary">
            Book a call
          </Link>
          <Link href="/demo/" className="pw-pt-link">
            Lifecycle demo
          </Link>
          <Link href="/docs/cli/" className="pw-pt-link">
            CLI docs
          </Link>
        </footer>
      </div>
    </div>
  );
}

function SceneStage({
  id,
  uploadProgress,
  agentMode,
  agentTick,
}: {
  id: ProductSceneId;
  uploadProgress: number;
  agentMode: "text" | "voice";
  agentTick: number;
}) {
  switch (id) {
    case "intro":
      return (
        <div className="pw-pt-intro">
          <div className="pw-pt-intro-grid">
            {[
              "Web risk · market · claims",
              "White-label CLI agent",
              "Follow-up CRM",
              "In-force analyzer",
              "Mobile upload",
              "Text & voice agents",
            ].map((item) => (
              <div key={item} className="pw-pt-card pw-pt-intro-card">
                {item}
              </div>
            ))}
          </div>
          <p className="pw-pt-caption">
            Built for policyholders, producers, carriers, IMOs, and commercial
            groups — explainable recommendations with human review.
          </p>
        </div>
      );
    case "risk":
      return (
        <div className="pw-pt-scene">
          <RiskAssessmentMock />
          <p className="pw-pt-caption">
            Risk dashboard: every policy is scored for gaps and exposure before
            renewal.
          </p>
        </div>
      );
    case "market":
      return (
        <div className="pw-pt-scene">
          <MarketComparisonMock />
          <p className="pw-pt-caption">
            Market comparison: carrier quotes side by side on price, terms, and
            coverage match.
          </p>
        </div>
      );
    case "claims":
      return (
        <div className="pw-pt-scene">
          <ClaimsTrackerMock />
          <p className="pw-pt-caption">
            Claims tracker: open claims and renewals in one place with carrier
            back-and-forth handled.
          </p>
        </div>
      );
    case "cli":
      return (
        <div className="pw-pt-scene pw-pt-cli">
          <PolicyWellCLIShowcase compact hideIntro />
          <p className="pw-pt-caption">
            White-label CLI agent insurance professionals embed — switch
            audiences above and try live commands.
          </p>
        </div>
      );
    case "crm":
      return (
        <div className="pw-pt-scene">
          <CrmMock />
          <p className="pw-pt-caption">
            Follow-up CRM for policyholders, gap seekers, and producers —
            next-best actions from live context.
          </p>
        </div>
      );
    case "analyzer":
      return (
        <div className="pw-pt-scene">
          <AnalyzerMock />
          <p className="pw-pt-caption">
            In-force analyzer across households, carriers, IMOs, and commercial
            groups.
          </p>
        </div>
      );
    case "app":
      return (
        <div className="pw-pt-scene pw-pt-app-scene">
          <AppUploadMock progress={uploadProgress} />
          <p className="pw-pt-caption">
            Mobile app: upload or photograph a policy, then extract, score, and
            explain on device.
          </p>
        </div>
      );
    case "agents":
      return (
        <div className="pw-pt-scene">
          <TextVoiceAgentMock mode={agentMode} tick={agentTick} />
          <p className="pw-pt-caption">
            Text-to-interpret and voice-to-interpret agent interactions —
            grounded answers, not black-box advice.
          </p>
        </div>
      );
    case "close":
      return (
        <div className="pw-pt-close">
          <h2 className="pw-pt-close-title">That&apos;s the product surface</h2>
          <p>
            Seed a household, open commercial risk, or schedule time with the
            PolicyWell team.
          </p>
          <div className="pw-pt-close-actions">
            <Link href="/agent" className="pw-btn">
              Talk to the agent
            </Link>
            <Link href="/commercial" className="pw-btn pw-btn-secondary">
              Commercial workspace
            </Link>
            <Link href="/book-a-call/" className="pw-btn pw-btn-secondary">
              Book a call
            </Link>
          </div>
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

function shortLabel(id: ProductSceneId) {
  switch (id) {
    case "intro":
      return "Intro";
    case "risk":
      return "Risk";
    case "market":
      return "Market";
    case "claims":
      return "Claims";
    case "cli":
      return "CLI";
    case "crm":
      return "CRM";
    case "analyzer":
      return "Analyzer";
    case "app":
      return "App";
    case "agents":
      return "Agents";
    case "close":
      return "Next";
    default:
      return id;
  }
}
