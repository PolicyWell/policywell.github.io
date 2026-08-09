/** Soft private-docs gate (client-side). Set NEXT_PUBLIC_DOCS_ACCESS_CODE to enable. */

export const DOCS_ACCESS_STORAGE_KEY = "policywell_docs_access";

export function getConfiguredDocsAccessCode(): string {
  return (process.env.NEXT_PUBLIC_DOCS_ACCESS_CODE ?? "").trim();
}

/** When a code is configured, `/docs` requires unlock. */
export function isDocsAccessGateEnabled(): boolean {
  return getConfiguredDocsAccessCode().length > 0;
}

export function normalizeAccessCode(code: string): string {
  return code.trim();
}

export function verifyDocsAccessCode(input: string): boolean {
  const expected = getConfiguredDocsAccessCode();
  if (!expected) return true;
  return normalizeAccessCode(input) === expected;
}

export function readDocsAccessUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  if (!isDocsAccessGateEnabled()) return true;
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
