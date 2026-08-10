"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type TouchEvent,
} from "react";
import { buildProposalBook } from "@/lib/intelligence/proposal-book";
import { CohortStrengthSlide } from "./CohortStrengthSlide";
import { CoverageStatusSlide } from "./CoverageStatusSlide";
import { MarketStandardSlide } from "./MarketStandardSlide";
import { PremiumByPolicySlide } from "./PremiumByPolicySlide";
import { ProposalNavigation } from "./ProposalNavigation";
import type { ProposalThumbMeta } from "./ProposalThumbnail";

const SLIDES: ProposalThumbMeta[] = [
  { id: "premium", index: 0, label: "Premium by policy", preview: "premium" },
  { id: "cohort", index: 1, label: "Comparable cohort", preview: "cohort" },
  { id: "standard", index: 2, label: "Market standard", preview: "standard" },
  { id: "status", index: 3, label: "Coverage status", preview: "status" },
];

export function ProposalCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const book = useMemo(() => buildProposalBook(), []);

  const goTo = useCallback((index: number) => {
    setActiveIndex((index + SLIDES.length) % SLIDES.length);
  }, []);
  const next = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const previous = useCallback(
    () => goTo(activeIndex - 1),
    [activeIndex, goTo],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      const root = document.getElementById("proposals");
      if (!root) return;
      const inView =
        root.getBoundingClientRect().top < window.innerHeight * 0.7 &&
        root.getBoundingClientRect().bottom > window.innerHeight * 0.25;
      if (!inView) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        previous();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, previous]);

  function onTouchStart(e: TouchEvent) {
    touchStartX.current = e.changedTouches[0]?.clientX ?? null;
  }

  function onTouchEnd(e: TouchEvent) {
    const start = touchStartX.current;
    const end = e.changedTouches[0]?.clientX;
    touchStartX.current = null;
    if (start == null || end == null) return;
    const delta = end - start;
    if (Math.abs(delta) < 48) return;
    if (delta < 0) next();
    else previous();
  }

  const active = SLIDES[activeIndex]!;

  return (
    <div
      className="pw-proposal-carousel"
      aria-label="PolicyWell sales and renewals proposal pages"
    >
      <div className="pw-proposal-carousel-meta">
        <p className="pw-proposals-cta-eyebrow">Sales &amp; renewals</p>
        <h2 id="pw-proposals-heading" className="pw-proposals-cta-title">
          Build elite proposals in minutes
        </h2>
        <p className="pw-proposals-cta-copy">
          Modernize sales with proposals powered by price benchmarks, visual
          analysis, and data-driven recommendations. PolicyWell delivers posh,
          easily digestible presentations for clients.
        </p>
      </div>

      <div
        className="pw-proposal-stage"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          key={active.id}
          className="pw-proposal-slide"
          role="tabpanel"
          aria-labelledby={`pw-proposal-tab-${active.id}`}
        >
          <div
            id={`pw-proposal-panel-${active.id}`}
            className="pw-proposal-canvas"
          >
            {active.id === "premium" ? (
              <PremiumByPolicySlide book={book} />
            ) : null}
            {active.id === "cohort" ? (
              <CohortStrengthSlide book={book} />
            ) : null}
            {active.id === "standard" ? (
              <MarketStandardSlide book={book} />
            ) : null}
            {active.id === "status" ? (
              <CoverageStatusSlide book={book} />
            ) : null}
          </div>
        </div>
      </div>

      <ProposalNavigation
        items={SLIDES}
        activeIndex={activeIndex}
        onGoTo={goTo}
        onPrevious={previous}
        onNext={next}
      />

      <p className="pw-proposal-slide-caption" aria-live="polite">
        {String(activeIndex + 1).padStart(2, "0")} · {active.label}
      </p>

      <div className="pw-proposals-cta-actions">
        <Link href="/demo/" className="pw-btn">
          Request demo access
        </Link>
        <Link href="/book-a-call/" className="pw-btn pw-btn-secondary">
          Book a call
        </Link>
      </div>
    </div>
  );
}
