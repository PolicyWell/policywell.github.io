import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PermanentRedirect } from "@/components/seo/PermanentRedirect";
import { ECOMMERCE_VERTICALS } from "@/lib/industries-nav";
import { getIndustryPage } from "@/lib/industry-pages-data";
import { absoluteUrl, industryPageMetadata } from "@/lib/seo";

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
  if (!page) {
    return { title: "Ecommerce", robots: { index: false, follow: true } };
  }
  return {
    ...industryPageMetadata(page),
    robots: { index: false, follow: true },
    other: {
      refresh: `0;url=${absoluteUrl(page.path)}`,
    },
  };
}

/** Legacy alias — permanently redirected to /ecommerce/*-insurance/. */
export default async function EcommerceVerticalRedirectPage({
  params,
}: PageProps) {
  const { slug } = await params;
  const path = LEGACY_TO_PATH[slug];
  const page = path ? getIndustryPage(path) : undefined;
  if (!page) notFound();
  return <PermanentRedirect to={page.path} label={page.title} />;
}
