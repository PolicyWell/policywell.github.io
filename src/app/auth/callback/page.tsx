"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { ensureProfileForUser } from "@/lib/supabase/ensure-profile";

/**
 * Handles email confirmation / OAuth-style PKCE redirects.
 * Client page so it works when Route Handlers are unavailable (static export).
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Completing sign-in…");

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setMessage("Supabase is not configured.");
      return;
    }

    async function finish() {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      const next = url.searchParams.get("next");
      const dest =
        next && next.startsWith("/") && !next.startsWith("//") ? next : "/app/";

      if (code) {
        const { data, error } = await supabase!.auth.exchangeCodeForSession(code);
        if (error) {
          setMessage(error.message);
          return;
        }
        if (data.user) {
          await ensureProfileForUser(supabase!, data.user);
        }
        router.replace(dest);
        router.refresh();
        return;
      }

      // Hash-based recovery tokens are consumed by the client automatically;
      // verify session then continue.
      const { data } = await supabase!.auth.getClaims();
      if (data?.claims?.sub) {
        router.replace(dest);
        router.refresh();
        return;
      }
      setMessage("No auth code found. Try signing in again.");
    }

    void finish();
  }, [router]);

  return (
    <AuthShell title="Signing you in">
      <p className="text-sm text-stone">{message}</p>
    </AuthShell>
  );
}
