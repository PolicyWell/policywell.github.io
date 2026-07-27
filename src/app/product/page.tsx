import type { Metadata } from "next";
import { ProductTour } from "@/components/product-tour/ProductTour";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, marketingMetadata } from "@/lib/seo";

export const metadata: Metadata = marketingMetadata({
  title: "Product",
  description:
    "Interactive PolicyWell product demo in one central workspace — web risk, market, claims, white-label CLI, CRM, analyzer, mobile upload, and text/voice agents. Under three minutes.",
  path: "/product",
});

export default function ProductPage() {
  return (
    <div className="flex-1 flex flex-col min-w-0 w-full max-w-full overflow-x-clip">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Product", path: "/product" },
        ])}
      />
      <ProductTour />
    </div>
  );
}
