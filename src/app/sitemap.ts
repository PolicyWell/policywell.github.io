import type { MetadataRoute } from "next";
import { API_GROUPS } from "@/lib/api-reference-data";
import { DOCS_USE_CASES } from "@/lib/docs-data";
import { ECOMMERCE_VERTICALS } from "@/lib/industries-nav";
import { INDUSTRY_PAGES } from "@/lib/industry-pages-data";

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
  { path: "/quote", changeFrequency: "weekly", priority: 0.85 },
  { path: "/commercial", changeFrequency: "weekly", priority: 0.85 },
  { path: "/industries", changeFrequency: "weekly", priority: 0.85 },
  { path: "/ecommerce", changeFrequency: "weekly", priority: 0.8 },
  { path: "/contractors", changeFrequency: "weekly", priority: 0.75 },
  { path: "/restaurants", changeFrequency: "weekly", priority: 0.75 },
  { path: "/trucking", changeFrequency: "weekly", priority: 0.75 },
  { path: "/garages", changeFrequency: "weekly", priority: 0.75 },
  { path: "/grocery-stores", changeFrequency: "weekly", priority: 0.75 },
  { path: "/property-management", changeFrequency: "weekly", priority: 0.75 },
  { path: "/homeowners-association-insurance", changeFrequency: "weekly", priority: 0.75 },
  { path: "/technology", changeFrequency: "weekly", priority: 0.75 },
  { path: "/retail", changeFrequency: "weekly", priority: 0.7 },
  { path: "/bar-insurance", changeFrequency: "weekly", priority: 0.7 },
  { path: "/catering-insurance", changeFrequency: "weekly", priority: 0.7 },
  { path: "/industries/ecommerce", changeFrequency: "monthly", priority: 0.5 },
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

  const ecommercePages: Entry[] = ECOMMERCE_VERTICALS.map((vertical) => ({
    path: `/industries/ecommerce/${vertical.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.45,
  }));

  const industryPages: Entry[] = INDUSTRY_PAGES.map((page) => ({
    path: page.path,
    changeFrequency: "monthly" as const,
    priority: page.parentPath ? 0.65 : 0.75,
  }));

  return [
    ...STATIC_PAGES,
    ...guidePages,
    ...apiPages,
    ...industryPages,
    ...ecommercePages,
  ].map((entry) => ({
    url: url(entry.path),
    lastModified,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}
