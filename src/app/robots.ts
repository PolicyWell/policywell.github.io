import type { MetadataRoute } from "next";

export const dynamic = "force-static";

/** Helps crawlers discover the XML sitemap. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://policywell.ai/sitemap.xml",
    host: "https://policywell.ai",
  };
}
