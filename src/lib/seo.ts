import type { Metadata } from "next";
import {
  getIndustryPage,
  type IndustryPage,
} from "@/lib/industry-pages-data";

/** Canonical site origin for metadata, sitemap, and JSON-LD. */
export const SITE_URL = "https://policywell.ai";

/**
 * Shared Open Graph / Twitter card image.
 * Bump the query string when replacing public/og-image.png so social caches refresh.
 * Must be included on every page's openGraph — page-level openGraph without images
 * replaces the root layout images in Next.js metadata merging.
 */
export const OG_IMAGE = `${SITE_URL}/og-image.png?v=20260727d`;

/** Shared robots directive for private / non-marketing surfaces. */
export const NOINDEX_ROBOTS: Metadata["robots"] = {
  index: false,
  follow: false,
  googleBot: {
    index: false,
    follow: false,
    noimageindex: true,
  },
};

/** Normalize a path to a trailing-slash absolute URL (GitHub Pages convention). */
export function absoluteUrl(pathname: string): string {
  if (!pathname || pathname === "/") return `${SITE_URL}/`;
  const clean = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const trimmed = clean.replace(/\/+$/, "");
  return `${SITE_URL}${trimmed}/`;
}

type MarketingMetadataInput = {
  title: string;
  description: string;
  /** Pathname without origin, e.g. `/pricing` or `/ecommerce/cpg-insurance`. */
  path: string;
  /** Optional Open Graph title override. */
  ogTitle?: string;
  /** When true, title is absolute (no layout `%s · PolicyWell` template). */
  absoluteTitle?: boolean;
  robots?: Metadata["robots"];
};

/**
 * Shared public-page metadata: title, description, OG, and canonical.
 * Does not change visible page content.
 */
export function marketingMetadata({
  title,
  description,
  path,
  ogTitle,
  absoluteTitle = false,
  robots,
}: MarketingMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const openGraphTitle = ogTitle ?? (absoluteTitle ? title : `${title} · PolicyWell`);
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical: url,
    },
    ...(robots ? { robots } : {}),
    openGraph: {
      title: openGraphTitle,
      description,
      url,
      siteName: "PolicyWell",
      type: "website",
      images: [
        {
          url: OG_IMAGE,
          width: 1536,
          height: 1024,
          alt: "PolicyWell | Insurance Intelligence. For Everyone.",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: openGraphTitle,
      description,
      images: [OG_IMAGE],
    },
  };
}

/** Metadata for an INDUSTRY_PAGES entry (hub or leaf). */
export function industryPageMetadata(page: IndustryPage): Metadata {
  return marketingMetadata({
    title: page.title,
    description: page.support,
    path: page.path,
  });
}

/** Metadata for private / utility surfaces that must stay out of the index. */
export function noindexMetadata(input: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return marketingMetadata({
    ...input,
    robots: NOINDEX_ROBOTS,
  });
}

const VERIFIED_SAME_AS = [
  "https://instagram.com/policywell",
  "https://x.com/policywell",
  "https://www.linkedin.com/company/policywell",
] as const;

/** Primary sitelink-oriented marketing hubs (trailing-slash canonicals). */
export const PRIMARY_HUB_PATHS = [
  "/",
  "/industries",
  "/pricing",
  "/api",
  "/about",
  "/contact",
] as const;

/** Organization JSON-LD for the marketing site (truthful fields only). */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "PolicyWell",
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/logo.png?v=20260727d`,
    description:
      "PolicyWell helps insurers, agencies, advisors, and policyholders analyze coverage, automate insurance workflows, identify risks, and make better insurance decisions.",
    telephone: "+1-470-887-0449",
    email: "info@policywell.ai",
    sameAs: [...VERIFIED_SAME_AS],
  };
}

/** WebSite JSON-LD with SearchAction omitted (no public site search). */
export function webSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: "PolicyWell",
    url: `${SITE_URL}/`,
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
  };
}

/**
 * SoftwareApplication JSON-LD for the homepage only.
 * Describes PolicyWell as a web business application with a free policyholder tier.
 */
export function softwareApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${SITE_URL}/#software`,
    name: "PolicyWell",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: `${SITE_URL}/`,
    description:
      "AI insurance intelligence platform for policy analysis, commercial risk review, advisor workflows, and carrier integrations.",
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free for policyholders; paid plans for advisors, IMOs, and carriers.",
      url: absoluteUrl("/pricing"),
    },
  };
}

function serviceTypeForCategory(categoryId: string, path: string): string {
  if (path === "/annuities" || path.startsWith("/annuities/")) {
    return "Annuity analysis";
  }
  if (
    categoryId === "financial-products" ||
    path === "/life-insurance" ||
    path.startsWith("/life-insurance/")
  ) {
    return "Life insurance and annuity analysis";
  }
  return "Commercial insurance coverage review";
}

/** Service JSON-LD for industry landings. */
export function industryServiceJsonLd(page: IndustryPage) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: page.title,
    description: page.support,
    url: absoluteUrl(page.path),
    provider: {
      "@type": "Organization",
      name: "PolicyWell",
      url: `${SITE_URL}/`,
    },
    areaServed: {
      "@type": "Country",
      name: "United States",
    },
    serviceType: serviceTypeForCategory(page.categoryId, page.path),
  };
}

export type BreadcrumbItem = {
  name: string;
  path: string;
};

/** BreadcrumbList JSON-LD for public industry/docs pages. */
export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/**
 * Walk parentPath chain and build breadcrumb items for an industry page.
 * Always prefixed with Industries (not Home) to match visible UI.
 */
export function industryBreadcrumbItems(page: IndustryPage): BreadcrumbItem[] {
  const chain: IndustryPage[] = [];
  let current: IndustryPage | undefined = page;
  const guard = new Set<string>();
  while (current && !guard.has(current.path)) {
    guard.add(current.path);
    chain.unshift(current);
    current = current.parentPath
      ? getIndustryPage(current.parentPath)
      : undefined;
  }
  return [
    { name: "PolicyWell", path: "/" },
    { name: "Industries", path: "/industries" },
    ...chain.map((entry) => ({ name: entry.label, path: entry.path })),
  ];
}

export function industryBreadcrumbJsonLd(page: IndustryPage) {
  return breadcrumbJsonLd(industryBreadcrumbItems(page));
}
