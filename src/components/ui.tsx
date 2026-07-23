"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import {
  SITE_NAV,
  SITE_PRIMARY_CTA,
  SITE_SECONDARY_CTA,
  type NavGroup,
  type NavLink,
} from "@/lib/site-nav";

export function BrandMark({ large = false }: { large?: boolean }) {
  const iconSize = large ? 48 : 32;
  return (
    <Link href="/" className="inline-flex items-center gap-2.5 min-w-0">
      <img
        src="/logo-64.png"
        alt=""
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

function NavItemLink({
  item,
  onNavigate,
  className,
}: {
  item: NavLink;
  onNavigate?: () => void;
  className?: string;
}) {
  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={onNavigate}
      >
        {item.label}
      </a>
    );
  }
  return (
    <Link href={item.href} className={className} onClick={onNavigate}>
      {item.label}
    </Link>
  );
}

function DesktopDropdown({ group }: { group: NavGroup }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  if (!group.items?.length) {
    return (
      <Link
        href={group.href ?? "/"}
        className="hover:text-pine transition-colors whitespace-nowrap"
      >
        {group.label}
      </Link>
    );
  }

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="inline-flex items-center gap-1 hover:text-pine transition-colors whitespace-nowrap bg-transparent border-0 p-0 cursor-pointer text-inherit font-inherit"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
      >
        {group.label}
        <span aria-hidden="true" className="text-[0.65rem] opacity-70">
          ▾
        </span>
      </button>
      {open && (
        <div
          id={menuId}
          role="menu"
          className="absolute left-0 top-full pt-2 z-40"
        >
          <ul className="min-w-[14rem] rounded-[var(--radius)] border border-pine/10 bg-foam/98 p-2 shadow-[var(--shadow-soft)]">
            {group.items.map((item) => (
              <li key={item.href + item.label} role="none">
                <NavItemLink
                  item={item}
                  className="block px-3 py-2.5 rounded-lg text-stone hover:text-pine hover:bg-pine/5"
                  onNavigate={() => setOpen(false)}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 768) setOpen(false);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="pw-shell py-4 md:py-6 animate-rise relative z-30">
      <div className="flex items-center justify-between gap-3">
        <BrandMark />
        <nav className="hidden md:flex items-center gap-4 text-sm text-stone">
          {SITE_NAV.map((group) => (
            <DesktopDropdown key={group.label} group={group} />
          ))}
          <Link
            href={SITE_SECONDARY_CTA.href}
            className="pw-btn pw-btn-secondary !py-2 !px-4 text-sm"
          >
            {SITE_SECONDARY_CTA.label}
          </Link>
          <Link href={SITE_PRIMARY_CTA.href} className="pw-btn !py-2 !px-4 text-sm">
            {SITE_PRIMARY_CTA.label}
          </Link>
        </nav>
        <button
          type="button"
          className="md:hidden pw-nav-toggle"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          className="md:hidden mt-4 flex flex-col gap-1 rounded-[var(--radius)] border border-pine/10 bg-foam/95 p-3 shadow-[var(--shadow-soft)]"
        >
          {SITE_NAV.map((group) => {
            if (!group.items?.length) {
              return (
                <Link
                  key={group.label}
                  href={group.href ?? "/"}
                  className="px-3 py-3 rounded-xl text-stone hover:text-pine hover:bg-pine/5"
                  onClick={() => setOpen(false)}
                >
                  {group.label}
                </Link>
              );
            }
            const isOpen = expanded === group.label;
            return (
              <div key={group.label} className="border-b border-pine/5 last:border-0 pb-1 mb-1">
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-3 py-3 rounded-xl text-stone hover:text-pine hover:bg-pine/5 bg-transparent border-0 cursor-pointer text-left font-inherit"
                  aria-expanded={isOpen}
                  onClick={() =>
                    setExpanded((v) => (v === group.label ? null : group.label))
                  }
                >
                  {group.label}
                  <span aria-hidden="true">{isOpen ? "−" : "+"}</span>
                </button>
                {isOpen && (
                  <ul className="pb-2 pl-2">
                    {group.items.map((item) => (
                      <li key={item.href + item.label}>
                        <NavItemLink
                          item={item}
                          className="block px-3 py-2.5 rounded-lg text-sm text-stone hover:text-pine hover:bg-pine/5"
                          onNavigate={() => setOpen(false)}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
          <Link
            href={SITE_SECONDARY_CTA.href}
            className="pw-btn pw-btn-secondary mt-2 text-center"
            onClick={() => setOpen(false)}
          >
            {SITE_SECONDARY_CTA.label}
          </Link>
          <Link
            href={SITE_PRIMARY_CTA.href}
            className="pw-btn text-center"
            onClick={() => setOpen(false)}
          >
            {SITE_PRIMARY_CTA.label}
          </Link>
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
