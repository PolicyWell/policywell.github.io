import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IndustryLanding } from "@/components/IndustryLanding";
import {
  getIndustryPage,
  industrySegmentSlugs,
} from "@/lib/industry-pages-data";

const HUB = "/annuities";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return industrySegmentSlugs(HUB).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getIndustryPage(`${HUB}/${slug}`);
  if (!page) return { title: "Industry" };
  return {
    title: page.title,
    description: page.support,
    openGraph: {
      title: `${page.title} · PolicyWell`,
      description: page.support,
      url: `https://policywell.ai${HUB}/${slug}`,
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const path = `${HUB}/${slug}`;
  if (!getIndustryPage(path)) notFound();
  return <IndustryLanding path={path} />;
}
