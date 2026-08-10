/**
 * Private docs access — always on, fail closed.
 *
 * Production/Pages: build injects NEXT_PUBLIC_DOCS_ACCESS_CODE_HASH (SHA-256).
 * Local dev: set DOCS_ACCESS_CODE or NEXT_PUBLIC_DOCS_ACCESS_CODE in .env.local.
 * Emailed one-time codes are verified via Supabase Edge Function when configured.
 */

import { isSupabaseConfigured } from "@/lib/supabase/env";
import { invokeEdgeFunction } from "@/lib/supabase/functions";
import {
  isUniversalAccessConfigured,
  verifyUniversalAccessCode,
} from "@/lib/universal-access";

export const DOCS_ACCESS_STORAGE_KEY = "policywell_docs_access_v2";

export function getDocsAccessCodeHash(): string {
  return (process.env.NEXT_PUBLIC_DOCS_ACCESS_CODE_HASH ?? "").trim().toLowerCase();
}

/** Dev-only plaintext fallback (never relied on for Pages builds). */
export function getDocsAccessCodePlaintext(): string {
  return (process.env.NEXT_PUBLIC_DOCS_ACCESS_CODE ?? "").trim();
}

/** Gate is always enabled — docs are private. */
export function isDocsAccessGateEnabled(): boolean {
  return true;
}

export function normalizeAccessCode(code: string): string {
  return code.trim();
}

export async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const digest = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  // Node test / build fallback
  const { createHash } = await import("node:crypto");
  return createHash("sha256").update(value).digest("hex");
}

/**
 * Verify access code. Fail closed when neither hash nor plaintext is configured.
 */
export async function verifyDocsAccessCode(input: string): Promise<boolean> {
  const normalized = normalizeAccessCode(input);
  if (!normalized) return false;

  if (await verifyUniversalAccessCode(normalized)) {
    return true;
  }

  const hash = getDocsAccessCodeHash();
  if (hash) {
    const digest = await sha256Hex(normalized);
    if (digest === hash) return true;
  }

  const plain = getDocsAccessCodePlaintext();
  if (plain && normalized === plain) {
    return true;
  }

  if (isSupabaseConfigured()) {
    const result = await invokeEdgeFunction<{ ok?: boolean }>(
      "verify-access-code",
      { code: normalized, surface: "docs" },
    );
    return result.ok && result.data.ok === true;
  }

  return false;
}

/** True when some unlock credential is configured for this build. */
export function isDocsUnlockConfigured(): boolean {
  return Boolean(
    isUniversalAccessConfigured() ||
      getDocsAccessCodeHash() ||
      getDocsAccessCodePlaintext() ||
      isSupabaseConfigured(),
  );
}

export function readDocsAccessUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(DOCS_ACCESS_STORAGE_KEY) === "unlocked";
  } catch {
    return false;
  }
}

export function persistDocsAccessUnlocked() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(DOCS_ACCESS_STORAGE_KEY, "unlocked");
  } catch {
    // private mode / blocked storage
  }
}

export function clearDocsAccessUnlocked() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(DOCS_ACCESS_STORAGE_KEY);
  } catch {
    // ignore
  }
}
