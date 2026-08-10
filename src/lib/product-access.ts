/**
 * Private product surfaces (demo, product tour, deck, agent, platform).
 * Unlock with the same hashed access code used for docs when configured,
 * or PRODUCT_ACCESS_CODE / NEXT_PUBLIC_PRODUCT_ACCESS_CODE.
 */

import {
  getDocsAccessCodeHash,
  getDocsAccessCodePlaintext,
  normalizeAccessCode,
  sha256Hex,
} from "@/lib/docs-access";

export const PRODUCT_ACCESS_STORAGE_KEY = "policywell_product_access_v1";

export const PRODUCT_ACCESS_SURFACES = [
  "demo",
  "product",
  "deck",
  "agent",
  "platform",
] as const;

export type ProductAccessSurface = (typeof PRODUCT_ACCESS_SURFACES)[number];

export const PRODUCT_ACCESS_SURFACE_LABELS: Record<
  ProductAccessSurface,
  string
> = {
  demo: "Product demo",
  product: "Interactive product tour",
  deck: "Investor / product deck",
  agent: "Insurance intelligence agent",
  platform: "Platform overview",
};

export function surfaceFromPathname(pathname: string): ProductAccessSurface {
  const clean = pathname.replace(/\/$/, "") || "/";
  if (clean.startsWith("/demo")) return "demo";
  if (clean.startsWith("/product")) return "product";
  if (clean.startsWith("/deck")) return "deck";
  if (clean.startsWith("/agent")) return "agent";
  if (clean.startsWith("/platform")) return "platform";
  return "demo";
}

function getProductAccessCodeHash(): string {
  return (process.env.NEXT_PUBLIC_PRODUCT_ACCESS_CODE_HASH ?? "")
    .trim()
    .toLowerCase();
}

function getProductAccessCodePlaintext(): string {
  return (process.env.NEXT_PUBLIC_PRODUCT_ACCESS_CODE ?? "").trim();
}

/** Prefer product-specific credentials, else fall back to docs credentials. */
export function isProductUnlockConfigured(): boolean {
  return Boolean(
    getProductAccessCodeHash() ||
      getProductAccessCodePlaintext() ||
      getDocsAccessCodeHash() ||
      getDocsAccessCodePlaintext(),
  );
}

export async function verifyProductAccessCode(input: string): Promise<boolean> {
  const normalized = normalizeAccessCode(input);
  if (!normalized) return false;

  const productHash = getProductAccessCodeHash();
  if (productHash) {
    return (await sha256Hex(normalized)) === productHash;
  }

  const productPlain = getProductAccessCodePlaintext();
  if (productPlain) {
    return normalized === productPlain;
  }

  const docsHash = getDocsAccessCodeHash();
  if (docsHash) {
    return (await sha256Hex(normalized)) === docsHash;
  }

  const docsPlain = getDocsAccessCodePlaintext();
  if (docsPlain) {
    return normalized === docsPlain;
  }

  return false;
}

export function readProductAccessUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(PRODUCT_ACCESS_STORAGE_KEY) === "unlocked";
  } catch {
    return false;
  }
}

export function persistProductAccessUnlocked() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(PRODUCT_ACCESS_STORAGE_KEY, "unlocked");
  } catch {
    // ignore
  }
}

export function clearProductAccessUnlocked() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(PRODUCT_ACCESS_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export type AccessRequestPayload = {
  name: string;
  email: string;
  company: string;
  role: string;
  surface: ProductAccessSurface;
  notes: string;
  pagePath: string;
};

export function buildAccessRequestMailto(payload: AccessRequestPayload): string {
  const surface = PRODUCT_ACCESS_SURFACE_LABELS[payload.surface];
  const subject = encodeURIComponent(
    `PolicyWell access request — ${surface}`,
  );
  const body = encodeURIComponent(
    [
      "Access request for proprietary PolicyWell product materials.",
      "",
      `Name: ${payload.name}`,
      `Email: ${payload.email}`,
      `Company: ${payload.company || "—"}`,
      `Role: ${payload.role || "—"}`,
      `Requested: ${surface}`,
      `Page: ${payload.pagePath}`,
      "",
      "Notes:",
      payload.notes || "—",
    ].join("\n"),
  );
  return `mailto:info@policywell.ai?subject=${subject}&body=${body}`;
}

/** Optional webhook (Formspree / custom). */
export function getAccessRequestWebhook(): string {
  return (process.env.NEXT_PUBLIC_ACCESS_REQUEST_WEBHOOK ?? "").trim();
}

export async function submitAccessRequest(
  payload: AccessRequestPayload,
): Promise<{ ok: boolean; via: "webhook" | "mailto" }> {
  const webhook = getAccessRequestWebhook();
  if (webhook) {
    const res = await fetch(webhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        ...payload,
        surfaceLabel: PRODUCT_ACCESS_SURFACE_LABELS[payload.surface],
        source: "policywell-request-access",
      }),
    });
    if (!res.ok) {
      throw new Error(`Access request failed (${res.status})`);
    }
    return { ok: true, via: "webhook" };
  }

  // Static-friendly fallback: open mail client with a prefilled request.
  if (typeof window !== "undefined") {
    window.location.href = buildAccessRequestMailto(payload);
  }
  return { ok: true, via: "mailto" };
}
