import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "./env";

/**
 * Server-only client for non-static hosts (`next start`, Vercel, etc.).
 * Prefer the service role only for trusted server routes — never expose it
 * to the browser or static Pages builds.
 */
export function createServerSupabaseClient(): SupabaseClient | null {
  const env = getSupabasePublicEnv();
  if (!env) return null;

  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return createClient(env.url, serviceRole || env.anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
