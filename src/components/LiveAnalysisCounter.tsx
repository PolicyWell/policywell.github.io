"use client";

import { useEffect, useState } from "react";
import { formatAnalyzedCounter } from "@/lib/v1/ingestion-stats";

type StatsPayload = {
  documents: {
    uploaded: number;
    successfullyIngested: number;
  };
  ingestions: {
    queued: number;
    processing: number;
    completed: number;
    failed: number;
  };
  updatedAt: string;
};

type LoadState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; stats: StatsPayload };

const POLL_MS = 4000;

async function fetchStats(): Promise<StatsPayload> {
  const res = await fetch("/api/v1/ingestions/stats/", {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`stats ${res.status}`);
  }
  return (await res.json()) as StatsPayload;
}

/**
 * Live homepage counter — prefers GET /api/v1/ingestions/stats when available.
 */
export function LiveAnalysisCounter({
  className = "",
}: {
  className?: string;
}) {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function tick() {
      try {
        const stats = await fetchStats();
        if (!cancelled) setState({ status: "ready", stats });
      } catch {
        if (!cancelled) {
          setState((prev) =>
            prev.status === "ready" ? prev : { status: "error" },
          );
        }
      } finally {
        if (!cancelled) {
          timer = setTimeout(tick, POLL_MS);
        }
      }
    }

    void tick();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, []);

  if (state.status === "error") {
    return (
      <div
        className={`pw-live-counter is-ready ${className}`.trim()}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <span className="pw-live-counter-dot" aria-hidden="true" />
        <span className="pw-live-counter-num">—</span>
        <span className="pw-live-counter-label">
          Policies and Illustrations Analyzed • Live
        </span>
      </div>
    );
  }

  if (state.status === "loading") {
    return (
      <div
        className={`pw-live-counter ${className}`.trim()}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <span className="pw-live-counter-dot" aria-hidden="true" />
        <span className="pw-live-counter-num" style={{ minWidth: "1.5ch" }}>
          {"\u00a0"}
        </span>
        <span className="pw-live-counter-label">Loading analysis count…</span>
      </div>
    );
  }

  const active =
    state.stats.ingestions.queued + state.stats.ingestions.processing;
  if (active > 0) {
    return (
      <div
        className={`pw-live-counter is-ready ${className}`.trim()}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <span className="pw-live-counter-dot" aria-hidden="true" />
        <span className="pw-live-counter-num">…</span>
        <span className="pw-live-counter-label">Analyzing…</span>
      </div>
    );
  }

  const display = formatAnalyzedCounter(
    state.stats.documents.successfullyIngested,
  );

  return (
    <div
      className={`pw-live-counter is-ready ${className}`.trim()}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="pw-live-counter-dot" aria-hidden="true" />
      <span className="pw-live-counter-num">{display.numberText}</span>
      <span className="pw-live-counter-label">
        Policies and Illustrations Analyzed • Live
      </span>
    </div>
  );
}
