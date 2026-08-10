import type { Metadata } from "next";
import { PrivateProductShell } from "@/components/access/PrivateProductShell";
import { NOINDEX_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = {
  robots: NOINDEX_ROBOTS,
};

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PrivateProductShell surface="product">{children}</PrivateProductShell>
  );
}
