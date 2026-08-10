"use client";

import { useEffect, useRef } from "react";
import {
  ProposalThumbnail,
  type ProposalThumbMeta,
} from "./ProposalThumbnail";

export function ProposalNavigation({
  items,
  activeIndex,
  onGoTo,
  onPrevious,
  onNext,
}: {
  items: ProposalThumbMeta[];
  activeIndex: number;
  onGoTo: (index: number) => void;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;
    const active = root.querySelector<HTMLElement>(
      ".pw-proposal-thumb.is-active",
    );
    active?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeIndex]);

  return (
    <div className="pw-proposal-nav">
      <button
        type="button"
        className="pw-proposal-nav-arrow"
        aria-label="Previous proposal page"
        onClick={onPrevious}
      >
        ‹
      </button>
      <div
        ref={scrollerRef}
        className="pw-proposal-thumbs"
        role="tablist"
        aria-label="Proposal presentation pages"
      >
        {items.map((item, index) => (
          <ProposalThumbnail
            key={item.id}
            meta={item}
            active={index === activeIndex}
            onSelect={() => onGoTo(index)}
          />
        ))}
      </div>
      <button
        type="button"
        className="pw-proposal-nav-arrow"
        aria-label="Next proposal page"
        onClick={onNext}
      >
        ›
      </button>
    </div>
  );
}
