/**
 * Universal ops access code — unlocks docs + all private product surfaces.
 *
 * Production/Pages: build hashes UNIVERSAL_ACCESS_CODE into
 * NEXT_PUBLIC_UNIVERSAL_ACCESS_CODE_HASH (plaintext never ships).
 * Local: set UNIVERSAL_ACCESS_CODE or NEXT_PUBLIC_UNIVERSAL_ACCESS_CODE.
 */

import { normalizeAccessCode, sha256Hex } from "@/lib/docs-access";

export function getUniversalAccessCodeHash(): string {
  return (process.env.NEXT_PUBLIC_UNIVERSAL_ACCESS_CODE_HASH ?? "")
    .trim()
    .toLowerCase();
}

/** Dev-only plaintext fallback (avoid on Pages builds). */
export function getUniversalAccessCodePlaintext(): string {
  return (process.env.NEXT_PUBLIC_UNIVERSAL_ACCESS_CODE ?? "").trim();
}

export function isUniversalAccessConfigured(): boolean {
  return Boolean(
    getUniversalAccessCodeHash() || getUniversalAccessCodePlaintext(),
  );
}

/** True when the input matches the configured universal access code. */
export async function verifyUniversalAccessCode(input: string): Promise<boolean> {
  const normalized = normalizeAccessCode(input);
  if (!normalized) return false;

  const hash = getUniversalAccessCodeHash();
  if (hash) {
    const digest = await sha256Hex(normalized);
    if (digest === hash) return true;
  }

  const plain = getUniversalAccessCodePlaintext();
  if (plain && normalized === plain) return true;

  return false;
}
