import "server-only";

import { createServiceRoleClient } from "./admin";
import {
  isSupabaseAuthUserId,
  persistDocumentToSupabase,
  type PersistDocumentFailure,
  type PersistDocumentSuccess,
} from "./persist-document";

/**
 * Server-only persist using the service-role client (bypasses RLS).
 * `ownerUserId` must still exist in auth.users for FK integrity.
 */
export async function persistDocumentWithServiceRole(input: {
  ownerUserId: string;
  file: Blob;
  filename: string;
  mimeType?: string | null;
}): Promise<PersistDocumentSuccess | PersistDocumentFailure> {
  if (!isSupabaseAuthUserId(input.ownerUserId)) {
    return {
      ok: false,
      error:
        "INGEST_OWNER_USER_ID / X-PolicyWell-Owner-User-Id must be a Supabase Auth user UUID.",
    };
  }

  try {
    const supabase = createServiceRoleClient();
    return persistDocumentToSupabase({
      supabase,
      ownerUserId: input.ownerUserId,
      file: input.file,
      filename: input.filename,
      mimeType: input.mimeType,
    });
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Service-role persist failed.",
    };
  }
}

export function resolveIngestOwnerUserId(req: Request): string | null {
  const header = req.headers.get("x-policywell-owner-user-id")?.trim();
  if (header && isSupabaseAuthUserId(header)) return header;
  const env = process.env.INGEST_OWNER_USER_ID?.trim();
  if (env && isSupabaseAuthUserId(env)) return env;
  return null;
}

export function hasServiceRoleConfigured(): boolean {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
  return key.length > 0 && !key.startsWith("sb_publishable_");
}
