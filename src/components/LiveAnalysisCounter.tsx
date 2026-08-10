"use client";

import { useEffect, useState } from "react";

function formatCount(n: number) {
  return n.toLocaleString("en-US");
}

/** Placeholder seed until site_stats is wired on production again. */
const PLACEHOLDER_START = 2_847;

/**
 * Hero “live” counter — temporary client-side ticker.
 * Replaces Supabase site_stats until production env/deploy can serve real counts.
 */
export function LiveAnalysisCounter({
  className = "",
}: {
  className?: string;
}) {
  const [count, setCount] = useState(PLACEHOLDER_START);

  useEffect(() => {
    let timeoutId = 0;

    const tick = () => {
      if (document.visibilityState === "visible") {
        const step = 1 + Math.floor(Math.random() * 3); // 1, 2, or 3
        setCount((n) => n + step);
      }
      const delayMs = 2_500 + Math.floor(Math.random() * 2_000); // ~2.5–4.5s
      timeoutId = window.setTimeout(tick, delayMs);
    };

    timeoutId = window.setTimeout(tick, 3_000);
    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <div
      className={`pw-live-counter is-ready ${className}`.trim()}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="pw-live-counter-dot" aria-hidden="true" />
      <span className="pw-live-counter-num">{formatCount(count)}</span>
      <span className="pw-live-counter-label">
        Policies and Illustrations Analyzed • Live
      </span>
    </div>
  );
}
