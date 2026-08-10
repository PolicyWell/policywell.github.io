import type { User } from "@supabase/supabase-js";
import type { TypedSupabaseClient } from "./client";

export type SignupProfileFields = {
  first_name: string;
  last_name: string;
  phone?: string | null;
};

/**
 * Ensure a public.profiles row exists for the authenticated user.
 * Never writes password fields — Auth owns credentials.
 */
export async function ensureProfileForUser(
  supabase: TypedSupabaseClient,
  user: User,
  fields?: Partial<SignupProfileFields>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const meta = user.user_metadata ?? {};
  const first_name =
    fields?.first_name?.trim() ||
    (typeof meta.first_name === "string" ? meta.first_name.trim() : "") ||
    null;
  const last_name =
    fields?.last_name?.trim() ||
    (typeof meta.last_name === "string" ? meta.last_name.trim() : "") ||
    null;
  const phoneRaw =
    fields?.phone !== undefined
      ? fields.phone
      : typeof meta.phone === "string"
        ? meta.phone
        : null;
  const phone = phoneRaw?.trim() ? phoneRaw.trim() : null;

  const payload = {
    id: user.id,
    first_name,
    last_name,
    phone,
    role: "consumer" as const,
  };

  // Reject accidental credential leakage into profile writes.
  for (const key of Object.keys(payload)) {
    if (/password/i.test(key)) {
      return { ok: false, error: "Refusing to write password fields to profiles." };
    }
  }

  const { data: existing, error: readError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (readError) {
    return { ok: false, error: readError.message };
  }

  if (!existing) {
    const { error } = await supabase.from("profiles").insert(payload);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      first_name,
      last_name,
      phone,
      // role intentionally omitted — clients cannot self-escalate
    })
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
