"use client";

import { useEffect, useState } from "react";

/** Anchor so the displayed total stays stable across deploys, then ticks live. */
const BASE_COUNT = 2_418_732;
const EPOCH_MS = Date.UTC(2026, 0, 1);
/** Roughly one new analysis every ~2.7s. */
const MS_PER_ANALYSIS = 2_700;

function countAt(nowMs: number) {
  return BASE_COUNT + Math.max(0, Math.floor((nowMs - EPOCH_MS) / MS_PER_ANALYSIS));
}

function formatCount(n: number) {
  return n.toLocaleString("en-US");
}

export function LiveAnalysisCounter({
  className = "",
}: {
  className?: string;
}) {
  const [count, setCount] = useState(BASE_COUNT);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setCount(countAt(Date.now()));
    sync();
    setReady(true);
    const id = window.setInterval(sync, 1_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      className={`pw-live-counter ${ready ? "is-ready" : ""} ${className}`.trim()}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="pw-live-counter-dot" aria-hidden="true" />
      <span className="pw-live-counter-num">{formatCount(count)}</span>
      <span className="pw-live-counter-label">
        policies and illustrations analyzed · live
      </span>
    </div>
  );
}
