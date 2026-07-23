import { API_GROUPS } from "@/lib/api-reference-data";
import { DOCS_USE_CASES, type DocsNavGroup } from "@/lib/docs-data";

export type DocsTabId = "guides" | "api";

export const DOCS_TABS = [
  { id: "guides" as const, label: "Guides", href: "/docs" },
  { id: "api" as const, label: "API Reference", href: "/docs/api" },
];

/** Guides tab sidebar. */
export const GUIDES_NAV: readonly DocsNavGroup[] = [
  {
    title: "Overview",
    items: [{ label: "Start here", href: "/docs" }],
  },
  {
    title: "Common use cases",
    items: DOCS_USE_CASES.map((u) => ({
      label: u.title,
      href: `/docs/guides/${u.slug}`,
    })),
  },
  {
    title: "Platform",
    items: [
      { label: "CLI", href: "/docs/cli" },
      { label: "Engineering", href: "/docs/engineering" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
];

/** API Reference tab sidebar — full endpoint catalog. */
export const API_NAV: readonly DocsNavGroup[] = [
  {
    title: "API Reference",
    items: [
      { label: "Overview", href: "/docs/api" },
      { label: "Full reference", href: "/docs/api/reference" },
      { label: "OpenAPI spec", href: "/openapi.json" },
    ],
  },
  {
    title: "Resources",
    items: API_GROUPS.map((g) => ({
      label: g.title,
      href: `/docs/api/${g.slug}`,
    })),
  },
];

/** @deprecated Prefer GUIDES_NAV / API_NAV by tab. */
export const DOCS_NAV = GUIDES_NAV;

export function docsTabForPath(pathname: string): DocsTabId {
  const clean = pathname.replace(/\/$/, "") || "/docs";
  if (clean === "/docs/api" || clean.startsWith("/docs/api/")) return "api";
  return "guides";
}

export function navForTab(tab: DocsTabId): readonly DocsNavGroup[] {
  return tab === "api" ? API_NAV : GUIDES_NAV;
}

/**
 * Related API resources + endpoints for each product use case.
 * Shown on guide pages so use cases connect to the API contract.
 */
export type RelatedApiLink = {
  groupSlug: string;
  groupTitle: string;
  endpoints: readonly {
    id: string;
    method: string;
    path: string;
    title: string;
  }[];
};

export const USE_CASE_API_LINKS: Record<string, readonly string[]> = {
  "policy-intelligence": ["documents", "policies", "analyses", "households"],
  "annuity-intelligence": ["annuities", "policies", "analyses"],
  "ai-insurance-assistant": ["assistant", "households", "policies", "analyses"],
  "document-processing": ["documents", "policies", "batch"],
  "recommendation-engine": ["recommendations", "analyses", "reports"],
  "advisor-crm-integration": ["households", "workflows", "organizations"],
  "carrier-apis": ["carrier", "policies", "documents", "batch"],
  "imo-platform": ["organizations", "workflows", "analyses", "webhooks"],
  webhooks: ["webhooks", "workflows"],
  "workflow-automation": ["workflows", "recommendations", "reports", "webhooks"],
  "white-label-platform": ["authentication", "organizations"],
  "ai-agent-sdk": ["assistant", "analyses", "recommendations", "batch"],
};

export function relatedApiForUseCase(slug: string): RelatedApiLink[] {
  const groupSlugs = USE_CASE_API_LINKS[slug] ?? [];
  const links: RelatedApiLink[] = [];
  for (const groupSlug of groupSlugs) {
    const group = API_GROUPS.find((g) => g.slug === groupSlug);
    if (!group) continue;
    links.push({
      groupSlug: group.slug,
      groupTitle: group.title,
      endpoints: group.endpoints.map((ep) => ({
        id: ep.id,
        method: ep.method,
        path: ep.path,
        title: ep.title,
      })),
    });
  }
  return links;
}
