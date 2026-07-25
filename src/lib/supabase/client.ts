import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "./env";

let browserClient: SupabaseClient | null | undefined;

/**
 * Browser / static-export Supabase client (publishable key).
 * Returns null when env is not configured so the marketing site still builds.
 *
 * Prefer `utils/supabase/client` in app code that always has env set.
 */
export function createBrowserSupabaseClient(): SupabaseClient | null {
  if (browserClient !== undefined) return browserClient;

  const env = getSupabasePublicEnv();
  if (!env) {
    browserClient = null;
    return null;
  }

  browserClient = createBrowserClient(env.url, env.publishableKey);
  return browserClient;
}

/** Convenience alias used by app code. */
export function getSupabase(): SupabaseClient | null {
  return createBrowserSupabaseClient();
}
