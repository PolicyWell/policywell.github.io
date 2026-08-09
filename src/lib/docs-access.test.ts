import { createHash } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getDocsAccessCodeHash,
  getDocsAccessCodePlaintext,
  isDocsAccessGateEnabled,
  isDocsUnlockConfigured,
  normalizeAccessCode,
  sha256Hex,
  verifyDocsAccessCode,
} from "@/lib/docs-access";

describe("docs access gate (always private)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("is always enabled", () => {
    vi.stubEnv("NEXT_PUBLIC_DOCS_ACCESS_CODE", "");
    vi.stubEnv("NEXT_PUBLIC_DOCS_ACCESS_CODE_HASH", "");
    expect(isDocsAccessGateEnabled()).toBe(true);
  });

  it("fails closed when no credential is configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_DOCS_ACCESS_CODE", "");
    vi.stubEnv("NEXT_PUBLIC_DOCS_ACCESS_CODE_HASH", "");
    expect(isDocsUnlockConfigured()).toBe(false);
    expect(await verifyDocsAccessCode("anything")).toBe(false);
  });

  it("verifies against SHA-256 hash when configured", async () => {
    const code = "harbor-docs";
    const hash = createHash("sha256").update(code).digest("hex");
    vi.stubEnv("NEXT_PUBLIC_DOCS_ACCESS_CODE_HASH", hash);
    vi.stubEnv("NEXT_PUBLIC_DOCS_ACCESS_CODE", "");
    expect(isDocsUnlockConfigured()).toBe(true);
    expect(getDocsAccessCodeHash()).toBe(hash);
    expect(await verifyDocsAccessCode(code)).toBe(true);
    expect(await verifyDocsAccessCode("  harbor-docs  ")).toBe(true);
    expect(await verifyDocsAccessCode("wrong")).toBe(false);
    expect(await sha256Hex(code)).toBe(hash);
  });

  it("supports plaintext local-dev fallback", async () => {
    vi.stubEnv("NEXT_PUBLIC_DOCS_ACCESS_CODE_HASH", "");
    vi.stubEnv("NEXT_PUBLIC_DOCS_ACCESS_CODE", "local-secret");
    expect(getDocsAccessCodePlaintext()).toBe("local-secret");
    expect(await verifyDocsAccessCode("local-secret")).toBe(true);
    expect(await verifyDocsAccessCode("nope")).toBe(false);
    expect(normalizeAccessCode("  x  ")).toBe("x");
  });
});
