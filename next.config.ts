import type { NextConfig } from "next";

const staticExport = process.env.STATIC_EXPORT === "1";

/** Legacy Coverwatch ecommerce aliases → canonical /ecommerce/* paths. */
const ECOMMERCE_LEGACY_REDIRECTS = [
  {
    source: "/industries/ecommerce",
    destination: "/ecommerce/",
  },
  {
    source: "/industries/ecommerce/",
    destination: "/ecommerce/",
  },
  {
    source: "/industries/ecommerce/alcoholic-beverage",
    destination: "/ecommerce/alcoholic-beverage-insurance/",
  },
  {
    source: "/industries/ecommerce/alcoholic-beverage/",
    destination: "/ecommerce/alcoholic-beverage-insurance/",
  },
  {
    source: "/industries/ecommerce/beauty-and-cosmetics",
    destination: "/ecommerce/beauty-and-cosmetics-insurance/",
  },
  {
    source: "/industries/ecommerce/beauty-and-cosmetics/",
    destination: "/ecommerce/beauty-and-cosmetics-insurance/",
  },
  {
    source: "/industries/ecommerce/clothing-store",
    destination: "/ecommerce/clothing-store-insurance/",
  },
  {
    source: "/industries/ecommerce/clothing-store/",
    destination: "/ecommerce/clothing-store-insurance/",
  },
  {
    source: "/industries/ecommerce/cpg",
    destination: "/ecommerce/cpg-insurance/",
  },
  {
    source: "/industries/ecommerce/cpg/",
    destination: "/ecommerce/cpg-insurance/",
  },
  {
    source: "/industries/ecommerce/food-and-beverage",
    destination: "/ecommerce/food-and-beverage-insurance/",
  },
  {
    source: "/industries/ecommerce/food-and-beverage/",
    destination: "/ecommerce/food-and-beverage-insurance/",
  },
  {
    source: "/industries/ecommerce/pet-business",
    destination: "/ecommerce/pet-business-insurance/",
  },
  {
    source: "/industries/ecommerce/pet-business/",
    destination: "/ecommerce/pet-business-insurance/",
  },
  {
    source: "/industries/ecommerce/supplement",
    destination: "/ecommerce/supplement-insurance/",
  },
  {
    source: "/industries/ecommerce/supplement/",
    destination: "/ecommerce/supplement-insurance/",
  },
] as const;

const nextConfig: NextConfig = {
  // Trailing slashes match GitHub Pages static export + canonical policy.
  trailingSlash: true,
  ...(staticExport
    ? {
        output: "export" as const,
        images: { unoptimized: true },
      }
    : {}),
  // next.config redirects are unavailable under `output: "export"`.
  // Legacy ecommerce pages also emit meta-refresh redirects for Pages.
  async redirects() {
    if (staticExport) return [];
    return ECOMMERCE_LEGACY_REDIRECTS.map((rule) => ({
      ...rule,
      permanent: true,
    }));
  },
};

export default nextConfig;
