import { describe, expect, it } from "vitest";

/**
 * Mirrors the caching contract used by useSyncExternalStore snapshots.
 * Unstable empty arrays cause React error #185 on /agent and other pages.
 */
function makeJsonSnapshot<T>(read: () => string | null, fallback: T): () => T {
  let cache: { raw: string; parsed: T } | null = null;
  return () => {
    const raw = read();
    if (!raw) return fallback;
    if (cache?.raw === raw) return cache.parsed;
    try {
      const parsed = JSON.parse(raw) as T;
      cache = { raw, parsed };
      return parsed;
    } catch {
      return fallback;
    }
  };
}

describe("stable store snapshots", () => {
  it("returns the same empty fallback reference when storage is empty", () => {
    const EMPTY: string[] = [];
    const read = makeJsonSnapshot(() => null, EMPTY);
    expect(read()).toBe(EMPTY);
    expect(read()).toBe(read());
  });

  it("returns the same parsed reference while raw is unchanged", () => {
    let raw: string | null = JSON.stringify([{ id: "1" }]);
    const EMPTY: { id: string }[] = [];
    const read = makeJsonSnapshot(() => raw, EMPTY);
    const a = read();
    const b = read();
    expect(a).toBe(b);
    expect(a[0]?.id).toBe("1");
    raw = JSON.stringify([{ id: "2" }]);
    const c = read();
    expect(c).not.toBe(a);
    expect(c[0]?.id).toBe("2");
  });
});
