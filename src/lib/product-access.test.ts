import { createHash } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildAccessRequestMailto,
  isProductUnlockConfigured,
  surfaceFromPathname,
  verifyProductAccessCode,
} from "@/lib/product-access";

describe("product access request gate", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("maps routes to surfaces", () => {
    expect(surfaceFromPathname("/demo/")).toBe("demo");
    expect(surfaceFromPathname("/product")).toBe("product");
    expect(surfaceFromPathname("/deck/")).toBe("deck");
    expect(surfaceFromPathname("/agent")).toBe("agent");
    expect(surfaceFromPathname("/platform/")).toBe("platform");
  });

  it("fails closed without credentials", async () => {
    vi.stubEnv("NEXT_PUBLIC_PRODUCT_ACCESS_CODE", "");
    vi.stubEnv("NEXT_PUBLIC_PRODUCT_ACCESS_CODE_HASH", "");
    vi.stubEnv("NEXT_PUBLIC_DOCS_ACCESS_CODE", "");
    vi.stubEnv("NEXT_PUBLIC_DOCS_ACCESS_CODE_HASH", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    expect(isProductUnlockConfigured()).toBe(false);
    expect(await verifyProductAccessCode("secret")).toBe(false);
  });

  it("accepts docs access code hash as unlock", async () => {
    const code = "policywell";
    const hash = createHash("sha256").update(code).digest("hex");
    vi.stubEnv("NEXT_PUBLIC_DOCS_ACCESS_CODE_HASH", hash);
    vi.stubEnv("NEXT_PUBLIC_PRODUCT_ACCESS_CODE", "");
    expect(isProductUnlockConfigured()).toBe(true);
    expect(await verifyProductAccessCode(code)).toBe(true);
    expect(await verifyProductAccessCode("nope")).toBe(false);
  });

  it("builds a mailto access request", () => {
    const href = buildAccessRequestMailto({
      name: "Jordan Lee",
      email: "jordan@advisors.example",
      company: "Harbor Advisors",
      role: "Advisor",
      surface: "demo",
      notes: "Need a walkthrough",
      pagePath: "/demo/",
    });
    expect(href.startsWith("mailto:info@policywell.ai?")).toBe(true);
    expect(href).toContain(encodeURIComponent("Product demo"));
    expect(href).toContain(encodeURIComponent("jordan@advisors.example"));
  });
});
