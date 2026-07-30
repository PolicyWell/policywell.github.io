"use client";

import Link from "next/link";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";
import { IndustriesMegaMenu } from "@/components/IndustriesMegaMenu";
import { ThemeToggle } from "@/components/ThemeToggle";

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

const PLATFORM_LINKS = [
  {
    href: "/platform/",
    label: "Overview",
    blurb: "AI insurance intelligence platform hub",
  },
  {
    href: "/product/",
    label: "Product",
    blurb: "Interactive 3-minute product tour",
  },
  { href: "/demo/", label: "Demo", blurb: "Walk through the product lifecycle" },
  { href: "/agent", label: "Agent", blurb: "Insurance intelligence workspace" },
] as const;

const FINANCIAL_PRODUCT_LINKS = [
  {
    href: "/financial-products/",
    label: "Overview",
    blurb: "Life insurance and annuity products",
  },
  {
    href: "/life-insurance/",
    label: "Life Insurance",
    blurb: "Term, whole life, and indexed universal life",
  },
  {
    href: "/annuities/",
    label: "Annuities",
    blurb: "Variable, FIA, fixed, and immediate designs",
  },
] as const;

const COMPANY_LINKS = [
  {
    href: "/about/",
    label: "About",
    blurb: "Mission, locations, and company story",
  },
  {
    href: "/contact/",
    label: "Contact",
    blurb: "Email, phone, quotes, and discovery calls",
  },
  {
    href: "/docs/",
    label: "Documentation",
    blurb: "Guides, API reference, and engineering notes",
  },
  {
    href: "/api/",
    label: "API",
    blurb: "Insurance intelligence for developers",
  },
  {
    href: "/press/",
    label: "Press",
    blurb: "News, media kit, and press contact",
  },
  {
    href: "/careers/",
    label: "Careers",
    blurb: "How we hire and how to apply",
  },
] as const;

function NavCaret({ open }: { open: boolean }) {
  return (
    <svg
      className={`pw-industries-caret${open ? " is-flipped" : ""}`}
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
  );
}

/**
 * Viewport-fixed menu placement so panels aren't clipped by overflow-x-clip
 * ancestors (html/body/page shells) the way absolute panels were.
 */
function useFixedMenuStyle(
  open: boolean,
  rootRef: RefObject<HTMLElement | null>,
  alignEnd: boolean,
): CSSProperties | undefined {
  const [style, setStyle] = useState<CSSProperties | undefined>(undefined);

  useLayoutEffect(() => {
    if (!open) {
      setStyle(undefined);
      return;
    }

    function place() {
      const el = rootRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const gap = 10;
      const width = Math.max(240, rect.width);
      const next: CSSProperties = {
        position: "fixed",
        top: Math.round(rect.bottom + gap),
        minWidth: width,
        zIndex: 80,
      };
      if (alignEnd) {
        next.right = Math.max(8, Math.round(window.innerWidth - rect.right));
        next.left = "auto";
      } else {
        next.left = Math.max(8, Math.round(rect.left));
        next.right = "auto";
      }
      setStyle(next);
    }

    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, rootRef, alignEnd]);

  return style;
}

function useOutsideDismiss(
  open: boolean,
  rootRef: RefObject<HTMLElement | null>,
  onOpenChange: (open: boolean) => void,
  enabled: boolean,
) {
  useEffect(() => {
    if (!open || !enabled) return;
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
  }, [open, onOpenChange, rootRef, enabled]);
}

