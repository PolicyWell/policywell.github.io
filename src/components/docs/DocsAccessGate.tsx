"use client";

import { useState, type FormEvent } from "react";
import { useDocsAccess } from "@/components/docs/DocsAccessProvider";

/** HiFi-style Access Restricted card. */
export function DocsAccessRestricted() {
  const { unlock, configured } = useDocsAccess();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const ok = await unlock(code);
      if (!ok) {
        setError(
          configured
            ? "That access code isn’t valid. Try again."
            : "Docs access isn’t configured for this deployment.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

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
          <button
            type="submit"
            className="pw-docs-access-submit"
            disabled={submitting}
          >
            {submitting ? "Checking…" : "Access"}
          </button>
        </form>
      </div>
    </div>
  );
}

export function DocsAccessGate({ children }: { children: React.ReactNode }) {
  const { ready, unlocked, lock } = useDocsAccess();

  // SSR + pre-hydrate: always restricted (no docs body in HTML).
  if (!ready || !unlocked) {
    return <DocsAccessRestricted />;
  }

  return (
    <>
      {children}
      <button type="button" className="pw-docs-access-lock" onClick={lock}>
        Lock docs
      </button>
    </>
  );
}
