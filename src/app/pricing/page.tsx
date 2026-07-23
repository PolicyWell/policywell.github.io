import type { Metadata } from "next";
import { PricingPage } from "@/components/PricingPage";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Free for policyholders. Built to power the insurance ecosystem. Advisor, IMO/BGA, and carrier enterprise pricing for PolicyWell.",
};

export default function PricingRoute() {
  return <PricingPage />;
}
