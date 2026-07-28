import type { Metadata } from "next";
import { DemoLifecycle } from "@/components/DemoLifecycle";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, marketingMetadata } from "@/lib/seo";

export const metadata: Metadata = marketingMetadata({
  title: "PolicyWell Demo | Explore the Insurance AI Platform",
  description:
    "Watch PolicyWell ingest a policy, build household context, reason across the financial picture, and surface advisor-approved recommendations.",
  path: "/demo",
  absoluteTitle: true,
});

export default function DemoPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Demo", path: "/demo" },
        ])}
      />
      <DemoLifecycle />
    </>
  );
}
