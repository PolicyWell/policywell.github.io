"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { AuthShell } from "@/components/auth/AuthShell";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { ensureProfileForUser } from "@/lib/supabase/ensure-profile";
import {
  defaultPostLoginPath,
  syncWorkspaceSessionFromAuth,
} from "@/lib/supabase/session-bridge";

/**
 * Handles magic-link / OAuth PKCE redirects into a live Supabase session,
 * ensures public.profiles exists, and mirrors the user into the local workspace session.
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
      const nextParam = url.searchParams.get("next");
      const explicitNext =
        nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
          ? nextParam
          : null;

      async function completeForUser(user: User) {
        await ensureProfileForUser(supabase!, user);
        const session = await syncWorkspaceSessionFromAuth(supabase!, user);
        const dest = explicitNext ?? defaultPostLoginPath(session.role);
        router.replace(dest);
        router.refresh();
      }

      if (code) {
        const { data, error } = await supabase!.auth.exchangeCodeForSession(code);
        if (error) {
          setMessage(error.message);
          setFailed(true);
          return;
        }
        if (data.user) {
          await completeForUser(data.user);
          return;
        }
      }

      const { data } = await supabase!.auth.getClaims();
      if (data?.claims?.sub) {
        const { data: userData } = await supabase!.auth.getUser();
        if (userData.user) {
          await completeForUser(userData.user);
          return;
        }
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
