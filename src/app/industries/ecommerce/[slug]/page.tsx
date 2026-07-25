import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IndustryLanding } from "@/components/IndustryLanding";
import {
  ECOMMERCE_VERTICALS,
  getEcommerceVertical,
} from "@/lib/industries-nav";
import { getIndustryPage } from "@/lib/industry-pages-data";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const LEGACY_TO_PATH: Record<string, string> = {
  "alcoholic-beverage": "/ecommerce/alcoholic-beverage-insurance",
  "beauty-and-cosmetics": "/ecommerce/beauty-and-cosmetics-insurance",
  "clothing-store": "/ecommerce/clothing-store-insurance",
  cpg: "/ecommerce/cpg-insurance",
  "food-and-beverage": "/ecommerce/food-and-beverage-insurance",
  "pet-business": "/ecommerce/pet-business-insurance",
  supplement: "/ecommerce/supplement-insurance",
};

export function generateStaticParams() {
  return ECOMMERCE_VERTICALS.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const path = LEGACY_TO_PATH[slug];
  const page = path ? getIndustryPage(path) : undefined;
  const vertical = getEcommerceVertical(slug);
  if (!page && !vertical) return { title: "Ecommerce" };
  return {
    title: page?.title ?? `${vertical!.label} Insurance`,
    description: page?.support ?? vertical!.support,
    openGraph: {
      title: `${page?.label ?? vertical!.label} · PolicyWell Ecommerce`,
      description: page?.headline ?? vertical!.headline,
      url: `https://policywell.ai/industries/ecommerce/${slug}`,
    },
  };
}

/** Legacy path alias — canonical pages live under /ecommerce/*-insurance/. */
export default async function EcommerceVerticalPage({ params }: PageProps) {
  const { slug } = await params;
  const path = LEGACY_TO_PATH[slug];
  if (!path || !getIndustryPage(path)) notFound();
  return <IndustryLanding path={path} />;
}
