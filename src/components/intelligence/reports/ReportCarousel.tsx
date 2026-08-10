"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type TouchEvent,
} from "react";
import { buildReportBook, type ReportPolicyRow } from "@/lib/intelligence/report-book";
import { useDocuments, useProfile } from "@/lib/use-workspace";
import { AtRiskReport } from "./AtRiskReport";
import { BookHealthReport } from "./BookHealthReport";
import { FundingReport } from "./FundingReport";
import { OpportunityReport } from "./OpportunityReport";
import { PolicyDetailSheet } from "./PolicyDetailSheet";
import { PolicyGapReport } from "./PolicyGapReport";
import { PolicyHealthReport } from "./PolicyHealthReport";
import { ReportNavigation } from "./ReportNavigation";
import type { ReportThumbMeta } from "./ReportThumbnail";
import { ReportSlide } from "./ReportSlide";

const SLIDES: ReportThumbMeta[] = [
  { id: "policy-health", index: 0, label: "Policy Health", preview: "matrix" },
  { id: "policy-gaps", index: 1, label: "Policy Gaps", preview: "gaps" },
  { id: "book-health", index: 2, label: "Book Health", preview: "book" },
  { id: "funding", index: 3, label: "Funding Benchmarks", preview: "funding" },
  { id: "at-risk", index: 4, label: "At-Risk Policies", preview: "risk" },
  { id: "opportunities", index: 5, label: "Opportunities", preview: "ops" },
];

export function ReportCarousel() {
  const profile = useProfile();
  const documents = useDocuments();
  const [activeIndex, setActiveIndex] = useState(0);
  const [selected, setSelected] = useState<ReportPolicyRow | null>(null);
  const [tick, setTick] = useState(0);
  const touchStartX = useRef<number | null>(null);

  // Refresh when workspace store changes; light poll for ingest completion.
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
    return buildReportBook({
      liveProfile: profile,
      liveDocuments: documents,
    });
  }, [profile, documents, tick]);

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
    <div className="pw-report-carousel" aria-label="PolicyWell intelligence reports">
      <div className="pw-report-carousel-meta">
        <p className="pw-demo-eyebrow">Insurance intelligence</p>
        <h2 className="pw-demo-h2">Reports that read like underwriting, not a dashboard.</h2>
        <p className="pw-demo-section-copy">
          Swipe or click through the working book. Simulated households are labeled;
          live workspace ingest appears when present.
        </p>
        <p className="pw-report-live-line">
          <span className="pw-report-tag pw-report-tag-live">
            {book.liveCount} live
          </span>
          <span className="pw-report-tag pw-report-tag-simulated">
            {book.simulatedCount} simulated
          </span>
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
        {SLIDES.map((slide, index) => (
          <ReportSlide
            key={slide.id}
            active={index === activeIndex}
            labelledBy={`pw-report-tab-${slide.id}`}
          >
            <div id={`pw-report-panel-${slide.id}`}>
              {slide.id === "policy-health" ? (
                <PolicyHealthReport book={book} onSelectPolicy={setSelected} />
              ) : null}
              {slide.id === "policy-gaps" ? (
                <PolicyGapReport book={book} onSelectPolicy={setSelected} />
              ) : null}
              {slide.id === "book-health" ? (
                <BookHealthReport book={book} onSelectPolicy={setSelected} />
              ) : null}
              {slide.id === "funding" ? (
                <FundingReport book={book} onSelectPolicy={setSelected} />
              ) : null}
              {slide.id === "at-risk" ? (
                <AtRiskReport book={book} onSelectPolicy={setSelected} />
              ) : null}
              {slide.id === "opportunities" ? (
                <OpportunityReport book={book} onSelectPolicy={setSelected} />
              ) : null}
            </div>
          </ReportSlide>
        ))}
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

      <PolicyDetailSheet row={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
