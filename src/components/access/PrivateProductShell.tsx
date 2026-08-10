"use client";

import type { ReactNode } from "react";
import { RequestAccessGate } from "@/components/access/RequestAccessGate";
import type { ProductAccessSurface } from "@/lib/product-access";

export function PrivateProductShell({
  children,
  surface,
}: {
  children: ReactNode;
  surface?: ProductAccessSurface;
}) {
  return <RequestAccessGate surface={surface}>{children}</RequestAccessGate>;
}
