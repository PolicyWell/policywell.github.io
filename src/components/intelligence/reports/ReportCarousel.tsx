"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type TouchEvent,
} from "react";
import { buildCommercialReportBook } from "@/lib/intelligence/commercial-report-book";
import { CaseComplianceReport } from "./CaseComplianceReport";
import { CommercialAtRiskReport } from "./CommercialAtRiskReport";
import { CommercialGapsReport } from "./CommercialGapsReport";
import { PerilHeatmapReport } from "./PerilHeatmapReport";
import { PricingCompsReport } from "./PricingCompsReport";
import { ReportNavigation } from "./ReportNavigation";
import type { ReportThumbMeta } from "./ReportThumbnail";
import { ReportSlide } from "./ReportSlide";

const SLIDES: ReportThumbMeta[] = [
  { id: "peril-heatmap", index: 0, label: "Peril heatmap", preview: "matrix" },
  { id: "policy-gaps", index: 1, label: "Policy gaps", preview: "gaps" },
  { id: "case-compliance", index: 2, label: "Case compliance", preview: "book" },
  { id: "pricing-comps", index: 3, label: "Pricing comps", preview: "funding" },
  { id: "at-risk", index: 4, label: "At-risk renewals", preview: "risk" },
];

export function ReportCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [tick, setTick] = useState(0);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const onStore = () => setTick((n) => n + 1);
    window.addEventListener("policywell-store-change", onStore);
    const poll = window.setInterval(onStore, 12_000);
    return () => {
      window.removeEventListener("policywell-store-change", onStore);
      window.clearInterval(poll);
    };
  }, []);

  const book = useMemo(() => {
    void tick;
    return buildCommercialReportBook({ provenance: "simulated" });
  }, [tick]);

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
      const root = document.getElementById("reports");
      if (!root) return;
      const rect = root.getBoundingClientRect();
      const inView =
        rect.top < window.innerHeight * 0.7 &&
        rect.bottom > window.innerHeight * 0.25;
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
      className="pw-report-carousel"
      aria-label="PolicyWell commercial intelligence reports"
    >
      <div className="pw-report-carousel-meta">
        <p className="pw-demo-eyebrow">Commercial simulations</p>
        <h2 className="pw-demo-h2">
          Harbor Fab reports — peril, gaps, compliance, pricing, renewals.
        </h2>
        <p className="pw-demo-section-copy">
          Swipe or click through the commercial working file. Simulated demo data
          is labeled; live commercial workspace accounts appear when present.
        </p>
        <p className="pw-report-live-line">
          <span className={`pw-report-tag pw-report-tag-${book.provenance}`}>
            {book.provenance === "live" ? "Live" : "Simulated"}
          </span>
          <span className="pw-report-mono">{book.accountName}</span>
          <span className="pw-report-mono">
            Updated {new Date(book.generatedAt).toLocaleTimeString()}
          </span>
        </p>
      </div>

      <div
        className="pw-report-stage"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <ReportSlide
          key={active.id}
          active
          labelledBy={`pw-report-tab-${active.id}`}
        >
          <div id={`pw-report-panel-${active.id}`}>
            {active.id === "peril-heatmap" ? (
              <PerilHeatmapReport book={book} />
            ) : null}
            {active.id === "policy-gaps" ? (
              <CommercialGapsReport book={book} />
            ) : null}
            {active.id === "case-compliance" ? (
              <CaseComplianceReport book={book} />
            ) : null}
            {active.id === "pricing-comps" ? (
              <PricingCompsReport book={book} />
            ) : null}
            {active.id === "at-risk" ? (
              <CommercialAtRiskReport book={book} />
            ) : null}
          </div>
        </ReportSlide>
      </div>

      <ReportNavigation
        items={SLIDES}
        activeIndex={activeIndex}
        onGoTo={goTo}
        onPrevious={previous}
        onNext={next}
      />

      <p className="pw-report-slide-caption" aria-live="polite">
        {String(activeIndex + 1).padStart(2, "0")} · {active.label}
      </p>
    </div>
  );
}
