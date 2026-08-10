"use client";

import { useEffect } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import {
  clearWorkspaceAuthSession,
  syncWorkspaceSessionFromAuth,
} from "@/lib/supabase/session-bridge";
import { loadSession } from "@/lib/storage";

/**
 * Keeps the local workspace `SessionUser` in sync with Supabase Auth.
 * Required on GitHub Pages (static export) where middleware cannot hydrate sessions.
 */
export function AuthSessionBridge() {
  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    if (!supabase) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        clearWorkspaceAuthSession(loadSession());
        return;
      }

      if (
        session?.user &&
        (event === "INITIAL_SESSION" ||
          event === "SIGNED_IN" ||
          event === "TOKEN_REFRESHED" ||
          event === "USER_UPDATED")
      ) {
        void syncWorkspaceSessionFromAuth(supabase, session.user);
        return;
      }

      if (event === "INITIAL_SESSION" && !session) {
        // Drop a stale mirrored auth session; keep local demo/guest sessions.
        clearWorkspaceAuthSession(loadSession());
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return null;
}
