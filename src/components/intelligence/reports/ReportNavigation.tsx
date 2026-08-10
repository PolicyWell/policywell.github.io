"use client";

import { useEffect, useRef } from "react";
import { ReportThumbnail, type ReportThumbMeta } from "./ReportThumbnail";

export function ReportNavigation({
  items,
  activeIndex,
  onGoTo,
  onPrevious,
  onNext,
}: {
  items: ReportThumbMeta[];
  activeIndex: number;
  onGoTo: (index: number) => void;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;
    const active = root.querySelector<HTMLElement>(".pw-report-thumb.is-active");
    active?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeIndex]);

  return (
    <div className="pw-report-nav">
      <button
        type="button"
        className="pw-report-nav-arrow"
        aria-label="Previous report"
        onClick={onPrevious}
      >
        ‹
      </button>
      <div
        ref={scrollerRef}
        className="pw-report-thumbs"
        role="tablist"
        aria-label="Intelligence reports"
      >
        {items.map((item, index) => (
          <ReportThumbnail
            key={item.id}
            meta={item}
            active={index === activeIndex}
            onSelect={() => onGoTo(index)}
          />
        ))}
      </div>
      <button
        type="button"
        className="pw-report-nav-arrow"
        aria-label="Next report"
        onClick={onNext}
      >
        ›
      </button>
    </div>
  );
}
