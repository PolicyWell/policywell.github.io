"use client";

import { useRef, useState } from "react";

const DECK_PDF = "/PolicyWell-Pitch-Deck.pdf";

/** 12-page 16:9 pitch deck rendered to full-width slides for mobile. */
export const DECK_SLIDES = Array.from({ length: 12 }, (_, i) => {
  const n = String(i + 1).padStart(2, "0");
  return {
    src: `/deck/slides/slide-${n}.png`,
    alt: `PolicyWell pitch deck - slide ${i + 1} of 12`,
  };
});

export function DeckViewer({
  compact = false,
}: {
  /** Home preview: first few slides + CTA; full page shows all. */
  compact?: boolean;
}) {
  const slides = compact ? DECK_SLIDES.slice(0, 3) : DECK_SLIDES;
  const [index, setIndex] = useState(0);
  const touchX = useRef<number | null>(null);
  const current = slides[index] ?? slides[0];

  function prev() {
    setIndex((i) => Math.max(0, i - 1));
  }
  function next() {
    setIndex((i) => Math.min(slides.length - 1, i + 1));
  }

  return (
    <div className="space-y-4">
      <div className="pw-deck-frame">
        <div
          className="pw-deck-slide"
          onTouchStart={(e) => {
            touchX.current = e.changedTouches[0]?.clientX ?? null;
          }}
          onTouchEnd={(e) => {
            if (touchX.current == null) return;
            const dx = (e.changedTouches[0]?.clientX ?? touchX.current) - touchX.current;
            touchX.current = null;
            if (Math.abs(dx) < 40) return;
            if (dx < 0) next();
            else prev();
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current.src}
            alt={current.alt}
            width={1600}
            height={900}
            decoding="async"
            draggable={false}
          />
        </div>

        <div className="pw-deck-controls">
          <button
            type="button"
            className="pw-deck-btn"
            onClick={prev}
            disabled={index === 0}
            aria-label="Previous slide"
          >
            Prev
          </button>
          <span className="pw-deck-count">
            {index + 1} / {slides.length}
            {compact ? " · preview" : ""}
          </span>
          <button
            type="button"
            className="pw-deck-btn"
            onClick={next}
            disabled={index === slides.length - 1}
            aria-label="Next slide"
          >
            Next
          </button>
        </div>
      </div>

      {/* Full-slide stack for scroll reading - always fully visible on mobile */}
      <details className="pw-deck-stack md:hidden">
        <summary className="cursor-pointer text-sm text-moss py-2">
          Scroll all slides
        </summary>
        <ol className="space-y-4 mt-3">
          {slides.map((s, i) => (
            <li key={s.src}>
              <div className="pw-deck-slide">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.src}
                  alt={s.alt}
                  width={1600}
                  height={900}
                  loading={i < 2 ? "eager" : "lazy"}
                  decoding="async"
                />
              </div>
              <p className="text-[11px] text-stone text-center py-1.5">
                Slide {i + 1}
              </p>
            </li>
          ))}
        </ol>
      </details>

      <div className="flex flex-wrap gap-2 text-sm">
        <a
          href={DECK_PDF}
          target="_blank"
          rel="noopener noreferrer"
          className="pw-btn pw-btn-secondary !py-2 !px-3 text-xs"
        >
          Open PDF
        </a>
        <a
          href={DECK_PDF}
          download="PolicyWell-Pitch-Deck.pdf"
          className="pw-btn pw-btn-secondary !py-2 !px-3 text-xs"
        >
          Download PDF
        </a>
      </div>
    </div>
  );
}
