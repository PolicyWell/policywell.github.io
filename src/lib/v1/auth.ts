import "server-only";

import { createClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import {
  createServiceSupabaseClient,
  createUserSupabaseClient,
  getServiceRoleKey,
  type DemoAuthContext,
} from "@/lib/v1/life-illustration/LifeIllustrationIngestionService";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

const DEMO_EMAIL = process.env.POLICYWELL_DEMO_EMAIL ?? "demo@policywell.local";
const DEMO_PASSWORD =
  process.env.POLICYWELL_DEMO_PASSWORD ?? "policywell-demo-local-2026";

export async function ensureDemoUser(): Promise<{
  userId: string;
  accessToken: string;
}> {
  const env = getSupabasePublicEnv();
  const serviceKey = getServiceRoleKey();
  if (!env || !serviceKey) {
    throw new Error("Supabase is not configured for local demo auth.");
  }

  const admin = createServiceSupabaseClient();
  const { data: listed } = await admin.auth.admin.listUsers({ perPage: 200 });
  let user = listed?.users.find((u) => u.email === DEMO_EMAIL);

  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: { name: "PolicyWell Demo" },
    });
    if (error || !data.user) {
      throw new Error(`Failed to create demo user: ${error?.message ?? "unknown"}`);
    }
    user = data.user;
  }

  const anon = createClient(env.url, env.publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: signed, error: signError } = await anon.auth.signInWithPassword({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
  });
  if (signError || !signed.session) {
    throw new Error(`Demo sign-in failed: ${signError?.message ?? "no session"}`);
  }

  return { userId: user.id, accessToken: signed.session.access_token };
}

/**
 * Resolve auth for local VC demo:
 * 1) Authorization Bearer access token
 * 2) Existing Supabase cookie session
 * 3) Local demo user (created on demand)
 */
export async function resolveDemoAuth(req: Request): Promise<DemoAuthContext> {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.toLowerCase().startsWith("bearer ")) {
    const token = authHeader.slice(7).trim();
    if (token) {
      const client = createUserSupabaseClient(token);
      const { data, error } = await client.auth.getUser();
      if (!error && data.user) {
        return { userId: data.user.id, accessToken: token, source: "bearer" };
      }
    }
  }

  try {
    const server = await createServerSupabaseClient();
    const { data: userData } = await server.auth.getUser();
    if (userData.user) {
      const { data: sessionData } = await server.auth.getSession();
      const token = sessionData.session?.access_token ?? null;
      if (token) {
        return {
          userId: userData.user.id,
          accessToken: token,
          source: "session",
        };
      }
    }
  } catch {
    // Cookie session unavailable (e.g. CLI / no middleware cookies).
  }

  const demo = await ensureDemoUser();
  return {
    userId: demo.userId,
    accessToken: demo.accessToken,
    source: "demo",
  };
}

/** Authenticated Data API client (subject to RLS + table grants). */
export function supabaseForAuth(auth: DemoAuthContext): SupabaseClient<Database> {
  if (!auth.accessToken) {
    throw new Error("Missing access token for authenticated API client");
  }
  return createUserSupabaseClient(auth.accessToken);
}

/** Privileged storage client for private bucket upload in local demo. */
export function storageClientForAuth(): SupabaseClient<Database> {
  return createServiceSupabaseClient();
}
