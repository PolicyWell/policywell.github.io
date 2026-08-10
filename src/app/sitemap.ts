import type { MetadataRoute } from "next";
import { API_GROUPS } from "@/lib/api-reference-data";
import { DOCS_USE_CASES } from "@/lib/docs-data";
import { INDUSTRY_PAGES } from "@/lib/industry-pages-data";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-static";

/**
 * Indexable public paths only.
 *
 * /docs, /demo, /product, /platform, /deck, /agent, /api are private
 * (request-access / access-code gated) and intentionally omitted.
 * Segmented helpers keep future sitemap indexes easy
 * (core / commercial / life / annuities / industries)
 * without emitting multiple files until URL volume requires it.
 */

function corePaths(): string[] {
  return [
    "/",
    "/industries",
    "/pricing",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    "/quote",
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

/** @deprecated Docs are private — kept so segmented helpers stay referenced. */
function docsGuidePaths(): string[] {
  void DOCS_USE_CASES;
  return [];
}

/** @deprecated Docs are private — kept so segmented helpers stay referenced. */
function docsApiPaths(): string[] {
  void API_GROUPS;
  return [];
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
 * Excludes: private apps, deck, agent, commercial workspace, /docs,
 * legacy /industries/ecommerce/* aliases, redirects.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  // Keep segmented builders referenced so future split stays trivial.
  void financialProductPaths;
  void commercialIndustryPaths;
  void docsGuidePaths;
  void docsApiPaths;

  const paths = dedupe([...corePaths(), ...industryPaths()]);

  // Omit lastModified — no trustworthy per-page content dates available.
  // Do not emit changefreq or priority.
  return paths.map((path) => ({
    url: absoluteUrl(path),
  }));
}
