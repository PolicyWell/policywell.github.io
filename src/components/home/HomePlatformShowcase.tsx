"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ClaimsMock,
  CoverageMock,
  ExposuresMock,
  PoliciesMock,
  RenewalsMock,
} from "@/components/home/platform-carousel-slides";

const SLIDES = [
  {
    id: "policies",
    label: "Policy Management",
    blurb: "All your policies in one place",
    panel: <PoliciesMock />,
  },
  {
    id: "claims",
    label: "Claims Management",
    blurb: "Intake, monitor, and analyze",
    panel: <ClaimsMock />,
  },
  {
    id: "coverage",
    label: "Coverage Library",
    blurb: "Issue, track, and benchmark coverage",
    panel: <CoverageMock />,
  },
  {
    id: "exposures",
    label: "Exposures",
    blurb: "Auto, locations, and hazard risk",
    panel: <ExposuresMock />,
  },
  {
    id: "renewals",
    label: "Renewals",
    blurb: "Centralized communications",
    panel: <RenewalsMock />,
  },
] as const;

const AUTO_MS = 6500;

type SlideId = (typeof SLIDES)[number]["id"];

/**
 * WithCoverage-style dark platform carousel: tab labels, timed progress bar,
 * and light dashboard mockups for PolicyWell product surfaces.
 */
export function HomePlatformShowcase() {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const baseId = useId();
  const tablistRef = useRef<HTMLDivElement>(null);
  const reduceMotion = usePrefersReducedMotion();

  const goTo = useCallback((next: number) => {
    setIndex((next + SLIDES.length) % SLIDES.length);
    setProgress(0);
  }, []);

  useEffect(() => {
    if (paused || reduceMotion) return;
    const started = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const elapsed = now - started;
      const pct = Math.min(1, elapsed / AUTO_MS);
      setProgress(pct);
      if (pct >= 1) {
        goTo(index + 1);
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [index, paused, reduceMotion, goTo]);

  useEffect(() => {
    const root = tablistRef.current;
    if (!root) return;
    const active = root.querySelector<HTMLElement>('[aria-selected="true"]');
    active?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [index, reduceMotion]);

  const active = SLIDES[index]!;

  return (
    <section
      id="platform"
      className="pw-wc-platform"
      aria-labelledby="pw-wc-platform-heading"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      <div className="pw-shell pw-shell-wide">
        <div className="pw-wc-platform-head">
          <h2 id="pw-wc-platform-heading" className="pw-wc-platform-title">
            One Digital Platform To Deliver You A Seamless Experience
          </h2>
          <Link
            href="/platform/"
            className="pw-wc-btn-outline pw-wc-btn-outline-light"
          >
            Learn more
          </Link>
        </div>

        <div
          ref={tablistRef}
          className="pw-wc-platform-tabs"
          role="tablist"
          aria-label="PolicyWell platform surfaces"
        >
          {SLIDES.map((slide, i) => {
            const selected = i === index;
            return (
              <button
                key={slide.id}
                type="button"
                role="tab"
                id={`${baseId}-${slide.id}`}
                aria-selected={selected}
                aria-controls={`${baseId}-panel`}
                className={`pw-wc-platform-tab${selected ? " is-active" : ""}`}
                onClick={() => goTo(i)}
              >
                <span className="pw-wc-platform-tab-label">{slide.label}</span>
                <span className="pw-wc-platform-tab-blurb">{slide.blurb}</span>
                <span className="pw-wc-platform-tab-track" aria-hidden>
                  <span
                    className="pw-wc-platform-tab-fill"
                    style={
                      selected
                        ? { transform: `scaleX(${progress})` }
                        : { transform: "scaleX(0)" }
                    }
                  />
                </span>
              </button>
            );
          })}
        </div>

        <div
          id={`${baseId}-panel`}
          role="tabpanel"
          aria-labelledby={`${baseId}-${active.id as SlideId}`}
          className="pw-wc-platform-stage"
        >
          <div key={active.id} className="pw-wc-platform-panel is-fade">
            {active.panel as ReactNode}
          </div>
        </div>

        <p className="pw-wc-platform-foot">
          <Link href="/#intelligent-insights">Open live Intelligent Insights</Link>
          <span aria-hidden>·</span>
          <Link href="/demo/">Request a product demo</Link>
        </p>
      </div>
    </section>
  );
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return reduced;
}
