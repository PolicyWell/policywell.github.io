import { getSupabasePublicEnv } from "@/lib/supabase/env";

export type EdgeFunctionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status?: number; detail?: string };

/**
 * Invoke a public Supabase Edge Function with the publishable key.
 * Used from the browser / static Pages export (no Next.js API routes required).
 */
export async function invokeEdgeFunction<T>(
  name: string,
  body: Record<string, unknown>,
): Promise<EdgeFunctionResult<T>> {
  const env = getSupabasePublicEnv();
  if (!env) {
    return {
      ok: false,
      error:
        "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    };
  }

  const url = `${env.url.replace(/\/$/, "")}/functions/v1/${name}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.publishableKey}`,
        apikey: env.publishableKey,
      },
      body: JSON.stringify(body),
    });

    const json = (await res.json().catch(() => ({}))) as T & {
      error?: string;
      detail?: string;
      message?: string;
    };

    if (!res.ok) {
      return {
        ok: false,
        error: json.error || json.message || `Request failed (${res.status})`,
        status: res.status,
        detail: json.detail,
      };
    }

    return { ok: true, data: json as T };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
}
