import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { getSupabasePublicEnv } from "./env";

export type TypedSupabaseClient = SupabaseClient<Database>;

let browserClient: TypedSupabaseClient | null | undefined;

/**
 * Browser / static-export Supabase client (publishable key).
 * Returns null when env is not configured so the marketing site still builds.
 *
 * Prefer `utils/supabase/client` in app code that always has env set.
 */
export function createBrowserSupabaseClient(): TypedSupabaseClient | null {
  if (browserClient !== undefined) return browserClient;

  const env = getSupabasePublicEnv();
  if (!env) {
    browserClient = null;
    return null;
  }

  browserClient = createBrowserClient<Database>(env.url, env.publishableKey);
  return browserClient;
}

/** Convenience alias used by app code. */
export function getSupabase(): TypedSupabaseClient | null {
  return createBrowserSupabaseClient();
}
