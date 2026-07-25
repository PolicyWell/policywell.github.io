import type { Metadata } from "next";
import { IndustriesHub } from "@/components/IndustriesHub";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, marketingMetadata, organizationJsonLd } from "@/lib/seo";

export const metadata: Metadata = marketingMetadata({
  title: "Insurance Solutions by Industry",
  description:
    "Browse PolicyWell industry coverage for life insurance, annuities, ecommerce, contractors, restaurants, trucking, property management, and more.",
  path: "/industries",
  ogTitle: "Insurance Solutions by Industry · PolicyWell",
});

export default function IndustriesPage() {
  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(),
          breadcrumbJsonLd([
            { name: "Industries", path: "/industries" },
          ]),
        ]}
      />
      <IndustriesHub />
    </>
  );
}
