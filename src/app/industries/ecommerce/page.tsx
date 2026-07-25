import type { Metadata } from "next";
import { IndustryLanding } from "@/components/IndustryLanding";

export const metadata: Metadata = {
  title: "Ecommerce Insurance",
  description:
    "Ecommerce insurance for DTC and consumer brands — product liability, recall coverage, and channel compliance across Amazon, Shopify, and retail.",
  openGraph: {
    title: "Ecommerce Insurance · PolicyWell",
    description:
      "Coverage built to scale with ecommerce brands across every channel.",
    url: "https://policywell.ai/industries/ecommerce",
  },
};

/** Legacy path alias — canonical hub is /ecommerce/. */
export default function EcommerceIndustryPage() {
  return <IndustryLanding path="/ecommerce" />;
}
