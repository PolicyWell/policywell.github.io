import type { Metadata } from "next";
import { PricingPage } from "@/components/PricingPage";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Free for policyholders and policy seekers. Built to power the insurance ecosystem — free for consumers, built for advisors, IMOs, and carriers.",
};

export default function PricingRoute() {
  return <PricingPage />;
}
