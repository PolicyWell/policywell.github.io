import type { Metadata } from "next";
import { PrivateProductShell } from "@/components/access/PrivateProductShell";
import { privateRouteMetadata } from "@/lib/private-route-metadata";

export const metadata: Metadata = privateRouteMetadata;

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PrivateProductShell surface="agent">{children}</PrivateProductShell>;
}
