import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IndustryLanding } from "@/components/IndustryLanding";
import { IndustrySeo } from "@/components/seo/IndustrySeo";
import {
  getIndustryPage,
  industrySegmentSlugs,
} from "@/lib/industry-pages-data";
import { industryPageMetadata } from "@/lib/seo";

const HUB = "/life-insurance";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return industrySegmentSlugs(HUB).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getIndustryPage(`${HUB}/${slug}`);
  if (!page) return { title: "Industry" };
  return industryPageMetadata(page);
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const path = `${HUB}/${slug}`;
  if (!getIndustryPage(path)) notFound();
  return (
    <>
      <IndustrySeo path={path} />
      <IndustryLanding path={path} />
    </>
  );
}
