import type { Metadata } from "next";
import { PricingPage } from "@/components/PricingPage";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, marketingMetadata } from "@/lib/seo";

export const metadata: Metadata = marketingMetadata({
  title: "PolicyWell Pricing | Plans for Insurance Organizations",
  description:
    "Free for policyholders. Advisor, IMO/BGA, and carrier plans for PolicyWell insurance intelligence across the ecosystem.",
  path: "/pricing",
  absoluteTitle: true,
});

export default function PricingRoute() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Pricing", path: "/pricing" },
        ])}
      />
      <PricingPage />
    </>
  );
}
