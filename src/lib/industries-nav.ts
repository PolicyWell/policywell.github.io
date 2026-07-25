export type IndustryCategory = {
  id: string;
  label: string;
  /** When empty, the right panel shows the specialist note instead of sub-links. */
  children: string[];
};

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
};

export const INDUSTRY_SPECIALIST_NOTE =
  "Specialist coverage placed across 60+ carriers. Open the page for details.";

/** Industries mega-menu - structure matches the Industries Tab screenshots. */
export const INDUSTRY_CATEGORIES: IndustryCategory[] = [
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
    headline: "Coverage built for DTC beverage brands",
    support:
      "Protect inventory, fulfillment, and tasting rooms while you scale DTC and wholesale channels.",
    productName: "Reserve Cabernet 2022",
    price: "$48.00",
    colors: ["#4a1c2f", "#6b2d45", "#c4a574"],
    sizes: ["750ml", "1.5L", "3L"],
    accent: "#4a1c2f",
  },
  {
    slug: "beauty-and-cosmetics",
    label: "Beauty & Cosmetics",
    headline: "Protect every SKU from formula to fulfillment",
    support:
      "Product liability, cargo, and recall-ready programs for modern beauty brands.",
    productName: "Essential Serum",
    price: "$62.00",
    colors: ["#f3e6df", "#d8b4a6", "#2c2420"],
    sizes: ["15ml", "30ml", "50ml"],
    accent: "#d8b4a6",
  },
  {
    slug: "clothing-store",
    label: "Clothing Store",
    headline: "Built to scale with your brand",
    support:
      "From first Shopify sale to international fulfillment. One broker, every policy, every channel.",
    productName: "Essential Knit Sweater",
    price: "$189.00",
    colors: ["#d4c4b0", "#8a9aa8", "#2b2b2b"],
    sizes: ["S", "M", "L", "XL"],
    accent: "#1a1a1a",
  },
  {
    slug: "cpg",
    label: "CPG",
    headline: "Coverage for product lines that move fast",
    support:
      "Shelf to subscription — protect manufacturing, inventory, and nationwide distribution.",
    productName: "Everyday Staple Pack",
    price: "$24.00",
    colors: ["#e8f0e9", "#7a9e7e", "#1f3d2a"],
    sizes: ["Trial", "Standard", "Family"],
    accent: "#1f3d2a",
  },
  {
    slug: "food-and-beverage",
    label: "Food & Beverage",
    headline: "Insurance for makers who ship freshness",
    support:
      "Cold-chain, product liability, and contingent business income for food brands.",
    productName: "Artisan Trail Mix",
    price: "$16.00",
    colors: ["#f0e2c8", "#c4783a", "#5c3a1e"],
    sizes: ["4oz", "12oz", "2lb"],
    accent: "#c4783a",
  },
  {
    slug: "pet-business",
    label: "Pet Business",
    headline: "Protect the brands pet parents trust",
    support:
      "Product liability and inventory coverage tailored to pet food, toys, and accessories.",
    productName: "Everyday Chew Toy",
    price: "$22.00",
    colors: ["#f5d76e", "#7eb8da", "#e89a9a"],
    sizes: ["S", "M", "L"],
    accent: "#7eb8da",
  },
  {
    slug: "supplement",
    label: "Supplement",
    headline: "Coverage for wellness brands that ship nationally",
    support:
      "Formulation liability, recall readiness, and fulfillment protection for supplement DTC.",
    productName: "Daily Focus Capsules",
    price: "$54.00",
    colors: ["#eef4f1", "#5a8f7b", "#1c3d32"],
    sizes: ["30ct", "60ct", "90ct"],
    accent: "#5a8f7b",
  },
];

export function getIndustryCategory(id: string): IndustryCategory | undefined {
  return INDUSTRY_CATEGORIES.find((c) => c.id === id);
}

export function getEcommerceVertical(
  slug: string,
): EcommerceVertical | undefined {
  return ECOMMERCE_VERTICALS.find((v) => v.slug === slug);
}

export function industryQuoteHref(industry: string): string {
  return `/quote/?industry=${encodeURIComponent(industry)}`;
}

export function industryCategoryHref(categoryId: string): string {
  if (categoryId === "ecommerce") return "/industries/ecommerce/";
  return industryQuoteHref(
    getIndustryCategory(categoryId)?.label ?? categoryId,
  );
}

export function industryChildHref(
  categoryId: string,
  childLabel: string,
): string {
  if (categoryId === "ecommerce") {
    const vertical = ECOMMERCE_VERTICALS.find((v) => v.label === childLabel);
    if (vertical) return `/industries/ecommerce/${vertical.slug}/`;
  }
  return industryQuoteHref(childLabel);
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
