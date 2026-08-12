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
          "/demo",
          "/product",
          "/platform",
          "/deck",
          "/agent",
          "/pear",
          "/pear-x",
          "/api",
          "/api/",
          "/openapi.json",
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
          "/commercial",
          "/api/agent",
        ],
      },
    ],
    sitemap: "https://policywell.ai/sitemap.xml",
    host: "https://policywell.ai",
  };
}
