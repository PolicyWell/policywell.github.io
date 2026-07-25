export type IndustryCategory = {
  id: string;
  label: string;
  /** When empty, the right panel shows the specialist note instead of sub-links. */
  children: string[];
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

export function getIndustryCategory(id: string): IndustryCategory | undefined {
  return INDUSTRY_CATEGORIES.find((c) => c.id === id);
}

export function industryQuoteHref(industry: string): string {
  return `/quote/?industry=${encodeURIComponent(industry)}`;
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
