import type { Metadata } from "next";
import { IndustriesHub } from "@/components/IndustriesHub";

export const metadata: Metadata = {
  title: "Industries We Cover",
  description:
    "PolicyWell serves businesses across dozens of industries, from ecommerce to trucking, property management to contractors. Browse every vertical we cover.",
  openGraph: {
    title: "Industries We Cover · PolicyWell",
    description:
      "Browse every industry vertical PolicyWell supports — ecommerce, contractors, restaurants, trucking, and more.",
    url: "https://policywell.ai/industries",
  },
};

export default function IndustriesPage() {
  return <IndustriesHub />;
}
