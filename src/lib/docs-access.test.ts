import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getConfiguredDocsAccessCode,
  isDocsAccessGateEnabled,
  normalizeAccessCode,
  verifyDocsAccessCode,
} from "@/lib/docs-access";

describe("docs access gate", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("is disabled when no access code is configured", () => {
    vi.stubEnv("NEXT_PUBLIC_DOCS_ACCESS_CODE", "");
    expect(isDocsAccessGateEnabled()).toBe(false);
    expect(verifyDocsAccessCode("anything")).toBe(true);
  });

  it("requires the configured access code when enabled", () => {
    vi.stubEnv("NEXT_PUBLIC_DOCS_ACCESS_CODE", "harbor-docs");
    expect(isDocsAccessGateEnabled()).toBe(true);
    expect(getConfiguredDocsAccessCode()).toBe("harbor-docs");
    expect(verifyDocsAccessCode("harbor-docs")).toBe(true);
    expect(verifyDocsAccessCode("  harbor-docs  ")).toBe(true);
    expect(verifyDocsAccessCode("wrong")).toBe(false);
    expect(normalizeAccessCode("  x  ")).toBe("x");
  });
});
