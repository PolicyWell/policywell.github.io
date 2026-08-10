import type { Metadata } from "next";
import { PrivateProductShell } from "@/components/access/PrivateProductShell";
import { NOINDEX_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = {
  robots: NOINDEX_ROBOTS,
};

/**
 * Gate the public API marketing page (/api).
 * Nested Route Handlers under /api/v1 and /api/agent are not rendered through
 * this layout — only the page UI is wrapped.
 */
export default function ApiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PrivateProductShell surface="api">{children}</PrivateProductShell>;
}
