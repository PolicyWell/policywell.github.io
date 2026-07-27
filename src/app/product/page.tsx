import type { Metadata } from "next";
import { ProductTour } from "@/components/product-tour/ProductTour";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, marketingMetadata } from "@/lib/seo";

export const metadata: Metadata = marketingMetadata({
  title: "Product",
  description:
    "Interactive PolicyWell product demo — exactly 3:00 step-by-step autoplay across web, CLI, CRM, iOS, and voice. Downloadable ZIP under 100MB for YC applications.",
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
