"use client";

import Link from "next/link";
import { IndustryPhotoStage } from "@/components/IndustryPhotoStage";
import { SiteNav } from "@/components/ui";
import {
  getIndustryChildren,
  getIndustryPage,
  industryHref,
} from "@/lib/industry-pages-data";
import { industryQuoteHref } from "@/lib/industries-nav";

const PHONE_DISPLAY = "(470) 887-0449";
const PHONE_HREF = "tel:+14708870449";

export function IndustryLanding({ path }: { path: string }) {
  const page = getIndustryPage(path);
  if (!page) return null;

  const children = getIndustryChildren(page.path);
  const parent = page.parentPath ? getIndustryPage(page.parentPath) : null;
  const isLeaf = children.length === 0;

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
                  Get a quote
                </Link>
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
              <div className="pw-industry-hero-stage animate-rise-delay-2">
                <IndustryPhotoStage
                  slug={page.path.split("/").pop()!.replace(/-insurance$/, "")}
                  label={page.label}
                  src={`/industries/heroes/${page.hero}.webp`}
                />
              </div>
            )}
          </div>
        </section>

        {children.length > 0 && (
          <section className="pw-industry-child-grid">
            <div className="pw-shell">
              <div className="pw-industry-child-grid-head">
                <h2 className="font-display text-pine">Browse {page.label}</h2>
                <p>Open a nested vertical for coverage built around that niche.</p>
              </div>
              <ul className="pw-industry-child-list">
                {children.map((child) => (
                  <li key={child.path}>
                    <Link
                      href={industryHref(child.path)}
                      className="pw-industry-child-link"
                    >
                      <span>{child.label}</span>
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
