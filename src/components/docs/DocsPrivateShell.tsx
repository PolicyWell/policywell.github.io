"use client";

import type { ReactNode } from "react";
import { DocsAccessGate } from "@/components/docs/DocsAccessGate";
import { DocsAccessProvider } from "@/components/docs/DocsAccessProvider";
import { DocsShell } from "@/components/docs/DocsShell";

/**
 * Private docs chrome: Access Restricted until unlock, then DocsShell.
 * Children are not mounted while locked, so SSR HTML stays gate-only.
 */
export function DocsPrivateShell({ children }: { children: ReactNode }) {
  return (
    <DocsAccessProvider>
      <DocsAccessGate>
        <DocsShell>{children}</DocsShell>
      </DocsAccessGate>
    </DocsAccessProvider>
  );
}
