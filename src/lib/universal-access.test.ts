import { createHash } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  isUniversalAccessConfigured,
  verifyUniversalAccessCode,
} from "@/lib/universal-access";

describe("universal access code", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("fails closed when unset", async () => {
    vi.stubEnv("NEXT_PUBLIC_UNIVERSAL_ACCESS_CODE_HASH", "");
    vi.stubEnv("NEXT_PUBLIC_UNIVERSAL_ACCESS_CODE", "");
    expect(isUniversalAccessConfigured()).toBe(false);
    expect(await verifyUniversalAccessCode("anything")).toBe(false);
  });

  it("accepts matching hash", async () => {
    const code = "Universal-Test-Code";
    const hash = createHash("sha256").update(code).digest("hex");
    vi.stubEnv("NEXT_PUBLIC_UNIVERSAL_ACCESS_CODE_HASH", hash);
    vi.stubEnv("NEXT_PUBLIC_UNIVERSAL_ACCESS_CODE", "");
    expect(isUniversalAccessConfigured()).toBe(true);
    expect(await verifyUniversalAccessCode(code)).toBe(true);
    expect(await verifyUniversalAccessCode("wrong")).toBe(false);
  });

  it("accepts plaintext local fallback", async () => {
    vi.stubEnv("NEXT_PUBLIC_UNIVERSAL_ACCESS_CODE_HASH", "");
    vi.stubEnv("NEXT_PUBLIC_UNIVERSAL_ACCESS_CODE", "ops-backdoor");
    expect(await verifyUniversalAccessCode("ops-backdoor")).toBe(true);
    expect(await verifyUniversalAccessCode("nope")).toBe(false);
  });
});
