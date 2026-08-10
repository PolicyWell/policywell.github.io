import { describe, expect, it } from "vitest";
import { isProtectedPath, loginRedirectPath } from "./auth-paths";

describe("isProtectedPath", () => {
  it("protects /app and nested paths", () => {
    expect(isProtectedPath("/app")).toBe(true);
    expect(isProtectedPath("/app/")).toBe(true);
    expect(isProtectedPath("/app/settings")).toBe(true);
  });

  it("protects /cases/*, /policies/*, and /upload", () => {
    expect(isProtectedPath("/cases")).toBe(true);
    expect(isProtectedPath("/cases/abc")).toBe(true);
    expect(isProtectedPath("/policies")).toBe(true);
    expect(isProtectedPath("/policies/xyz/")).toBe(true);
    expect(isProtectedPath("/upload")).toBe(true);
    expect(isProtectedPath("/upload/")).toBe(true);
  });

  it("leaves marketing and auth pages public", () => {
    expect(isProtectedPath("/")).toBe(false);
    expect(isProtectedPath("/login")).toBe(false);
    expect(isProtectedPath("/login/")).toBe(false);
    expect(isProtectedPath("/pricing")).toBe(false);
    expect(isProtectedPath("/forgot-password")).toBe(false);
    expect(isProtectedPath("/auth/callback")).toBe(false);
  });
});

describe("loginRedirectPath", () => {
  it("encodes next destination", () => {
    expect(loginRedirectPath("/cases/")).toBe(
      "/login/?next=%2Fcases%2F",
    );
  });
});
