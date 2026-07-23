"use client";

/**
 * Honest running total. Starts at zero until real analysis volume is wired in.
 */
const ANALYZED_COUNT = 0;

function formatCount(n: number) {
  return n.toLocaleString("en-US");
}

export function LiveAnalysisCounter({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`pw-live-counter is-ready ${className}`.trim()}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="pw-live-counter-dot" aria-hidden="true" />
      <span className="pw-live-counter-num">{formatCount(ANALYZED_COUNT)}</span>
      <span className="pw-live-counter-label">
        Policies and Illustrations Analyzed · live
      </span>
    </div>
  );
}
