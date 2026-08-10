import type { Metadata } from "next";
import { DocsPrivateShell } from "@/components/docs/DocsPrivateShell";
import { DOCS_META } from "@/lib/docs-data";
import { NOINDEX_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    default: `${DOCS_META.title} · PolicyWell Docs`,
    template: "%s · PolicyWell Docs",
  },
  description: DOCS_META.description,
  robots: NOINDEX_ROBOTS,
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DocsPrivateShell>{children}</DocsPrivateShell>;
}
