import type { ReactNode } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";

export default function UploadLayout({ children }: { children: ReactNode }) {
  return <RequireAuth nextPath="/upload/">{children}</RequireAuth>;
}
