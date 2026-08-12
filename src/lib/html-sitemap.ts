import { BOOK_A_CALL_PATH } from "@/lib/book-a-call";
import { listCoverageProfiles } from "@/lib/coverage-library";
import {
  INDUSTRY_PAGES,
  industryHref,
} from "@/lib/industry-pages-data";

export type HtmlSitemapLink = {
  href: string;
  label: string;
};

export type HtmlSitemapGroup = {
  title: string;
  links: HtmlSitemapLink[];
};

function link(href: string, label: string): HtmlSitemapLink {
  if (href === "/") return { href: "/", label };
  return { href: industryHref(href), label };
}

function industryGroup(title: string, hubPath: string): HtmlSitemapGroup {
  const hub = INDUSTRY_PAGES.find((p) => p.path === hubPath);
  const descendants = INDUSTRY_PAGES.filter(
    (p) => p.path === hubPath || p.path.startsWith(`${hubPath}/`),
  );
  const links: HtmlSitemapLink[] = descendants.map((p) =>
    link(p.path, p.path === hubPath ? (hub?.label ?? title) : p.label),
  );
  return { title, links };
}

/**
 * Human-readable sitemap groups (Gusto-style directory).
 * Public marketing + industry + coverage library routes only.
 */
export function getHtmlSitemapGroups(): HtmlSitemapGroup[] {
  const industryHubs = INDUSTRY_PAGES.filter((p) => !p.parentPath).map((p) =>
    link(p.path, p.label),
  );

  return [
    {
      title: "Product",
      links: [
        link("/", "Home"),
        link("/platform", "Platform"),
        link("/product", "Product tour"),
        link("/platform/coverage-library", "Coverage Library"),
        link("/pricing", "Pricing"),
        link("/api", "API"),
        link("/docs", "Docs"),
        link("/demo", "Demo"),
      ],
    },
    {
      title: "Get Started",
      links: [
        link("/quote", "Request a quote"),
        { href: BOOK_A_CALL_PATH, label: "Book a call" },
        link("/contact", "Contact"),
        link("/login", "Log in"),
      ],
    },
    {
      title: "Solutions by Industry",
      links: [link("/industries", "See all industries"), ...industryHubs],
    },
    industryGroup("Life Insurance", "/life-insurance"),
    industryGroup("Annuities", "/annuities"),
    industryGroup("Contractors", "/contractors"),
    industryGroup("Ecommerce", "/ecommerce"),
    industryGroup("Technology", "/technology"),
    industryGroup("Trucking", "/trucking"),
    industryGroup("Property Management", "/property-management"),
    industryGroup("Restaurants", "/restaurants"),
    industryGroup("Homeowners Associations", "/homeowners-association-insurance"),
    industryGroup("Garage & Auto", "/garages"),
    industryGroup("Grocery Stores", "/grocery-stores"),
    {
      title: "Coverage Library",
      links: [
        link("/platform/coverage-library", "Browse all profiles"),
        ...listCoverageProfiles()
          .slice()
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((profile) =>
            link(`/platform/coverage-library/${profile.slug}`, profile.name),
          ),
      ],
    },
    {
      title: "About",
      links: [
        link("/about", "About"),
        link("/press", "Press"),
        link("/careers", "Careers"),
        link("/contact", "Contact"),
      ],
    },
    {
      title: "Legal",
      links: [
        link("/privacy", "Privacy"),
        link("/terms", "Terms"),
        link("/sitemap", "Sitemap"),
      ],
    },
  ];
}
