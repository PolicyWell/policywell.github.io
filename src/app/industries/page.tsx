import type { Metadata } from "next";
import { IndustriesHub } from "@/components/IndustriesHub";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, marketingMetadata } from "@/lib/seo";

export const metadata: Metadata = marketingMetadata({
  title: "Insurance Industry Solutions | PolicyWell",
  description:
    "Browse PolicyWell industry solutions for life insurance, annuities, ecommerce, contractors, restaurants, trucking, property management, and more.",
  path: "/industries",
  absoluteTitle: true,
});

export default function IndustriesPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Industries", path: "/industries" },
        ])}
      />
      <IndustriesHub />
    </>
  );
}
