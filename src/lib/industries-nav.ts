import { INDUSTRY_PAGES } from "@/lib/industry-pages-data";

export type IndustryCategory = {
  id: string;
  label: string;
  /** When empty, the right panel shows the specialist note instead of sub-links. */
  children: string[];
};

/** Visual treatment for ecommerce landing stages. */
export type EcommerceSceneStage =
  | "laptop"
  | "alcohol-fulfillment"
  | "beauty-studio"
  | "clothing-boutique"
  | "cpg-pallet"
  | "food-shop"
  | "pet-table"
  | "supplement-lab";

export type EcommerceVertical = {
  slug: string;
  label: string;
  headline: string;
  support: string;
  productName: string;
  price: string;
  colors: readonly string[];
  sizes: readonly string[];
  accent: string;
  /** Optional secondary CTA label under the primary quote button. */
  secondaryCta?: string;
  /** Visual treatment for the landing stage. */
  stage?: EcommerceSceneStage;
};

export const INDUSTRY_SPECIALIST_NOTE =
  "Specialist coverage placed across a variety of carriers. Open the page for details.";

/** Industries mega-menu - structure matches the Industries Tab screenshots. */
export const INDUSTRY_CATEGORIES: IndustryCategory[] = [
  {
    id: "financial-products",
    label: "Financial Products",
    children: [
      "Life Insurance",
      "Term Life",
      "Cash Back Offer Term",
      "Regular Term",
      "Whole Life",
      "Indexed Universal Life",
      "Annuities",
      "Variable Annuity",
      "Fixed Indexed Annuity (FIA)",
      "Fixed Annuity",
      "Immediate Annuity (SPIA)",
    ],
  },
  {
    id: "ecommerce",
    label: "Ecommerce",
    children: [
      "Alcoholic Beverage",
      "Beauty & Cosmetics",
      "Clothing Store",
      "CPG",
      "Food & Beverage",
      "Pet Business",
      "Supplement",
    ],
  },
  {
    id: "home-owners-associations",
    label: "Home Owner's Associations",
    children: [
      "Co-op Association",
      "Community Association Management",
      "Condominium Association",
      "HOA Board",
      "Planned Unit Development",
      "Self-Managed HOA",
      "Single-Family HOA",
      "Townhome Association",
    ],
  },
  {
    id: "property-management",
    label: "Property Management",
    children: [
      "Commercial Property Management",
      "Multifamily Property Management",
      "Residential Property Management",
      "Short-Term Rental Management",
    ],
  },
  {
    id: "restaurant",
    label: "Restaurant",
    children: [
      "Fast Food & QSR",
      "Fine Dining & Upscale",
      "Restaurant Group & Multi-Unit",
    ],
  },
  {
    id: "grocery-store",
    label: "Grocery Store",
    children: ["Small Grocery Store", "Supercenter", "Supermarket"],
  },
  {
    id: "trucking",
    label: "Trucking",
    children: ["Box Truck", "Dump Truck", "Semi Truck", "Tow Truck"],
  },
  {
    id: "garage-auto",
    label: "Garage & Auto",
    children: [
      "Auto Dealer",
      "Auto Repair Shop",
      "Body Shop",
      "Mechanic",
      "Used Car Dealer",
    ],
  },
  {
    id: "contractor",
    label: "Contractor",
    children: [
      "Electrician",
      "Flooring Contractor",
      "General Contractor",
      "Handyman",
      "HVAC",
      "Landscaping",
      "Painter",
      "Plumber",
      "Roofing",
    ],
  },
  {
    id: "technology",
    label: "Technology",
    children: [
      "Crypto & Web3 Company",
      "Cybersecurity Company",
      "Fintech",
      "SaaS",
    ],
  },
  {
    id: "retail-store",
    label: "Retail Store",
    children: [],
  },
  {
    id: "bar",
    label: "Bar",
    children: [],
  },
  {
    id: "catering",
    label: "Catering",
    children: [],
  },
];

