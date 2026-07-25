import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "./env";

let browserClient: SupabaseClient | null | undefined;

/**
 * Browser / static-export Supabase client (anon key).
 * Returns null when env is not configured so the marketing site still builds.
 */
export function createBrowserSupabaseClient(): SupabaseClient | null {
  if (browserClient !== undefined) return browserClient;

  const env = getSupabasePublicEnv();
  if (!env) {
    browserClient = null;
    return null;
  }

  browserClient = createClient(env.url, env.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return browserClient;
}

/** Convenience alias used by app code. */
export function getSupabase(): SupabaseClient | null {
  return createBrowserSupabaseClient();
}
