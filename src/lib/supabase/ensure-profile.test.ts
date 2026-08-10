import { describe, expect, it, vi } from "vitest";
import type { User } from "@supabase/supabase-js";
import { ensureProfileForUser } from "./ensure-profile";
import type { TypedSupabaseClient } from "./client";

function mockClient(opts: {
  existing: boolean;
  insertError?: string;
  updateError?: string;
}) {
  const insert = vi.fn().mockResolvedValue({
    error: opts.insertError ? { message: opts.insertError } : null,
  });
  const updateEq = vi.fn().mockResolvedValue({
    error: opts.updateError ? { message: opts.updateError } : null,
  });
  const update = vi.fn().mockReturnValue({ eq: updateEq });
  const maybeSingle = vi.fn().mockResolvedValue({
    data: opts.existing ? { id: "user-1" } : null,
    error: null,
  });
  const eq = vi.fn().mockReturnValue({ maybeSingle });
  const select = vi.fn().mockReturnValue({ eq });
  const from = vi.fn().mockReturnValue({ select, insert, update });

  return {
    client: { from } as unknown as TypedSupabaseClient,
    insert,
    update,
    updateEq,
  };
}

const user = {
  id: "user-1",
  user_metadata: {
    first_name: "Ada",
    last_name: "Lovelace",
    phone: "555-0100",
  },
} as unknown as User;

describe("ensureProfileForUser", () => {
  it("inserts consumer profile without password fields on first signup", async () => {
    const { client, insert } = mockClient({ existing: false });
    const result = await ensureProfileForUser(client, user, {
      first_name: "Ada",
      last_name: "Lovelace",
      phone: "555-0100",
    });
    expect(result).toEqual({ ok: true });
    expect(insert).toHaveBeenCalledWith({
      id: "user-1",
      first_name: "Ada",
      last_name: "Lovelace",
      phone: "555-0100",
      role: "consumer",
    });
    const payload = insert.mock.calls[0][0] as Record<string, unknown>;
    expect(Object.keys(payload).some((k) => /password/i.test(k))).toBe(false);
  });

  it("updates name/phone only when profile already exists", async () => {
    const { client, update, updateEq } = mockClient({ existing: true });
    const result = await ensureProfileForUser(client, user);
    expect(result).toEqual({ ok: true });
    expect(update).toHaveBeenCalledWith({
      first_name: "Ada",
      last_name: "Lovelace",
      phone: "555-0100",
    });
    expect(updateEq).toHaveBeenCalledWith("id", "user-1");
    const payload = update.mock.calls[0][0] as Record<string, unknown>;
    expect(payload).not.toHaveProperty("role");
    expect(payload).not.toHaveProperty("password");
  });
});
