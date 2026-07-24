import type { MetadataRoute } from "next";
import { API_GROUPS } from "@/lib/api-reference-data";
import { DOCS_USE_CASES } from "@/lib/docs-data";

export const dynamic = "force-static";

const SITE_URL = "https://policywell.ai";

/** Prefer trailing slashes to match GitHub Pages static export. */
function url(pathname: string): string {
  if (pathname === "/") return `${SITE_URL}/`;
  const clean = pathname.replace(/\/+$/, "");
  return `${SITE_URL}${clean}/`;
}

type Entry = {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
};

const STATIC_PAGES: Entry[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/pricing", changeFrequency: "weekly", priority: 0.9 },
  { path: "/demo", changeFrequency: "monthly", priority: 0.85 },
  { path: "/deck", changeFrequency: "monthly", priority: 0.8 },
  { path: "/agent", changeFrequency: "weekly", priority: 0.85 },
  { path: "/commercial", changeFrequency: "weekly", priority: 0.85 },
  { path: "/docs", changeFrequency: "weekly", priority: 0.9 },
  { path: "/docs/cli", changeFrequency: "monthly", priority: 0.7 },
  { path: "/docs/engineering", changeFrequency: "monthly", priority: 0.7 },
  { path: "/docs/api", changeFrequency: "weekly", priority: 0.85 },
  { path: "/docs/api/reference", changeFrequency: "weekly", priority: 0.75 },
  { path: "/login", changeFrequency: "yearly", priority: 0.4 },
  { path: "/onboarding", changeFrequency: "monthly", priority: 0.5 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

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

  return [...STATIC_PAGES, ...guidePages, ...apiPages].map((entry) => ({
    url: url(entry.path),
    lastModified,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}
