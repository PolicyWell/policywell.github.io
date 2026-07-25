import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EcommerceLanding } from "@/components/EcommerceLanding";
import {
  ECOMMERCE_VERTICALS,
  getEcommerceVertical,
} from "@/lib/industries-nav";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return ECOMMERCE_VERTICALS.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const vertical = getEcommerceVertical(slug);
  if (!vertical) return { title: "Ecommerce" };
  return {
    title: `${vertical.label} Insurance`,
    description: vertical.support,
    openGraph: {
      title: `${vertical.label} · PolicyWell Ecommerce`,
      description: vertical.headline,
      url: `https://policywell.ai/industries/ecommerce/${vertical.slug}`,
    },
  };
}

export default async function EcommerceVerticalPage({ params }: PageProps) {
  const { slug } = await params;
  const vertical = getEcommerceVertical(slug);
  if (!vertical) notFound();
  return <EcommerceLanding vertical={vertical} />;
}
