import type { Metadata } from "next";
import { DemoLifecycle } from "@/components/DemoLifecycle";

export const metadata: Metadata = {
  title: "Experience PolicyWell",
  description:
    "See how insurance documents, household context, advisor workflows, and carrier data become explainable recommendations and human-approved actions.",
};

export default function DemoPage() {
  return <DemoLifecycle />;
}
