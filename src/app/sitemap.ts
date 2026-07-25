import type { MetadataRoute } from "next";
import { API_GROUPS } from "@/lib/api-reference-data";
import { DOCS_USE_CASES } from "@/lib/docs-data";
import { ECOMMERCE_VERTICALS } from "@/lib/industries-nav";
import { INDUSTRY_PAGES } from "@/lib/industry-pages-data";

export const dynamic = "force-static";

const SITE_URL = "https://policywell.ai";

/** Prefer trailing slashes to match GitHub Pages static export. */
function loc(pathname: string): string {
  if (pathname === "/") return `${SITE_URL}/`;
  const clean = pathname.replace(/\/+$/, "");
  return `${SITE_URL}${clean.startsWith("/") ? clean : `/${clean}`}/`;
}

type Entry = {
  path: string;
  changeFrequency: NonNullable<
    MetadataRoute.Sitemap[number]["changeFrequency"]
  >;
  priority: number;
};

/** Core marketing / product pages (not already covered by INDUSTRY_PAGES). */
const CORE_PAGES: Entry[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/pricing", changeFrequency: "weekly", priority: 0.95 },
  { path: "/quote", changeFrequency: "weekly", priority: 0.95 },
  { path: "/industries", changeFrequency: "weekly", priority: 0.95 },
  { path: "/docs", changeFrequency: "weekly", priority: 0.9 },
  { path: "/docs/api", changeFrequency: "weekly", priority: 0.85 },
  { path: "/docs/api/reference", changeFrequency: "weekly", priority: 0.8 },
  { path: "/docs/cli", changeFrequency: "monthly", priority: 0.7 },
  { path: "/docs/engineering", changeFrequency: "monthly", priority: 0.7 },
  { path: "/demo", changeFrequency: "monthly", priority: 0.85 },
  { path: "/deck", changeFrequency: "monthly", priority: 0.8 },
  { path: "/agent", changeFrequency: "weekly", priority: 0.85 },
  { path: "/commercial", changeFrequency: "weekly", priority: 0.85 },
];

/** Legacy Coverwatch-style aliases that still resolve. */
const LEGACY_ALIAS_PAGES: Entry[] = [
  { path: "/industries/ecommerce", changeFrequency: "monthly", priority: 0.4 },
  ...ECOMMERCE_VERTICALS.map((vertical) => ({
    path: `/industries/ecommerce/${vertical.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.35,
  })),
];

function dedupe(entries: Entry[]): Entry[] {
  const seen = new Map<string, Entry>();
  for (const entry of entries) {
    const key = loc(entry.path);
    const prev = seen.get(key);
    if (!prev || entry.priority > prev.priority) {
      seen.set(key, entry);
    }
  }
  return [...seen.values()].sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    return a.path.localeCompare(b.path);
  });
}

/** Full public XML sitemap for Google Search Console / crawlers. */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const industryPages: Entry[] = INDUSTRY_PAGES.map((page) => ({
    path: page.path,
    changeFrequency: "weekly" as const,
    priority: page.parentPath ? 0.7 : 0.85,
  }));

  const guidePages: Entry[] = DOCS_USE_CASES.map((useCase) => ({
    path: `/docs/guides/${useCase.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const apiPages: Entry[] = API_GROUPS.map((group) => ({
    path: `/docs/api/${group.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.65,
  }));

  const entries = dedupe([
    ...CORE_PAGES,
    ...industryPages,
    ...guidePages,
    ...apiPages,
    ...LEGACY_ALIAS_PAGES,
  ]);

  return entries.map((entry) => ({
    url: loc(entry.path),
    lastModified,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}