/** Landing-page content for nested Ecommerce verticals (Coverwatch-style). */
export const ECOMMERCE_VERTICALS: readonly EcommerceVertical[] = [
  {
    slug: "alcoholic-beverage",
    label: "Alcoholic Beverage",
    headline:
      "Alcoholic beverage insurance built for DTC alcohol brands shipping across state lines",
    support:
      "Your general liability policy excludes alcohol sales. Alcoholic beverage insurance fills that gap with liquor liability, product liability, and multi-state shipping compliance for DTC wine, spirits, beer, and RTD brands.",
    productName: "Reserve Cabernet 2022",
    price: "$48.00",
    colors: ["#4a1c2f", "#6b2d45", "#c4a574"],
    sizes: ["750ml", "1.5L", "3L"],
    accent: "#4a1c2f",
    secondaryCta: "Free coverage review",
    stage: "alcohol-fulfillment",
  },
  {
    slug: "beauty-and-cosmetics",
    label: "Beauty & Cosmetics",
    headline: "Beauty & cosmetics insurance formulated for product brands",
    support:
      "Product liability for skincare and cosmetics, product recall coverage, MoCRA compliance support, and the lines most beauty programs leave out. Coverage review in 24 to 48 hours.",
    productName: "Essential Serum",
    price: "$62.00",
    colors: ["#f3e6df", "#d8b4a6", "#2c2420"],
    sizes: ["15ml", "30ml", "50ml"],
    accent: "#d8b4a6",
    secondaryCta: "Free coverage review",
    stage: "beauty-studio",
  },
  {
    slug: "clothing-store",
    label: "Clothing Store",
    headline: "Clothing store insurance tailored for online and retail sellers",
    support:
      "Product liability, commercial property, cyber coverage, and Workers Comp for fashion retailers selling through Amazon, Shopify, and brick-and-mortar locations. Quotes across a variety of carriers.",
    productName: "Essential Knit Sweater",
    price: "$189.00",
    colors: ["#d4c4b0", "#8a9aa8", "#2b2b2b"],
    sizes: ["S", "M", "L", "XL"],
    accent: "#1a1a1a",
    secondaryCta: "Free coverage review",
    stage: "clothing-boutique",
  },
  {
    slug: "cpg",
    label: "CPG",
    headline:
      "Consumer packaged goods insurance built for retail and DTC brands",
    support:
      "Product liability, recall coverage, contamination protection, and retailer compliance for consumer packaged goods brands selling through Amazon, Walmart, Target, Costco, and DTC channels. Coverage review in 24 to 48 hours.",
    productName: "Everyday Staple Pack",
    price: "$24.00",
    colors: ["#e8f0e9", "#7a9e7e", "#1f3d2a"],
    sizes: ["Trial", "Standard", "Family"],
    accent: "#1f3d2a",
    secondaryCta: "Free coverage review",
    stage: "cpg-pallet",
  },
  {
    slug: "food-and-beverage",
    label: "Food & Beverage",
    headline: "Food & beverage insurance built for DTC and retail brands",
    support:
      "Product liability, recall coverage, contamination protection, and the retailer compliance endorsements your brand needs before the next PO ships.",
    productName: "Artisan Trail Mix",
    price: "$16.00",
    colors: ["#f0e2c8", "#c4783a", "#5c3a1e"],
    sizes: ["4oz", "12oz", "2lb"],
    accent: "#c4783a",
    secondaryCta: "Free coverage review",
    stage: "food-shop",
  },
  {
    slug: "pet-business",
    label: "Pet Business",
    headline:
      "Pet business insurance crafted for treats, food, and supplement brands",
    support:
      "Product liability that responds to pet injury claims, recall coverage for contamination events, and marketplace compliance for Chewy, Amazon, and retail channels.",
    productName: "Everyday Chew Toy",
    price: "$22.00",
    colors: ["#f5d76e", "#7eb8da", "#e89a9a"],
    sizes: ["S", "M", "L"],
    accent: "#7eb8da",
    secondaryCta: "Free coverage review",
    stage: "pet-table",
  },
  {
    slug: "supplement",
    label: "Supplement",
    headline: "Supplement insurance designed for brands navigating FDA risk",
    support:
      "Product liability without experimental exclusions, product recall coverage, and the lines most supplement programs are missing. Coverage review in 24 to 48 hours.",
    productName: "Daily Focus Capsules",
    price: "$54.00",
    colors: ["#eef4f1", "#5a8f7b", "#1c3d32"],
    sizes: ["30ct", "60ct", "90ct"],
    accent: "#5a8f7b",
    secondaryCta: "Free coverage review",
    stage: "supplement-lab",
  },
];

