import type { MetadataRoute } from "next";

export const dynamic = "force-static";

/**
 * Crawl rules + sitemap discovery for Google Search Console and other bots.
 * App/workspace surfaces stay out of the index; marketing + docs stay open.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/workspace",
          "/upload",
          "/compare",
          "/tasks",
          "/report",
          "/profile",
          "/clients",
          "/login",
          "/onboarding",
          "/carrier",
          "/firm",
          "/imo",
          "/api/",
        ],
      },
    ],
    sitemap: "https://policywell.ai/sitemap.xml",
    host: "https://policywell.ai",
  };
}
