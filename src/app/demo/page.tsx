import type { Metadata } from "next";
import { DemoLifecycle } from "@/components/DemoLifecycle";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, marketingMetadata } from "@/lib/seo";

export const metadata: Metadata = marketingMetadata({
  title: "Product demo",
  description:
    "Watch PolicyWell ingest a policy, build household context, reason across the financial picture, and surface advisor-approved recommendations.",
  path: "/demo",
});

export default function DemoPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Product demo", path: "/demo" },
        ])}
      />
      <DemoLifecycle />
    </>
  );
}
