"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

function formatCount(n: number) {
  return n.toLocaleString("en-US");
}

/**
 * Hero live counter backed by public.site_stats (refreshed when documents are fed).
 * Uses an initial fetch + Realtime subscription, with a light poll fallback.
 */
export function LiveAnalysisCounter({
  className = "",
}: {
  className?: string;
}) {
  const [count, setCount] = useState<number | null>(null);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    if (!configured) {
      setCount(0);
      return;
    }

    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setCount(0);
      return;
    }

    let cancelled = false;

    async function load() {
      const { data, error } = await supabase!
        .from("site_stats")
        .select("analyzed_count")
        .eq("id", 1)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        setCount(0);
        return;
      }
      setCount(Number(data?.analyzed_count ?? 0));
    }

    void load();

    const channel = supabase
      .channel("hero-site-stats")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "site_stats",
          filter: "id=eq.1",
        },
        (payload) => {
          const next = (payload.new as { analyzed_count?: number } | null)
            ?.analyzed_count;
          if (typeof next === "number" && Number.isFinite(next)) {
            setCount(next);
            return;
          }
          void load();
        },
      )
      .subscribe();

    const poll = window.setInterval(() => {
      void load();
    }, 20_000);

    return () => {
      cancelled = true;
      window.clearInterval(poll);
      void supabase.removeChannel(channel);
    };
  }, [configured]);

  const ready = count !== null;

  return (
    <div
      className={`pw-live-counter ${ready ? "is-ready" : ""} ${className}`.trim()}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="pw-live-counter-dot" aria-hidden="true" />
      <span className="pw-live-counter-num">
        {ready ? formatCount(count) : "—"}
      </span>
      <span className="pw-live-counter-label">
        Policies and Illustrations Analyzed • Live
      </span>
    </div>
  );
}
