import type { Metadata } from "next";
import { IndustryLanding } from "@/components/IndustryLanding";
import { getIndustryPage } from "@/lib/industry-pages-data";

const PATH = "/catering-insurance";

const page = getIndustryPage(PATH)!;

export const metadata: Metadata = {
  title: page.title,
  description: page.support,
  openGraph: {
    title: `${page.title} · PolicyWell`,
    description: page.support,
    url: `https://policywell.ai/catering-insurance`,
  },
};

export default function Page() {
  return <IndustryLanding path={PATH} />;
}
