import type { Metadata } from "next";
import { PermanentRedirect } from "@/components/seo/PermanentRedirect";
import { absoluteUrl, marketingMetadata } from "@/lib/seo";

const CANONICAL = "/ecommerce";

/** Legacy alias — permanently redirected to /ecommerce/. */
export const metadata: Metadata = {
  ...marketingMetadata({
    title: "Ecommerce Insurance",
    description:
      "Ecommerce insurance for DTC and consumer brands — product liability, recall coverage, and channel compliance across Amazon, Shopify, and retail.",
    path: CANONICAL,
  }),
  robots: { index: false, follow: true },
  other: {
    refresh: `0;url=${absoluteUrl(CANONICAL)}`,
  },
};

export default function EcommerceIndustryRedirectPage() {
  return <PermanentRedirect to={CANONICAL} label="Ecommerce Insurance" />;
}
