import type { Metadata } from "next";
import { DemoLifecycle } from "@/components/DemoLifecycle";

export const metadata: Metadata = {
  title: "Product demo",
  description:
    "Watch PolicyWell ingest a policy, build household context, reason across the financial picture, and surface advisor-approved recommendations.",
};

export default function DemoPage() {
  return <DemoLifecycle />;
}
