"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useMemo, useState } from "react";
import { DOCS_NAV, DOCS_USE_CASES, getUseCase } from "@/lib/docs-data";

function NavLinks({
  onNavigate,
  pathname,
}: {
  onNavigate?: () => void;
  pathname: string;
}) {
  return (
    <nav aria-label="Documentation" className="pw-docs-sidebar-nav">
      {DOCS_NAV.map((group) => (
        <div key={group.title} className="pw-docs-nav-group">
          <p className="pw-docs-nav-group-title">{group.title}</p>
          <ul className="pw-docs-nav-list">
            {group.items.map((item) => {
              const active =
                pathname === item.href ||
                pathname === `${item.href}/` ||
                (item.href !== "/docs" && pathname.startsWith(`${item.href}/`));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`pw-docs-nav-link${active ? " is-active" : ""}`}
                    aria-current={active ? "page" : undefined}
                    onClick={onNavigate}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function DocsLogo() {
  return (
    <Link href="/" className="pw-docs-logo" aria-label="PolicyWell home">
      <img
        src="/logo-64.png"
        alt=""
        width={22}
        height={22}
        className="pw-docs-logo-mark"
        decoding="async"
      />
      <span className="pw-docs-logo-text">PolicyWell</span>
    </Link>
  );
}

function useBreadcrumbs(pathname: string) {
  return useMemo(() => {
    const clean = pathname.replace(/\/$/, "") || "/docs";
    if (clean === "/docs") {
      return [
        { label: "Overview", href: "/docs" },
        { label: "Getting started", href: "/docs" },
      ];
    }
    if (clean === "/docs/cli") {
      return [
        { label: "Platform", href: "/docs" },
        { label: "CLI", href: "/docs/cli" },
      ];
    }
    if (clean === "/docs/engineering") {
      return [
        { label: "Platform", href: "/docs" },
        { label: "Engineering", href: "/docs/engineering" },
      ];
    }
    const guideMatch = clean.match(/^\/docs\/guides\/([^/]+)$/);
    if (guideMatch) {
      const useCase = getUseCase(guideMatch[1]);
      return [
        { label: "Overview", href: "/docs" },
        { label: "Common use cases", href: "/docs" },
        {
          label: useCase?.title ?? guideMatch[1],
          href: `/docs/guides/${guideMatch[1]}`,
        },
      ];
    }
    return [{ label: "Docs", href: "/docs" }];
  }, [pathname]);
}

export function DocsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/docs";
  const [open, setOpen] = useState(false);
  const [askOpen, setAskOpen] = useState(false);
  const panelId = useId();
  const crumbs = useBreadcrumbs(pathname);

  useEffect(() => {
    setOpen(false);
    setAskOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="pw-docs-app flex-1 flex flex-col min-h-0">
      <header className="pw-docs-topbar">
        <div className="pw-docs-topbar-inner">
          <DocsLogo />
          <div className="pw-docs-topbar-actions">
            <Link
              href="/docs#ask"
              className="pw-docs-icon-btn"
              aria-label="Search docs"
              onClick={(e) => {
                e.preventDefault();
                setAskOpen(true);
                document.getElementById("docs-ask-input")?.focus();
              }}
            >
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
              </svg>
            </Link>
            <Link href="/agent" className="pw-docs-icon-btn" aria-label="Ask PolicyWell">
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 3l1.2 4.4L17.5 9l-4.3 1.6L12 15l-1.2-4.4L6.5 9l4.3-1.6L12 3z" strokeLinejoin="round" />
                <path d="M18.5 14.5l.6 2.1 2.1.6-2.1.6-.6 2.1-.6-2.1-2.1-.6 2.1-.6.6-2.1z" strokeLinejoin="round" />
              </svg>
            </Link>
            <button
              type="button"
              className="pw-docs-icon-btn lg:hidden"
              aria-expanded={open}
              aria-controls={panelId}
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden fill="currentColor">
                <circle cx="12" cy="5" r="1.6" />
                <circle cx="12" cy="12" r="1.6" />
                <circle cx="12" cy="19" r="1.6" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="pw-docs-breadcrumb-bar">
        <div className="pw-docs-breadcrumb-inner">
          <button
            type="button"
            className="pw-docs-breadcrumb-menu lg:hidden"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label="Open documentation sections"
            onClick={() => setOpen(true)}
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 6h6v6H4zM14 6h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
            </svg>
          </button>
          <nav aria-label="Breadcrumb" className="pw-docs-breadcrumbs">
            {crumbs.map((crumb, i) => {
              const last = i === crumbs.length - 1;
              return (
                <span key={`${crumb.href}-${crumb.label}`} className="pw-docs-crumb">
                  {i > 0 && <span className="pw-docs-crumb-sep" aria-hidden>/</span>}
                  {last ? (
                    <span aria-current="page">{crumb.label}</span>
                  ) : (
                    <Link href={crumb.href}>{crumb.label}</Link>
                  )}
                </span>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="pw-docs-frame">
        <aside className="pw-docs-sidebar" aria-label="Docs sidebar">
          <NavLinks pathname={pathname} />
        </aside>

        {open && (
          <div
            id={panelId}
            className="pw-docs-mobile-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Documentation menu"
          >
            <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
          </div>
        )}

        <div className="pw-docs-main">{children}</div>
      </div>

      <div className={`pw-docs-ask${askOpen ? " is-open" : ""}`} id="ask">
        <form
          className="pw-docs-ask-form"
          action="/agent"
          method="get"
          onSubmit={(e) => {
            const input = e.currentTarget.elements.namedItem("q");
            if (input instanceof HTMLInputElement && !input.value.trim()) {
              e.preventDefault();
              window.location.href = "/agent";
            }
          }}
        >
          <label htmlFor="docs-ask-input" className="sr-only">
            Ask a question
          </label>
          <input
            id="docs-ask-input"
            name="q"
            type="search"
            placeholder="Ask a question..."
            className="pw-docs-ask-input"
            autoComplete="off"
            onFocus={() => setAskOpen(true)}
          />
          <button type="submit" className="pw-docs-ask-submit" aria-label="Ask PolicyWell">
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </form>
        <p className="pw-docs-ask-hint">
          Opens the AI Insurance Assistant
          {DOCS_USE_CASES.length ? ` · ${DOCS_USE_CASES.length} use cases` : ""}
        </p>
      </div>
    </div>
  );
}
