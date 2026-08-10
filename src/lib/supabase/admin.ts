import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * Service-role Supabase client for PolicyWell admin / backend jobs.
 * NEVER import this from Client Components or expose via NEXT_PUBLIC_*.
 */
export function getServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required for server-side admin access and must not be NEXT_PUBLIC_.",
    );
  }
  if (key.startsWith("sb_publishable_") || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "Refusing to use a publishable/public service role key. Use server-only SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  return key;
}

export function createServiceRoleClient(): SupabaseClient<Database> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is required to create the service-role client.");
  }
  return createClient<Database>(url, getServiceRoleKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
