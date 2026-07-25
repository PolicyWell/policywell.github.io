import type { Metadata } from "next";
import { IndustryLanding } from "@/components/IndustryLanding";
import { getIndustryPage } from "@/lib/industry-pages-data";

const PATH = "/homeowners-association-insurance";

const page = getIndustryPage(PATH)!;

export const metadata: Metadata = {
  title: page.title,
  description: page.support,
  openGraph: {
    title: `${page.title} · PolicyWell`,
    description: page.support,
    url: `https://policywell.ai/homeowners-association-insurance`,
  },
};

export default function Page() {
  return <IndustryLanding path={PATH} />;
}
