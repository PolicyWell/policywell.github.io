/**
 * Private product surfaces (demo, product tour, deck, agent, platform, API).
 * Unlock with the same hashed access code used for docs when configured,
 * or PRODUCT_ACCESS_CODE / NEXT_PUBLIC_PRODUCT_ACCESS_CODE.
 */

import {
  getDocsAccessCodeHash,
  getDocsAccessCodePlaintext,
  normalizeAccessCode,
  sha256Hex,
} from "@/lib/docs-access";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { invokeEdgeFunction } from "@/lib/supabase/functions";
import {
  isUniversalAccessConfigured,
  verifyUniversalAccessCode,
} from "@/lib/universal-access";

export const PRODUCT_ACCESS_STORAGE_KEY = "policywell_product_access_v1";

export const PRODUCT_ACCESS_SURFACES = [
  "demo",
  "product",
  "deck",
  "agent",
  "platform",
  "api",
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
  api: "Developer API",
};

export function surfaceFromPathname(pathname: string): ProductAccessSurface {
  const clean = pathname.replace(/\/$/, "") || "/";
  if (clean.startsWith("/demo")) return "demo";
  if (clean.startsWith("/product")) return "product";
  if (clean.startsWith("/deck")) return "deck";
  if (clean.startsWith("/agent")) return "agent";
  if (clean.startsWith("/platform")) return "platform";
  if (clean === "/api" || clean.startsWith("/api/")) return "api";
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

/**
 * Unlock is available when a static env code is set, or when Supabase can
 * verify emailed one-time codes via the verify-access-code Edge Function.
 */
export function isProductUnlockConfigured(): boolean {
  return Boolean(
    isUniversalAccessConfigured() ||
      getProductAccessCodeHash() ||
      getProductAccessCodePlaintext() ||
      getDocsAccessCodeHash() ||
      getDocsAccessCodePlaintext() ||
      isSupabaseConfigured(),
  );
}

async function verifyIssuedAccessCode(
  input: string,
  surface?: ProductAccessSurface,
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const result = await invokeEdgeFunction<{ ok?: boolean }>(
    "verify-access-code",
    {
      code: input,
      surface,
    },
  );
  return result.ok && result.data.ok === true;
}

export async function verifyProductAccessCode(
  input: string,
  surface?: ProductAccessSurface,
): Promise<boolean> {
  const normalized = normalizeAccessCode(input);
  if (!normalized) return false;

  if (await verifyUniversalAccessCode(normalized)) {
    return true;
  }

  const productHash = getProductAccessCodeHash();
  if (productHash && (await sha256Hex(normalized)) === productHash) {
    return true;
  }

  const productPlain = getProductAccessCodePlaintext();
  if (productPlain && normalized === productPlain) {
    return true;
  }

  const docsHash = getDocsAccessCodeHash();
  if (docsHash && (await sha256Hex(normalized)) === docsHash) {
    return true;
  }

  const docsPlain = getDocsAccessCodePlaintext();
  if (docsPlain && normalized === docsPlain) {
    return true;
  }

  return verifyIssuedAccessCode(normalized, surface);
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

/** Optional webhook (Formspree / custom) — used only if Edge Function is unavailable. */
export function getAccessRequestWebhook(): string {
  return (process.env.NEXT_PUBLIC_ACCESS_REQUEST_WEBHOOK ?? "").trim();
}

export type AccessRequestSubmitResult = {
  ok: boolean;
  via: "edge" | "webhook" | "mailto";
  message?: string;
  emailedTo?: string;
};

/**
 * Prefer Supabase Edge Function (emails a workable code).
 * Falls back to Formspree webhook, then mailto.
 */
export async function submitAccessRequest(
  payload: AccessRequestPayload,
): Promise<AccessRequestSubmitResult> {
  if (isSupabaseConfigured()) {
    const result = await invokeEdgeFunction<{
      ok?: boolean;
      message?: string;
      emailedTo?: string;
      error?: string;
    }>("request-access", {
      ...payload,
      siteOrigin:
        typeof window !== "undefined" ? window.location.origin : undefined,
    });

    if (result.ok) {
      return {
        ok: true,
        via: "edge",
        message:
          result.data.message ??
          "Check your email for your access code.",
        emailedTo: result.data.emailedTo,
      };
    }

    // If Resend isn’t configured yet, surface the server message.
    if (result.status && result.status >= 500) {
      throw new Error(result.error);
    }
    throw new Error(result.error);
  }

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

  if (typeof window !== "undefined") {
    window.location.href = buildAccessRequestMailto(payload);
  }
  return { ok: true, via: "mailto" };
}
