import type { Metadata } from "next";
import { HomeAiExpertsSplit } from "@/components/home/HomeAiExpertsSplit";
import { HomeAnnouncementBar } from "@/components/home/HomeAnnouncementBar";
import { HomeCaseStories } from "@/components/home/HomeCaseStories";
import { HomeFinalCta } from "@/components/home/HomeFinalCta";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeIntelligenceTeam } from "@/components/home/HomeIntelligenceTeam";
import { HomePlatformShowcase } from "@/components/home/HomePlatformShowcase";
import { HomeValueProp } from "@/components/home/HomeValueProp";
import { JsonLd } from "@/components/seo/JsonLd";
import { SiteNav } from "@/components/ui";
import {
  listCoverageShowcaseProfiles,
  listIndustries,
} from "@/lib/coverage-library";
import {
  marketingMetadata,
  organizationJsonLd,
  softwareApplicationJsonLd,
  webSiteJsonLd,
} from "@/lib/seo";

export const metadata: Metadata = marketingMetadata({
  title: "PolicyWell | AI Infrastructure for Insurance",
  description:
    "PolicyWell helps insurers, agencies, advisors, and policyholders analyze coverage, automate insurance workflows, identify risks, and make better insurance decisions.",
  path: "/",
  absoluteTitle: true,
  ogTitle: "PolicyWell | AI Infrastructure for Insurance",
});

export default function HomePage() {
  const coverageProfiles = listCoverageShowcaseProfiles();
  const coverageIndustries = listIndustries();

  return (
    <div className="pw-wc-home flex-1 flex flex-col min-w-0 w-full max-w-full overflow-x-clip">
      <JsonLd
        data={[
          organizationJsonLd(),
          webSiteJsonLd(),
          softwareApplicationJsonLd(),
        ]}
      />
      <main className="relative flex-1 min-w-0 w-full overflow-x-clip">
        <div className="pw-wc-top">
          <HomeAnnouncementBar />
          <SiteNav variant="overlay" />
          <HomeHero />
        </div>
        <HomeValueProp />
        <HomeIntelligenceTeam />
        <HomeAiExpertsSplit />
        <HomePlatformShowcase
          coverageProfiles={coverageProfiles}
          coverageIndustries={coverageIndustries}
        />
        <HomeCaseStories />
        <HomeFinalCta />
        <div id="meet-ope" className="sr-only" aria-hidden>
          Meet Ope
        </div>
      </main>
    </div>
  );
}
