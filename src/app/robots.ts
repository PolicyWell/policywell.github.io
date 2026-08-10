import type { MetadataRoute } from "next";

export const dynamic = "force-static";

/**
 * Crawl rules + sitemap discovery for Google Search Console and other bots.
 * Narrow disallow list for private/application surfaces only.
 * Rendering assets (CSS/JS/images) stay crawlable.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/docs",
          "/docs/",
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
          "/agent",
          "/commercial",
          "/deck",
          "/api/agent",
        ],
      },
    ],
    sitemap: "https://policywell.ai/sitemap.xml",
    host: "https://policywell.ai",
  };
}
