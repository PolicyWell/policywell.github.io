import type { Metadata } from "next";
import { privateRouteMetadata } from "@/lib/private-route-metadata";

export const metadata: Metadata = privateRouteMetadata;

export default function PearLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
