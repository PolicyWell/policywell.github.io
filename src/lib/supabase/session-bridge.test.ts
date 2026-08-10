import { describe, expect, it } from "vitest";
import type { User } from "@supabase/supabase-js";
import {
  defaultPostLoginPath,
  displayNameFromAuth,
  isSupabaseUserId,
  mapProfileRoleToUserRole,
  sessionUserFromAuth,
} from "./session-bridge";

function fakeUser(partial: Partial<User> & { id: string }): User {
  return {
    app_metadata: {},
    user_metadata: {},
    aud: "authenticated",
    created_at: new Date().toISOString(),
    ...partial,
  } as User;
}

describe("session-bridge", () => {
  it("detects supabase uuids vs demo ids", () => {
    expect(isSupabaseUserId("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11")).toBe(true);
    expect(isSupabaseUserId("user_alex")).toBe(false);
  });

  it("maps profile roles into workspace roles", () => {
    expect(mapProfileRoleToUserRole("consumer")).toBe("policyholder");
    expect(mapProfileRoleToUserRole("producer")).toBe("advisor");
    expect(mapProfileRoleToUserRole("agency_admin")).toBe("imo");
    expect(mapProfileRoleToUserRole("policywell_admin")).toBe("broker_dealer");
  });

  it("builds a SessionUser from auth + profile fields", () => {
    const user = fakeUser({
      id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      email: "alex@policywell.ai",
      user_metadata: { full_name: "Alex Rivera" },
    });
    const session = sessionUserFromAuth(user, "producer", "Alex", "Rivera");
    expect(session).toEqual({
      id: user.id,
      email: "alex@policywell.ai",
      name: "Alex Rivera",
      role: "advisor",
    });
  });

  it("falls back to email local-part for display name", () => {
    const user = fakeUser({
      id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      email: "casey@policywell.ai",
    });
    expect(displayNameFromAuth(user)).toBe("casey");
  });

  it("routes post-login by role", () => {
    expect(defaultPostLoginPath("policyholder")).toBe("/app/");
    expect(defaultPostLoginPath("advisor")).toBe("/clients/");
    expect(defaultPostLoginPath("imo")).toBe("/imo/");
  });
});
