import "server-only";

import { createClient as createServerSupabaseClient } from "../../../utils/supabase/server";

const POLICY_DOCUMENTS_BUCKET = "policy-documents";

/**
 * Create a short-lived signed URL for a private policy document.
 * Uses the caller's session + Storage RLS (not the service role).
 * Path must be `{case_id}/...` for an authorized case.
 */
export async function createPolicyDocumentSignedUrl(
  storagePath: string,
  expiresInSeconds = 60,
): Promise<{ signedUrl: string } | { error: string }> {
  const path = storagePath.trim().replace(/^\/+/, "");
  if (!path || path.includes("..")) {
    return { error: "Invalid storage path." };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Authentication required." };
  }

  const { data, error } = await supabase.storage
    .from(POLICY_DOCUMENTS_BUCKET)
    .createSignedUrl(path, expiresInSeconds);

  if (error || !data?.signedUrl) {
    return { error: error?.message ?? "Unable to create signed URL." };
  }
  return { signedUrl: data.signedUrl };
}

export { POLICY_DOCUMENTS_BUCKET };
