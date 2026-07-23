"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { BrandMark } from "@/components/ui";
import { DOCS_NAV } from "@/lib/docs-data";

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

export function DocsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/docs";
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    setOpen(false);
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
          <div className="flex items-center gap-3 min-w-0">
            <BrandMark />
            <span className="hidden sm:inline text-stone/50" aria-hidden>
              /
            </span>
            <Link
              href="/docs"
              className="hidden sm:inline text-sm font-medium text-pine truncate"
            >
              Docs
            </Link>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/demo"
              className="hidden md:inline-flex pw-btn pw-btn-secondary !py-2 !px-3 text-sm"
            >
              Experience PolicyWell
            </Link>
            <Link
              href="/login"
              className="hidden sm:inline-flex text-sm text-stone hover:text-pine transition-colors px-2"
            >
              Sign in
            </Link>
            <button
              type="button"
              className="lg:hidden pw-nav-toggle"
              aria-expanded={open}
              aria-controls={panelId}
              aria-label={open ? "Close documentation menu" : "Open documentation menu"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? "Close" : "Menu"}
            </button>
          </div>
        </div>
      </header>

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
    </div>
  );
}
