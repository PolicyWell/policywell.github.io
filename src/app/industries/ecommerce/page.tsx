import type { Metadata } from "next";
import { EcommerceLanding } from "@/components/EcommerceLanding";
import { ECOMMERCE_VERTICALS } from "@/lib/industries-nav";

export const metadata: Metadata = {
  title: "Ecommerce Insurance",
  description:
    "Nested ecommerce coverage for DTC brands — clothing, beauty, CPG, beverage, pet, and supplements. Interactive storefront previews inside PolicyWell.",
  openGraph: {
    title: "Ecommerce Insurance · PolicyWell",
    description:
      "Coverage built to scale with ecommerce brands across every channel.",
    url: "https://policywell.ai/industries/ecommerce",
  },
};

/** Hub uses Clothing Store as the default framed demo (Coverwatch-style). */
const HUB_VERTICAL =
  ECOMMERCE_VERTICALS.find((v) => v.slug === "clothing-store") ??
  ECOMMERCE_VERTICALS[0];

export default function EcommerceIndustryPage() {
  return <EcommerceLanding vertical={HUB_VERTICAL} isHub />;
}
