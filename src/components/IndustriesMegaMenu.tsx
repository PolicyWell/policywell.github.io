"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import {
  INDUSTRY_CATEGORIES,
  INDUSTRY_SPECIALIST_NOTE,
  industryQuoteHref,
  type IndustryCategory,
} from "@/lib/industries-nav";

function IndustryIcon({
  id,
  className = "pw-industries-icon",
}: {
  id: string;
  className?: string;
}) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  switch (id) {
    case "ecommerce":
      return (
        <svg {...common}>
          <path d="M6 7h15l-1.5 9h-12z" />
          <path d="M6 7l-1-3H2" />
          <circle cx="9" cy="19" r="1" />
          <circle cx="17" cy="19" r="1" />
        </svg>
      );
    case "home-owners-associations":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.2" />
          <path d="M5 19c1.5-3.2 4-4.8 7-4.8S17.5 15.8 19 19" />
        </svg>
      );
    case "property-management":
      return (
        <svg {...common}>
          <rect x="4" y="8" width="16" height="12" rx="1.5" />
          <path d="M8 8V6a4 4 0 0 1 8 0v2" />
          <path d="M9 13h2M13 13h2M9 16h2M13 16h2" />
        </svg>
      );
    case "restaurant":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="7" />
          <circle cx="12" cy="12" r="2.5" />
          <path d="M12 5v2M12 17v2M5 12h2M17 12h2" />
        </svg>
      );
    case "grocery-store":
      return (
        <svg {...common}>
          <path d="M4 9h16l-1.2 10H5.2z" />
          <path d="M8 9V7a4 4 0 0 1 8 0v2" />
        </svg>
      );
    case "trucking":
      return (
        <svg {...common}>
          <path d="M3 15h11V8H3z" />
          <path d="M14 11h4l3 3v1h-7z" />
          <circle cx="7" cy="17.5" r="1.5" />
          <circle cx="17" cy="17.5" r="1.5" />
        </svg>
      );
    case "garage-auto":
      return (
        <svg {...common}>
          <path d="M4 11l2-5h12l2 5" />
          <path d="M3 11h18v7H3z" />
          <path d="M7 18v1M17 18v1" />
        </svg>
      );
    case "contractor":
      return (
        <svg {...common}>
          <path d="M14 5l5 5-9 9H5v-5z" />
          <path d="M12 7l5 5" />
        </svg>
      );
    case "technology":
      return (
        <svg {...common}>
          <path d="M6 16c2-5 4.5-7.5 6-7.5S16 11 18 16" />
          <path d="M8 18c1.4-3.2 2.8-4.8 4-4.8s2.6 1.6 4 4.8" />
          <circle cx="12" cy="9" r="1.2" />
        </svg>
      );
    case "retail-store":
      return (
        <svg {...common}>
          <path d="M8 8l2-4h4l2 4" />
          <path d="M7 8h10v11H7z" />
          <path d="M10 19v-5h4v5" />
        </svg>
      );
    case "bar":
      return (
        <svg {...common}>
          <path d="M8 4h8l-3 7v5h3v2H8v-2h3v-5z" />
        </svg>
      );
    case "catering":
      return (
        <svg {...common}>
          <path d="M5 11c0-3.5 3-6 7-6s7 2.5 7 6" />
          <path d="M5 11h14v2H5z" />
          <path d="M8 13v5M16 13v5M6 18h12" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="7" />
        </svg>
      );
  }
}

function Chevron({ className = "pw-industries-chevron" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

function PanelBody({
  category,
  onNavigate,
}: {
  category: IndustryCategory;
  onNavigate?: () => void;
}) {
  if (category.children.length === 0) {
    return (
      <div className="pw-industries-note">
        <p>{INDUSTRY_SPECIALIST_NOTE}</p>
        <Link
          href={industryQuoteHref(category.label)}
          className="pw-industries-note-link"
          onClick={onNavigate}
        >
          Get a quote for {category.label}
        </Link>
      </div>
    );
  }

  return (
    <ul className="pw-industries-subs">
      {category.children.map((child) => (
        <li key={child}>
          <Link
            href={industryQuoteHref(child)}
            className="pw-industries-sub"
            onClick={onNavigate}
          >
            {child}
          </Link>
        </li>
      ))}
    </ul>
  );
}

type IndustriesMegaMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Compact accordion for the mobile drawer. */
  variant?: "desktop" | "mobile";
};

export function IndustriesMegaMenu({
  open,
  onOpenChange,
  variant = "desktop",
}: IndustriesMegaMenuProps) {
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState(INDUSTRY_CATEGORIES[0].id);
  const active =
    INDUSTRY_CATEGORIES.find((c) => c.id === activeId) ?? INDUSTRY_CATEGORIES[0];

  useEffect(() => {
    if (!open || variant !== "desktop") return;

    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) onOpenChange(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onOpenChange(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onOpenChange, variant]);

  if (variant === "mobile") {
    return (
      <div className="pw-industries-mobile">
        <p className="pw-industries-mobile-label">Industries</p>
        {INDUSTRY_CATEGORIES.map((cat) => {
          const expanded = activeId === cat.id;
          return (
            <div key={cat.id} className="pw-industries-mobile-block">
              <button
                type="button"
                className={`pw-industries-rail-item${expanded ? " is-active" : ""}`}
                aria-expanded={expanded}
                onClick={() => setActiveId(expanded ? "" : cat.id)}
              >
                <span className="pw-industries-rail-main">
                  <IndustryIcon id={cat.id} />
                  <span>{cat.label}</span>
                </span>
                {cat.children.length > 0 && <Chevron />}
              </button>
              {expanded && (
                <div className="pw-industries-mobile-panel">
                  <PanelBody
                    category={cat}
                    onNavigate={() => onOpenChange(false)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="pw-industries-root" ref={rootRef}>
      <button
        type="button"
        className={`pw-industries-trigger${open ? " is-open" : ""}`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => onOpenChange(!open)}
      >
        Industries
        <svg
          className="pw-industries-caret"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          id={panelId}
          className="pw-industries-panel"
          role="dialog"
          aria-label="Industries"
        >
          <div className="pw-industries-rail" role="list">
            {INDUSTRY_CATEGORIES.map((cat) => {
              const isActive = cat.id === active.id;
              const hasChildren = cat.children.length > 0;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="listitem"
                  className={`pw-industries-rail-item${isActive ? " is-active" : ""}`}
                  onMouseEnter={() => setActiveId(cat.id)}
                  onFocus={() => setActiveId(cat.id)}
                  onClick={() => setActiveId(cat.id)}
                >
                  <span className="pw-industries-rail-main">
                    <IndustryIcon id={cat.id} />
                    <span>{cat.label}</span>
                  </span>
                  {hasChildren && <Chevron />}
                </button>
              );
            })}
          </div>
          <div className="pw-industries-detail">
            <PanelBody
              category={active}
              onNavigate={() => onOpenChange(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
