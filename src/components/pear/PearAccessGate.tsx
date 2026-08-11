"use client";

import {
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  clearPearAccessUnlocked,
  persistPearAccessUnlocked,
  readPearAccessUnlocked,
  verifyPearAccessCode,
} from "@/lib/pear-access";

export function PearAccessGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get("code") ?? params.get("access_code");

    void (async () => {
      if (fromQuery && (await verifyPearAccessCode(fromQuery))) {
        persistPearAccessUnlocked();
        setUnlocked(true);
        params.delete("code");
        params.delete("access_code");
        const next = `${window.location.pathname}${
          params.toString() ? `?${params.toString()}` : ""
        }${window.location.hash}`;
        window.history.replaceState({}, "", next);
        setReady(true);
        return;
      }
      setUnlocked(readPearAccessUnlocked());
      setReady(true);
    })();
  }, []);

  async function onUnlock(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const ok = await verifyPearAccessCode(code);
      if (!ok) {
        setError("That code isn’t valid for this Pear live demo.");
        return;
      }
      persistPearAccessUnlocked();
      setUnlocked(true);
    } finally {
      setBusy(false);
    }
  }

  if (!ready) {
    return (
      <div className="pw-access">
        <div className="pw-access-card">
          <p className="pw-access-lede">Checking access…</p>
        </div>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="pw-access">
        <div className="pw-access-card">
          <img
            src="/logo-64.png?v=20260727d"
            alt=""
            width={40}
            height={40}
            className="pw-access-mark"
            decoding="async"
          />
          <p className="pw-access-eyebrow">Private · Pear X 27</p>
          <h1 className="pw-access-title">Enter live demo code</h1>
          <p className="pw-access-lede">
            This PolicyWell agent is reserved for the Pear X 27 walkthrough.
            Enter the access code you were given to continue.
          </p>
          <form className="pw-access-form" onSubmit={onUnlock}>
            <label className="pw-access-label" htmlFor="pear-code">
              Access code
            </label>
            <input
              id="pear-code"
              className="pw-access-input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              placeholder="••••••••"
              required
            />
            {error ? <p className="pw-access-error">{error}</p> : null}
            <button
              type="submit"
              className="pw-access-submit"
              disabled={busy || !code.trim()}
            >
              {busy ? "Unlocking…" : "Unlock agent"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        className="absolute top-3 right-3 z-10 text-[10px] uppercase tracking-wider text-stone/70 hover:text-pine"
        onClick={() => {
          clearPearAccessUnlocked();
          setUnlocked(false);
          setCode("");
        }}
      >
        Lock
      </button>
      {children}
    </div>
  );
}
