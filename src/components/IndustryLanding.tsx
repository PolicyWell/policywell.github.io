"use client";

import Link from "next/link";
import { IndustryPhotoStage } from "@/components/IndustryPhotoStage";
import { SiteNav } from "@/components/ui";
import {
  getIndustryChildren,
  getIndustryPage,
  industryHref,
} from "@/lib/industry-pages-data";
import {
  INDUSTRY_CATEGORIES,
  industryCategoryHref,
  industryQuoteHref,
} from "@/lib/industries-nav";

const PHONE_DISPLAY = "(470) 887-0449";
const PHONE_HREF = "tel:+14708870449";

export function IndustryLanding({ path }: { path: string }) {
  const page = getIndustryPage(path);
  if (!page) return null;

  const children = getIndustryChildren(page.path);
  const parent = page.parentPath ? getIndustryPage(page.parentPath) : null;
  const grandparent = parent?.parentPath
    ? getIndustryPage(parent.parentPath)
    : null;
  const siblings = parent ? getIndustryChildren(parent.path) : [];
  const isLeaf = children.length === 0;
  /** Standalone hubs (Retail, Bar, Catering) have no children or siblings. */
  const isStandaloneHub = children.length === 0 && !parent;
  const isAnnuity = page.categoryId === "annuities";
  const primaryCtaLabel = isAnnuity ? "Get Illustration" : "Get a quote";

  /** Hub pages browse their children; micro pages browse sibling verticals. */
  const nestItems = children.length > 0 ? children : siblings;
  const nestLabel = children.length > 0 ? page.label : (parent?.label ?? page.label);
  const nestIntro =
    children.length > 0
      ? "Open a nested vertical for coverage built around that niche."
      : `More ${nestLabel.toLowerCase()} verticals in this industry.`;

  const industryCatalog = INDUSTRY_CATEGORIES.map((category) => ({
    id: category.id,
    label: category.label,
    href: industryCategoryHref(category.id),
    active: category.id === page.categoryId,
  }));

  return (
    <div className="flex-1 flex flex-col min-w-0 w-full overflow-x-clip">
      <SiteNav />
      <main className="pw-industry-page">
        <section
          className={`pw-industry-hero pw-industry-hero-scene${page.hero ? "" : " pw-industry-hero-no-photo"}`}
        >
          <div
            className={`pw-shell${page.hero ? " pw-industry-hero-stack" : " pw-industry-hero-grid"}`}
          >
            <div className="pw-industry-hero-copy animate-rise">
              <p className="pw-industry-eyebrow">
                <Link href="/industries/">Industries</Link>
                {grandparent ? (
                  <>
                    <span aria-hidden> / </span>
                    <Link href={industryHref(grandparent.path)}>
                      {grandparent.label}
                    </Link>
                  </>
                ) : null}
                {parent ? (
                  <>
                    <span aria-hidden> / </span>
                    <Link href={industryHref(parent.path)}>{parent.label}</Link>
                    <span aria-hidden> / </span>
                    <span>{page.label}</span>
                  </>
                ) : (
                  <>
                    <span aria-hidden> / </span>
                    <span>{page.label}</span>
                  </>
                )}
              </p>
              <h1 className="font-display text-pine">{page.headline}</h1>
              <p className="pw-industry-support">{page.support}</p>
              <div className="pw-industry-hero-actions">
                <Link href={industryQuoteHref(page.label)} className="pw-btn">
                  {primaryCtaLabel}
                </Link>
                {isStandaloneHub && (
                  <Link href="/industries/" className="pw-btn">
                    ← All industries
                  </Link>
                )}
              </div>
              {isLeaf && (
                <p className="pw-industry-hero-meta">
                  <Link href={industryQuoteHref(page.label)}>
                    Free coverage review
                  </Link>
                  <span aria-hidden> · </span>
                  <a href={PHONE_HREF}>{PHONE_DISPLAY}</a>
                </p>
              )}
            </div>

            {page.hero && (
              <div className="pw-industry-hero-stage pw-industry-hero-stage-frame animate-rise-delay-2">
                <IndustryPhotoStage
                  slug={page.path.split("/").pop()!.replace(/-insurance$/, "")}
                  label={page.label}
                  src={`/industries/heroes/${page.hero}.webp`}
                />
              </div>
            )}
          </div>
        </section>

        {nestItems.length > 0 && (
          <section className="pw-industry-child-grid">
            <div className="pw-shell">
              <div className="pw-industry-child-grid-head">
                <h2 className="font-display text-pine">Browse {nestLabel}</h2>
                <p>{nestIntro}</p>
              </div>
              <ul className="pw-industry-child-list">
                {nestItems.map((item) => {
                  const active = item.path === page.path;
                  return (
                    <li key={item.path}>
                      <Link
                        href={industryHref(item.path)}
                        className={`pw-industry-child-link${active ? " is-active" : ""}`}
                        aria-current={active ? "page" : undefined}
                      >
                        <span>{item.label}</span>
                        <span aria-hidden>→</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        )}

        {isStandaloneHub && (
          <section className="pw-industry-child-grid">
            <div className="pw-shell">
              <div className="pw-industry-child-grid-head">
                <h2 className="font-display text-pine">Browse Industries</h2>
                <p>
                  Back to the main Industries tab — open any vertical we cover.
                </p>
              </div>
              <ul className="pw-industry-child-list">
                <li>
                  <Link href="/industries/" className="pw-industry-child-link">
                    <span>All industries</span>
                    <span aria-hidden>→</span>
                  </Link>
                </li>
                {industryCatalog.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className={`pw-industry-child-link${item.active ? " is-active" : ""}`}
                      aria-current={item.active ? "page" : undefined}
                    >
                      <span>{item.label}</span>
                      <span aria-hidden>→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
