import type { Metadata } from "next";
import { IndustryLanding } from "@/components/IndustryLanding";
import { IndustrySeo } from "@/components/seo/IndustrySeo";
import { getIndustryPage } from "@/lib/industry-pages-data";
import { industryPageMetadata } from "@/lib/seo";

const PATH = "/grocery-stores";

const page = getIndustryPage(PATH)!;

export const metadata: Metadata = industryPageMetadata(page);

export default function Page() {
  return (
    <>
      <IndustrySeo path={PATH} />
      <IndustryLanding path={PATH} />
    </>
  );
}
