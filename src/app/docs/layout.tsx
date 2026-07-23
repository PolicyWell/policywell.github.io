import type { Metadata } from "next";
import { DocsShell } from "@/components/docs/DocsShell";
import { DOCS_META } from "@/lib/docs-data";

export const metadata: Metadata = {
  title: {
    default: `${DOCS_META.title} · PolicyWell Docs`,
    template: "%s · PolicyWell Docs",
  },
  description: DOCS_META.description,
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DocsShell>{children}</DocsShell>;
}
