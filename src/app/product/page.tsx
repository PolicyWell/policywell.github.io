import type { Metadata } from "next";
import { ProductTour } from "@/components/product-tour/ProductTour";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, marketingMetadata } from "@/lib/seo";

export const metadata: Metadata = marketingMetadata({
  title: "PolicyWell Product Tour | Interactive Platform Walkthrough",
  description:
    "Interactive PolicyWell product demo covering dashboard, risk, marketplace, claims, CRM, and policy analyzer modules.",
  path: "/product",
  absoluteTitle: true,
});

export default function ProductPage() {
  return (
    <div className="flex-1 flex flex-col min-w-0 w-full max-w-full overflow-x-clip">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Platform", path: "/platform" },
          { name: "Product", path: "/product" },
        ])}
      />
      <ProductTour />
    </div>
  );
}
