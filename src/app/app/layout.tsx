import type { Metadata } from "next";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { privateRouteMetadata } from "@/lib/private-route-metadata";

export const metadata: Metadata = privateRouteMetadata;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <RequireAuth nextPath="/app/">{children}</RequireAuth>;
}
