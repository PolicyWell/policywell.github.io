import type { Metadata } from "next";
import { PrivateProductShell } from "@/components/access/PrivateProductShell";
import { NOINDEX_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = {
  robots: NOINDEX_ROBOTS,
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PrivateProductShell surface="demo">{children}</PrivateProductShell>;
}
