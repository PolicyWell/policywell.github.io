import { JsonLd } from "@/components/seo/JsonLd";
import { getIndustryPage } from "@/lib/industry-pages-data";
import {
  industryBreadcrumbJsonLd,
  industryServiceJsonLd,
} from "@/lib/seo";

/** Server-only JSON-LD for industry landing pages. */
export function IndustrySeo({ path }: { path: string }) {
  const page = getIndustryPage(path);
  if (!page) return null;
  return (
    <JsonLd
      data={[industryServiceJsonLd(page), industryBreadcrumbJsonLd(page)]}
    />
  );
}
