"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { ensureProfileForUser } from "@/lib/supabase/ensure-profile";

/**
 * Handles magic-link / OAuth PKCE redirects into a live Supabase session,
 * then ensures public.profiles exists for the auth.users row.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Completing sign-in…");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setMessage("Supabase is not configured.");
      setFailed(true);
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
          setFailed(true);
          return;
        }
        if (data.user) {
          await ensureProfileForUser(supabase!, data.user);
        }
        router.replace(dest);
        router.refresh();
        return;
      }

      const { data } = await supabase!.auth.getClaims();
      if (data?.claims?.sub) {
        const { data: userData } = await supabase!.auth.getUser();
        if (userData.user) {
          await ensureProfileForUser(supabase!, userData.user);
        }
        router.replace(dest);
        router.refresh();
        return;
      }
      setMessage("No auth code found. Try signing in again.");
      setFailed(true);
    }

    void finish();
  }, [router]);

  return (
    <AuthShell>
      <div className="pw-login-card">
        <h1 className="pw-login-title">Signing you in</h1>
        <p className={failed ? "pw-login-error" : "pw-login-lede"}>{message}</p>
        {failed && (
          <Link href="/login/" className="pw-login-text-link">
            Back to sign in
          </Link>
        )}
      </div>
    </AuthShell>
  );
}
