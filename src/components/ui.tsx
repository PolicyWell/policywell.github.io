"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function BrandMark({ large = false }: { large?: boolean }) {
  const iconSize = large ? 48 : 32;
  return (
    <Link href="/" className="inline-flex items-center gap-2.5 shrink-0">
      {/* Transparent 2× PNG keeps the nav mark sharp on retina */}
      <img
        src="/logo-64.png?v=20260727d"
        alt="PolicyWell"
        width={iconSize}
        height={iconSize}
        className={`shrink-0 object-contain ${large ? "h-12 w-12" : "h-8 w-8"}`}
        decoding="async"
      />
      <span
        className={`font-display text-pine tracking-tight ${
          large ? "text-4xl md:text-6xl" : "text-xl"
        }`}
      >
        PolicyWell
      </span>
    </Link>
  );
}

const PHONE_DISPLAY = "(470) 887-0449";
const PHONE_HREF = "tel:+14708870449";

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const primaryLinks = [
    { href: "/platform/", label: "Platform" },
    { href: "/industries/", label: "Industries" },
    { href: "/pricing/", label: "Pricing" },
    { href: "/docs/", label: "Docs" },
    { href: "/demo/", label: "Demo" },
    { href: "/api/", label: "API" },
    { href: "/about/", label: "About" },
    { href: "/contact/", label: "Contact" },
  ] as const;

  useEffect(() => {
    // Phones + tablets (incl. iPad portrait): hamburger. Inline nav from 1100px up.
    const mq = window.matchMedia("(max-width: 1099px)");
    const sync = () => {
      setIsMobile(mq.matches);
      if (!mq.matches) setOpen(false);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="pw-site-header relative z-40">
      <div className="pw-site-nav-row">
        <div className="pw-site-nav-brand">
          <BrandMark />
        </div>
        {!isMobile && (
          <>
            <nav className="pw-site-nav-links" aria-label="Primary">
              {primaryLinks.map((l) => (
                <Link key={l.href} href={l.href} className="pw-site-nav-link">
                  {l.label}
                </Link>
              ))}
            </nav>
            <div className="pw-site-nav-actions">
              <a href={PHONE_HREF} className="pw-nav-phone">
                <svg
                  className="pw-nav-phone-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M6.5 4.5h3l1.5 4-2 1.2a12 12 0 0 0 5.3 5.3l1.2-2 4 1.5v3A2 2 0 0 1 17.5 19 13.5 13.5 0 0 1 4 5.5a2 2 0 0 1 2.5-1z" />
                </svg>
                {PHONE_DISPLAY}
              </a>
              <Link href="/quote/#contact" className="pw-btn pw-nav-cta">
                Get a Quote
              </Link>
              <Link
                href="/login"
                className="pw-btn pw-btn-secondary pw-nav-cta"
              >
                Sign in
              </Link>
              <span className="pw-nav-version" aria-label="Version 0.1">
                v0.1
              </span>
            </div>
          </>
        )}
        {isMobile && (
          <button
            type="button"
            className="pw-nav-toggle"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              aria-hidden
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              {open ? (
                <>
                  <path d="M6 6l12 12" />
                  <path d="M18 6L6 18" />
                </>
              ) : (
                <>
                  <path d="M4 7h16" />
                  <path d="M4 12h16" />
                  <path d="M4 17h16" />
                </>
              )}
            </svg>
          </button>
        )}
      </div>

      {isMobile && open && (
        <nav
          id="mobile-nav"
          className="pw-site-nav-mobile mt-4 flex flex-col gap-1 rounded-[var(--radius)] border border-pine/10 bg-foam/95 p-3 shadow-[var(--shadow-soft)] max-h-[min(80vh,640px)] overflow-y-auto"
          aria-label="Primary"
        >
          {primaryLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-3 py-3 rounded-xl text-stone hover:text-pine hover:bg-pine/5"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <a
            href={PHONE_HREF}
            className="px-3 py-3 rounded-xl text-stone hover:text-pine hover:bg-pine/5"
          >
            {PHONE_DISPLAY}
          </a>
          <Link
            href="/quote/#contact"
            className="pw-btn mt-2 text-center"
            onClick={() => setOpen(false)}
          >
            Get a Quote
          </Link>
          <Link
            href="/login"
            className="pw-btn pw-btn-secondary mt-2 text-center"
            onClick={() => setOpen(false)}
          >
            Sign in
          </Link>
          <p className="pw-nav-version pw-nav-version-mobile">v0.1</p>
        </nav>
      )}
    </header>
  );
}

export function AppNav({ role }: { role?: string }) {
  const links = [
    { href: "/agent", label: "Agent" },
    { href: "/docs", label: "Docs" },
    { href: "/workspace", label: "Workspace" },
    { href: "/commercial", label: "Commercial" },
    { href: "/onboarding", label: "Onboarding" },
    { href: "/profile", label: "Profile" },
    { href: "/upload", label: "Upload" },
    { href: "/compare", label: "Compare" },
    { href: "/tasks", label: "Tasks" },
    { href: "/report", label: "Report" },
  ];
  if (role === "advisor" || role === "imo") {
    links.unshift({ href: "/clients", label: "Clients" });
  }
  if (role === "imo") {
    links.unshift({ href: "/imo", label: "IMO dashboard" });
  }
  if (role === "broker_dealer" || role === "imo") {
    links.unshift({ href: "/firm", label: "Firm" });
  }
  if (role === "carrier") {
    links.push({ href: "/carrier", label: "Carrier console" });
  }
  return (
    <header className="border-b border-pine/10 bg-foam/70 backdrop-blur-md sticky top-0 z-20">
      <div className="pw-shell flex flex-col gap-2 py-3 md:py-4">
        <div className="flex items-center justify-between gap-3">
          <BrandMark />
          {role && (
            <span className="text-[10px] sm:text-xs uppercase tracking-wider text-moss shrink-0">
              {role}
            </span>
          )}
        </div>
        <nav className="flex items-center gap-1 text-sm overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-3 py-1.5 rounded-full text-stone hover:text-pine hover:bg-pine/5 transition-colors whitespace-nowrap shrink-0"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function ConfidenceBadge({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const tone =
    pct >= 80
      ? "text-ok bg-ok/10"
      : pct >= 50
        ? "text-amber bg-amber/15"
        : "text-danger bg-danger/10";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${tone}`}
    >
      Confidence {pct}%
    </span>
  );
}

export function MissingList({ fields }: { fields: string[] }) {
  if (!fields.length) {
    return <p className="text-sm text-ok">No critical gaps highlighted.</p>;
  }
  return (
    <ul className="flex flex-wrap gap-2">
      {fields.map((f) => (
        <li
          key={f}
          className="text-xs px-2.5 py-1 rounded-full bg-danger/10 text-danger"
        >
          Missing: {f}
        </li>
      ))}
    </ul>
  );
}
