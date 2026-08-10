"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { loginRedirectPath } from "@/lib/supabase/auth-paths";

/**
 * Client-side auth gate for protected surfaces.
 * Complements middleware (parked on GitHub Pages static export).
 */
export function RequireAuth({
  children,
  nextPath,
}: {
  children: ReactNode;
  nextPath: string;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      router.replace(
        `${loginRedirectPath(nextPath)}&error=supabase_not_configured`,
      );
      return;
    }

    async function sync() {
      const { data, error } = await supabase!.auth.getClaims();
      if (cancelled) return;
      if (error || !data?.claims?.sub) {
        router.replace(loginRedirectPath(nextPath));
        return;
      }
      setAuthorized(true);
      setReady(true);
    }

    void sync();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;
      if (!session) {
        setAuthorized(false);
        router.replace(loginRedirectPath(nextPath));
        return;
      }
      setAuthorized(true);
      setReady(true);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [nextPath, router]);

  if (!ready || !authorized) {
    return (
      <div className="pw-shell py-16 text-stone text-sm">
        Checking your session…
      </div>
    );
  }

  return <>{children}</>;
}
