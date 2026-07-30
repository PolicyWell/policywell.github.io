"use client";

import { useEffect, useState } from "react";
import {
  applyTheme,
  getSystemTheme,
  persistTheme,
  readStoredTheme,
  type ThemeMode,
} from "@/lib/theme";

type ThemeToggleProps = {
  className?: string;
  compact?: boolean;
};

export function ThemeToggle({ className = "", compact = false }: ThemeToggleProps) {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = readStoredTheme();
    const next = stored ?? getSystemTheme();
    setTheme(next);
    applyTheme(next);
    setReady(true);

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystem = () => {
      if (readStoredTheme()) return;
      const system = mq.matches ? "dark" : "light";
      setTheme(system);
      applyTheme(system);
    };
    mq.addEventListener("change", onSystem);
    return () => mq.removeEventListener("change", onSystem);
  }, []);

  function toggle() {
    const next: ThemeMode = theme === "dark" ? "light" : "dark";
    setTheme(next);
    persistTheme(next);
  }

  const label =
    theme === "dark" ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      className={`pw-theme-toggle ${compact ? "is-compact" : ""} ${className}`.trim()}
      aria-label={label}
      title={label}
      aria-pressed={theme === "dark"}
      onClick={toggle}
      data-ready={ready ? "true" : "false"}
    >
      <span className="pw-theme-toggle-icon" aria-hidden>
        {theme === "dark" ? (
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 14.5A8.5 8.5 0 0 1 9.5 3 7 7 0 1 0 21 14.5z" />
          </svg>
        )}
      </span>
      {!compact ? (
        <span className="pw-theme-toggle-label">
          {theme === "dark" ? "Light" : "Dark"}
        </span>
      ) : null}
    </button>
  );
}
