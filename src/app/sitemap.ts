import type { MetadataRoute } from "next";
import { API_GROUPS } from "@/lib/api-reference-data";
import { DOCS_USE_CASES } from "@/lib/docs-data";
import { INDUSTRY_PAGES } from "@/lib/industry-pages-data";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-static";

/**
 * Indexable public paths only.
 *
 * Segmented helpers keep future sitemap indexes easy
 * (core / commercial / life / annuities / industries / docs / api)
 * without emitting multiple files until URL volume requires it.
 */

function corePaths(): string[] {
  return [
    "/",
    "/pricing",
    "/quote",
    "/industries",
    "/docs",
    "/docs/api",
    "/docs/api/reference",
    "/docs/cli",
    "/docs/engineering",
    "/demo",
    "/book-a-call",
    "/press",
    "/careers",
  ];
}

function industryPaths(): string[] {
  return INDUSTRY_PAGES.map((page) => page.path);
}

function financialProductPaths(): string[] {
  return INDUSTRY_PAGES.filter((p) => p.categoryId === "financial-products").map(
    (p) => p.path,
  );
}

function commercialIndustryPaths(): string[] {
  return INDUSTRY_PAGES.filter(
    (p) => p.categoryId !== "financial-products",
  ).map((p) => p.path);
}

/** Guides with public, non-placeholder content only (exclude Planned). */
function docsGuidePaths(): string[] {
  return DOCS_USE_CASES.filter((useCase) => useCase.status !== "Planned").map(
    (useCase) => `/docs/guides/${useCase.slug}`,
  );
}

/** API group pages with non-placeholder contracts only. */
function docsApiPaths(): string[] {
  return API_GROUPS.filter((group) => group.status !== "Planned").map(
    (group) => `/docs/api/${group.slug}`,
  );
}

function dedupe(paths: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const path of paths) {
    const key = absoluteUrl(path);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(path);
  }
  return out.sort((a, b) => absoluteUrl(a).localeCompare(absoluteUrl(b)));
}

/**
 * Single sitemap for current URL count.
 * Excludes: private apps, deck, agent, commercial workspace, legacy
 * /industries/ecommerce/* aliases, Planned docs, redirects.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  // Keep segmented builders referenced so future split stays trivial.
  void financialProductPaths;
  void commercialIndustryPaths;

  const paths = dedupe([
    ...corePaths(),
    ...industryPaths(),
    ...docsGuidePaths(),
    ...docsApiPaths(),
  ]);

  // Omit lastModified — no trustworthy per-page content dates available.
  // Do not emit changefreq or priority.
  return paths.map((path) => ({
    url: absoluteUrl(path),
  }));
}
