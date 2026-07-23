import { API_GROUPS } from "@/lib/api-reference-data";
import { DOCS_USE_CASES, type DocsNavGroup } from "@/lib/docs-data";

/** Documentation sidebar navigation. */
export const DOCS_NAV: readonly DocsNavGroup[] = [
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
    title: "API reference",
    items: [
      { label: "Overview", href: "/docs/api" },
      ...API_GROUPS.map((g) => ({
        label: g.title,
        href: `/docs/api/${g.slug}`,
      })),
      { label: "OpenAPI spec", href: "/openapi.json" },
    ],
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
