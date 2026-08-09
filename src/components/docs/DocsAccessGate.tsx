"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import {
  clearDocsAccessUnlocked,
  isDocsAccessGateEnabled,
  persistDocsAccessUnlocked,
  readDocsAccessUnlocked,
  verifyDocsAccessCode,
} from "@/lib/docs-access";

/**
 * Private docs access screen (HiFi-style soft gate).
 * Enabled when NEXT_PUBLIC_DOCS_ACCESS_CODE is set.
 * Unlock persists for the browser session.
 */
export function DocsAccessGate({ children }: { children: ReactNode }) {
  const gateEnabled = isDocsAccessGateEnabled();
  const [ready, setReady] = useState(!gateEnabled);
  const [unlocked, setUnlocked] = useState(!gateEnabled);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!gateEnabled) {
      setUnlocked(true);
      setReady(true);
      return;
    }

    // Support shareable unlock links: /docs?code=...
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get("code") ?? params.get("access_code");
    if (fromQuery && verifyDocsAccessCode(fromQuery)) {
      persistDocsAccessUnlocked();
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

    setUnlocked(readDocsAccessUnlocked());
    setReady(true);
  }, [gateEnabled]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!verifyDocsAccessCode(code)) {
      setError("That access code isn’t valid. Try again.");
      return;
    }
    persistDocsAccessUnlocked();
    setError("");
    setUnlocked(true);
  }

  if (!ready) {
    return (
      <div className="pw-docs-access" aria-busy="true">
        <div className="pw-docs-access-card">
          <p className="pw-docs-access-muted">Checking access…</p>
        </div>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="pw-docs-access">
        <div className="pw-docs-access-card">
          <img
            src="/logo-64.png?v=20260727d"
            alt=""
            width={40}
            height={40}
            className="pw-docs-access-mark"
            decoding="async"
          />
          <h1 className="pw-docs-access-title">Access Restricted</h1>
          <p className="pw-docs-access-lede">
            To gain access to this doc, provide your access code below.
          </p>
          <form className="pw-docs-access-form" onSubmit={onSubmit}>
            <label htmlFor="docs-access-code" className="pw-docs-access-label">
              Enter access code
            </label>
            <input
              id="docs-access-code"
              name="access_code"
              type="password"
              autoComplete="off"
              autoFocus
              placeholder="Your access code..."
              className="pw-docs-access-input"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (error) setError("");
              }}
            />
            {error ? (
              <p className="pw-docs-access-error" role="alert">
                {error}
              </p>
            ) : null}
            <button type="submit" className="pw-docs-access-submit">
              Access
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
      {gateEnabled ? (
        <button
          type="button"
          className="pw-docs-access-lock"
          onClick={() => {
            clearDocsAccessUnlocked();
            setUnlocked(false);
            setCode("");
          }}
        >
          Lock docs
        </button>
      ) : null}
    </>
  );
}
