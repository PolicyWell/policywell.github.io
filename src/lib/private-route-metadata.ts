import type { Metadata } from "next";
import { NOINDEX_ROBOTS } from "@/lib/seo";

/** Shared metadata export for private application route layouts. */
export const privateRouteMetadata: Metadata = {
  robots: NOINDEX_ROBOTS,
};