export function isEcommerceSceneStage(
  stage: EcommerceSceneStage | undefined,
): stage is Exclude<EcommerceSceneStage, "laptop"> {
  return Boolean(stage && stage !== "laptop");
}

export function getIndustryCategory(id: string): IndustryCategory | undefined {
  return INDUSTRY_CATEGORIES.find((c) => c.id === id);
}

export function getEcommerceVertical(
  slug: string,
): EcommerceVertical | undefined {
  return ECOMMERCE_VERTICALS.find((v) => v.slug === slug);
}

/**
 * Coverwatch-style contact deep link on an industry (or quote) page.
 * Example: `/retail/#contact` or
 * `/property-management/short-term-rental-management-insurance/#contact`
 */
export function industryQuoteHref(pathOrLabel: string): string {
  const byLabel = INDUSTRY_PAGES.find((p) => p.label === pathOrLabel);
  const raw = byLabel?.path ?? pathOrLabel;
  if (!raw || raw === "/") return "/quote/#contact";
  const clean = raw.replace(/\/+$/, "");
  const path = clean.startsWith("/") ? clean : `/${clean}`;
  // Preserve dedicated quote route as /quote/#contact
  if (path === "/quote") return "/quote/#contact";
  return `${path}/#contact`;
}

/** Coverwatch-style category hub paths on PolicyWell. */
const CATEGORY_HUB_PATH: Record<string, string> = {
  "financial-products": "/financial-products/",
  ecommerce: "/ecommerce/",
  "home-owners-associations": "/homeowners-association-insurance/",
  "property-management": "/property-management/",
  restaurant: "/restaurants/",
  "grocery-store": "/grocery-stores/",
  trucking: "/trucking/",
  "garage-auto": "/garages/",
  contractor: "/contractors/",
  technology: "/technology/",
  "retail-store": "/retail/",
  bar: "/bar-insurance/",
  catering: "/catering-insurance/",
};

export function industryCategoryHref(categoryId: string): string {
  return (
    CATEGORY_HUB_PATH[categoryId] ??
    industryQuoteHref("/quote")
  );
}

export function industryChildHref(
  categoryId: string,
  childLabel: string,
): string {
  const hub = CATEGORY_HUB_PATH[categoryId];
  if (hub) {
    // Match nested hubs + leaves under this category (e.g. Life Insurance
    // and Annuities nested under Financial Products).
    const inCategory = INDUSTRY_PAGES.filter(
      (p) => p.categoryId === categoryId && p.path !== hub.replace(/\/$/, ""),
    );
    const match =
      inCategory.find((p) => p.label === childLabel) ??
      INDUSTRY_PAGES.find((p) => p.label === childLabel);
    if (match) return `${match.path}/`;
  }
  return industryQuoteHref("/quote");
}

/** Flat list for quote form selects (categories + subcategories). */
export function allIndustryLabels(): string[] {
  const labels: string[] = [];
  for (const cat of INDUSTRY_CATEGORIES) {
    labels.push(cat.label);
    for (const child of cat.children) labels.push(child);
  }
  return labels;
}

export function slugifyIndustry(label: string): string {
  return label
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