function PlatformMenu({
  open,
  onOpenChange,
  onNavigate,
  variant = "desktop",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate?: () => void;
  variant?: "desktop" | "mobile";
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelStyle = useFixedMenuStyle(open, rootRef, false);
  useOutsideDismiss(open, rootRef, onOpenChange, variant === "desktop");

  if (variant === "mobile") {
    return (
      <div className="pw-platform-mobile">
        <button
          type="button"
          className={`pw-mobile-tab${open ? " is-open" : ""}`}
          aria-expanded={open}
          onClick={() => onOpenChange(!open)}
        >
          <span>Platform</span>
          <NavCaret open={open} />
        </button>
        {open && (
          <div className="pw-mobile-tab-panel">
            {PLATFORM_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="pw-mobile-tab-link"
                onClick={onNavigate}
              >
                <span className="block font-medium text-pine">{l.label}</span>
                <span className="block text-xs text-stone mt-0.5">{l.blurb}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="pw-platform-root" ref={rootRef}>
      <button
        type="button"
        className={`pw-industries-trigger${open ? " is-open" : ""}`}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => onOpenChange(!open)}
      >
        Platform
        <NavCaret open={open} />
      </button>
      {open && panelStyle ? (
        <div
          className="pw-platform-panel"
          role="menu"
          aria-label="Platform"
          style={panelStyle}
        >
          {PLATFORM_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              role="menuitem"
              className="pw-platform-item"
              onClick={() => {
                onOpenChange(false);
                onNavigate?.();
              }}
            >
              <span className="pw-platform-item-label">{l.label}</span>
              <span className="pw-platform-item-blurb">{l.blurb}</span>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function FinancialProductsMenu({
  open,
  onOpenChange,
  onNavigate,
  variant = "desktop",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate?: () => void;
  variant?: "desktop" | "mobile";
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelStyle = useFixedMenuStyle(open, rootRef, true);
  useOutsideDismiss(open, rootRef, onOpenChange, variant === "desktop");

  if (variant === "mobile") {
    return (
      <div className="pw-platform-mobile">
        <button
          type="button"
          className={`pw-mobile-tab${open ? " is-open" : ""}`}
          aria-expanded={open}
          onClick={() => onOpenChange(!open)}
        >
          <span>Financial Products</span>
          <NavCaret open={open} />
        </button>
        {open && (
          <div className="pw-mobile-tab-panel">
            {FINANCIAL_PRODUCT_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="pw-mobile-tab-link"
                onClick={onNavigate}
              >
                <span className="block font-medium text-pine">{l.label}</span>
                <span className="block text-xs text-stone mt-0.5">{l.blurb}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="pw-platform-root is-align-end" ref={rootRef}>
      <button
        type="button"
        className={`pw-industries-trigger${open ? " is-open" : ""}`}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => onOpenChange(!open)}
      >
        Financial Products
        <NavCaret open={open} />
      </button>
      {open && panelStyle ? (
        <div
          className="pw-platform-panel"
          role="menu"
          aria-label="Financial Products"
          style={panelStyle}
        >
          {FINANCIAL_PRODUCT_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              role="menuitem"
              className="pw-platform-item"
              onClick={() => {
                onOpenChange(false);
                onNavigate?.();
              }}
            >
              <span className="pw-platform-item-label">{l.label}</span>
              <span className="pw-platform-item-blurb">{l.blurb}</span>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function CompanyMenu({
  open,
  onOpenChange,
  onNavigate,
  variant = "desktop",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate?: () => void;
  variant?: "desktop" | "mobile";
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelStyle = useFixedMenuStyle(open, rootRef, true);
  useOutsideDismiss(open, rootRef, onOpenChange, variant === "desktop");

  if (variant === "mobile") {
    return (
      <div className="pw-platform-mobile">
        <button
          type="button"
          className={`pw-mobile-tab${open ? " is-open" : ""}`}
          aria-expanded={open}
          onClick={() => onOpenChange(!open)}
        >
          <span>Company</span>
          <NavCaret open={open} />
        </button>
        {open && (
          <div className="pw-mobile-tab-panel">
            {COMPANY_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="pw-mobile-tab-link"
                onClick={onNavigate}
              >
                <span className="block font-medium text-pine">{l.label}</span>
                <span className="block text-xs text-stone mt-0.5">{l.blurb}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="pw-platform-root is-align-end" ref={rootRef}>
      <button
        type="button"
        className={`pw-industries-trigger${open ? " is-open" : ""}`}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => onOpenChange(!open)}
      >
        Company
        <NavCaret open={open} />
      </button>
      {open && panelStyle ? (
        <div
          className="pw-platform-panel"
          role="menu"
          aria-label="Company"
          style={panelStyle}
        >
          {COMPANY_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              role="menuitem"
              className="pw-platform-item"
              onClick={() => {
                onOpenChange(false);
                onNavigate?.();
              }}
            >
              <span className="pw-platform-item-label">{l.label}</span>
              <span className="pw-platform-item-blurb">{l.blurb}</span>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [industriesOpen, setIndustriesOpen] = useState(false);
  const [platformOpen, setPlatformOpen] = useState(false);
  const [financialOpen, setFinancialOpen] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);

  useEffect(() => {
    // Phones + tablets (incl. iPad portrait): hamburger. Inline nav from 1100px up.
    const mq = window.matchMedia("(max-width: 1099px)");
    const sync = () => {
      setIsMobile(mq.matches);
      if (!mq.matches) setOpen(false);
      else {
        setIndustriesOpen(false);
        setPlatformOpen(false);
        setFinancialOpen(false);
        setCompanyOpen(false);
      }
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

  useEffect(() => {
    // Always reset nested accordions when the drawer opens or closes so
    // dropdowns never auto-expand on mobile.
    setPlatformOpen(false);
    setIndustriesOpen(false);
    setFinancialOpen(false);
    setCompanyOpen(false);
  }, [open]);

  const links = [{ href: "/pricing/", label: "Pricing" }];

  function closeMenus() {
    setIndustriesOpen(false);
    setPlatformOpen(false);
    setFinancialOpen(false);
    setCompanyOpen(false);
  }

  function openOnly(
    which: "platform" | "industries" | "financial" | "company",
    next: boolean,
  ) {
    setPlatformOpen(which === "platform" ? next : false);
    setIndustriesOpen(which === "industries" ? next : false);
    setFinancialOpen(which === "financial" ? next : false);
    setCompanyOpen(which === "company" ? next : false);
  }

  return (
    <header className="pw-site-header relative z-40">
      <div className="pw-site-nav-row">
        <div className="pw-site-nav-brand">
          <BrandMark />
        </div>
        {/* Desktop / computer: inline links + Industries mega-menu */}
        {!isMobile && (
          <>
            <nav className="pw-site-nav-links" aria-label="Primary">
              <PlatformMenu
                open={platformOpen}
                onOpenChange={(next) => openOnly("platform", next)}
              />
              <IndustriesMegaMenu
                open={industriesOpen}
                onOpenChange={(next) => openOnly("industries", next)}
              />
              <FinancialProductsMenu
                open={financialOpen}
                onOpenChange={(next) => openOnly("financial", next)}
              />
              <CompanyMenu
                open={companyOpen}
                onOpenChange={(next) => openOnly("company", next)}
              />
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="pw-site-nav-link"
                  onClick={closeMenus}
                >
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
              <Link
                href="/quote/#contact"
                className="pw-btn pw-nav-cta"
                onClick={closeMenus}
              >
                Get a Quote
              </Link>
              <Link
                href="/login"
                className="pw-btn pw-btn-secondary pw-nav-cta"
                onClick={closeMenus}
              >
                Sign in
              </Link>
              <ThemeToggle compact className="pw-nav-theme" />
              <span className="pw-nav-version" aria-label="Version 0.1">
                v0.1
              </span>
            </div>
          </>
        )}
        {/* Mobile only - not rendered on computer viewports */}
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
        >
          <PlatformMenu
            open={platformOpen}
            onOpenChange={(next) => openOnly("platform", next)}
            onNavigate={() => setOpen(false)}
            variant="mobile"
          />
          <IndustriesMegaMenu
            open={industriesOpen}
            onOpenChange={(next) => openOnly("industries", next)}
            onNavigate={() => setOpen(false)}
            variant="mobile"
          />
          <FinancialProductsMenu
            open={financialOpen}
            onOpenChange={(next) => openOnly("financial", next)}
            onNavigate={() => setOpen(false)}
            variant="mobile"
          />
          <CompanyMenu
            open={companyOpen}
            onOpenChange={(next) => openOnly("company", next)}
            onNavigate={() => setOpen(false)}
            variant="mobile"
          />
          {links.map((l) => (
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
          <div className="mt-3 px-1">
            <ThemeToggle className="w-full justify-center" />
          </div>
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
    { href: "/upload", label: "The Well" },
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
          <div className="flex items-center gap-2 shrink-0">
            {role && (
              <span className="text-[10px] sm:text-xs uppercase tracking-wider text-moss">
                {role}
              </span>
            )}
            <ThemeToggle compact />
          </div>
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
