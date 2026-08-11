/**
 * Pear X 27 live-demo access — separate from product/docs gates.
 * Accepts PEARX27 (case-insensitive). Hash ships to the client; plaintext does not.
 */

import { normalizeAccessCode, sha256Hex } from "@/lib/docs-access";

export const PEAR_ACCESS_STORAGE_KEY = "policywell_pear_access_v1";

/** SHA-256 of "PEARX27" — unlock code for /pear */
export const PEAR_ACCESS_CODE_HASH =
  "a951c83b034ac5632a7a90491f5f0e18c3191f6e92e777a0a0a43c97f258a3bb";

export const PEAR_ACCESS_CODE_HINT = "PEARX27";

function getOverrideHash(): string {
  return (process.env.NEXT_PUBLIC_PEAR_ACCESS_CODE_HASH ?? "")
    .trim()
    .toLowerCase();
}

function getOverridePlaintext(): string {
  return (process.env.NEXT_PUBLIC_PEAR_ACCESS_CODE ?? "").trim();
}

export async function verifyPearAccessCode(input: string): Promise<boolean> {
  const normalized = normalizeAccessCode(input);
  if (!normalized) return false;

  const overridePlain = getOverridePlaintext();
  if (overridePlain) {
    return normalized.toUpperCase() === overridePlain.toUpperCase();
  }

  const digest = await sha256Hex(normalized.toUpperCase());
  const expected = getOverrideHash() || PEAR_ACCESS_CODE_HASH;
  return digest === expected;
}

export function readPearAccessUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(PEAR_ACCESS_STORAGE_KEY) === "unlocked";
  } catch {
    return false;
  }
}

export function persistPearAccessUnlocked() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(PEAR_ACCESS_STORAGE_KEY, "unlocked");
  } catch {
    // ignore
  }
}

export function clearPearAccessUnlocked() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(PEAR_ACCESS_STORAGE_KEY);
  } catch {
    // ignore
  }
}
