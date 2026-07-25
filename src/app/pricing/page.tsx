import type { Metadata } from "next";
import { PricingPage } from "@/components/PricingPage";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, marketingMetadata } from "@/lib/seo";

export const metadata: Metadata = marketingMetadata({
  title: "Pricing",
  description:
    "Free for policyholders. Built to power the insurance ecosystem. Advisor, IMO/BGA, and carrier enterprise pricing for PolicyWell.",
  path: "/pricing",
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
