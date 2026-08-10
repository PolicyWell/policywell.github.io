"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  clearProductAccessUnlocked,
  isProductUnlockConfigured,
  persistProductAccessUnlocked,
  PRODUCT_ACCESS_SURFACE_LABELS,
  readProductAccessUnlocked,
  submitAccessRequest,
  surfaceFromPathname,
  verifyProductAccessCode,
  type ProductAccessSurface,
} from "@/lib/product-access";

type Mode = "request" | "code";

export function RequestAccessGate({
  children,
  surface: surfaceProp,
  title = "Request access",
  lede = "This area shows proprietary PolicyWell product materials. Request access and we’ll send an unlock code, or enter a code if you already have one.",
}: {
  children: ReactNode;
  surface?: ProductAccessSurface;
  title?: string;
  lede?: string;
}) {
  const pathname = usePathname() || "/";
  const surface = surfaceProp ?? surfaceFromPathname(pathname);
  const surfaceLabel = PRODUCT_ACCESS_SURFACE_LABELS[surface];

  const [ready, setReady] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [mode, setMode] = useState<Mode>("request");
  const [submitted, setSubmitted] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [notes, setNotes] = useState("");
  const [code, setCode] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get("code") ?? params.get("access_code");

    void (async () => {
      if (fromQuery && (await verifyProductAccessCode(fromQuery, surface))) {
        persistProductAccessUnlocked();
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
      setUnlocked(readProductAccessUnlocked());
      setReady(true);
    })();
  }, [surface]);

  async function onRequest(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid work email.");
      return;
    }
    setBusy(true);
    try {
      const result = await submitAccessRequest({
        name: name.trim(),
        email: email.trim(),
        company: company.trim(),
        role: role.trim(),
        surface,
        notes: notes.trim(),
        pagePath: pathname,
      });
      setSubmitMessage(
        result.via === "edge"
          ? result.message ??
              `Check ${result.emailedTo ?? "your email"} for a workable access code.`
          : result.via === "webhook"
            ? "Request received. We’ll email an access code shortly."
            : "Your mail app should open with the request. We’ll reply with a code.",
      );
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Couldn’t send your request. Email info@policywell.ai instead.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function onUnlock(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const ok = await verifyProductAccessCode(code, surface);
      if (!ok) {
        setError(
          isProductUnlockConfigured()
            ? "That access code isn’t valid. Try again."
            : "Access codes aren’t configured for this deployment yet.",
        );
        return;
      }
      persistProductAccessUnlocked();
      setUnlocked(true);
    } finally {
      setBusy(false);
    }
  }

  if (!ready || !unlocked) {
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
          <p className="pw-access-eyebrow">Private · {surfaceLabel}</p>
          <h1 className="pw-access-title">{title}</h1>
          <p className="pw-access-lede">{lede}</p>

          <div className="pw-access-tabs" role="tablist" aria-label="Access method">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "request"}
              className={`pw-access-tab${mode === "request" ? " is-active" : ""}`}
              onClick={() => {
                setMode("request");
                setError("");
              }}
            >
              Request access
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "code"}
              className={`pw-access-tab${mode === "code" ? " is-active" : ""}`}
              onClick={() => {
                setMode("code");
                setError("");
              }}
            >
              I have a code
            </button>
          </div>

          {mode === "request" ? (
            submitted ? (
              <div className="pw-access-success">
                <p className="pw-access-success-title">Check your email</p>
                <p className="pw-access-lede">
                  Thanks{name ? `, ${name.split(" ")[0]}` : ""}.{" "}
                  {submitMessage || (
                    <>
                      We emailed a workable access code to{" "}
                      <strong>{email}</strong>.
                    </>
                  )}
                </p>
                <button
                  type="button"
                  className="pw-access-submit pw-access-submit-secondary"
                  onClick={() => setMode("code")}
                >
                  Enter access code
                </button>
              </div>
            ) : (
              <form className="pw-access-form" onSubmit={onRequest}>
                <label className="pw-access-label" htmlFor="access-name">
                  Name
                </label>
                <input
                  id="access-name"
                  className="pw-access-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                />
                <label className="pw-access-label" htmlFor="access-email">
                  Work email
                </label>
                <input
                  id="access-email"
                  type="email"
                  className="pw-access-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
                <label className="pw-access-label" htmlFor="access-company">
                  Company
                </label>
                <input
                  id="access-company"
                  className="pw-access-input"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  autoComplete="organization"
                />
                <label className="pw-access-label" htmlFor="access-role">
                  Role
                </label>
                <input
                  id="access-role"
                  className="pw-access-input"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Advisor, carrier, investor…"
                />
                <label className="pw-access-label" htmlFor="access-notes">
                  Why do you need access?
                </label>
                <textarea
                  id="access-notes"
                  className="pw-access-input pw-access-textarea"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder={`Interested in ${surfaceLabel.toLowerCase()}…`}
                />
                {error ? (
                  <p className="pw-access-error" role="alert">
                    {error}
                  </p>
                ) : null}
                <button
                  type="submit"
                  className="pw-access-submit"
                  disabled={busy}
                >
                  {busy ? "Sending…" : "Request access"}
                </button>
              </form>
            )
          ) : (
            <form className="pw-access-form" onSubmit={onUnlock}>
              <label className="pw-access-label" htmlFor="access-code">
                Access code
              </label>
              <input
                id="access-code"
                type="password"
                className="pw-access-input"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Your access code..."
                autoComplete="off"
                autoFocus
              />
              {error ? (
                <p className="pw-access-error" role="alert">
                  {error}
                </p>
              ) : null}
              <button type="submit" className="pw-access-submit" disabled={busy}>
                {busy ? "Checking…" : "Unlock"}
              </button>
            </form>
          )}

          <p className="pw-access-footnote">
            Prefer a live walkthrough?{" "}
            <Link href="/book-a-call/">Book a call</Link>
            {" · "}
            <Link href="/contact/">Contact</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
      <button
        type="button"
        className="pw-access-lock"
        onClick={() => {
          clearProductAccessUnlocked();
          setUnlocked(false);
          setCode("");
        }}
      >
        Lock product
      </button>
    </>
  );
}

/** Compact teaser for public pages (e.g. homepage) that would otherwise embed IP. */
export function RequestAccessTeaser({
  surface,
  title,
  description,
  href,
}: {
  surface: ProductAccessSurface;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <div className="pw-access-teaser">
      <p className="pw-access-eyebrow">Private · {PRODUCT_ACCESS_SURFACE_LABELS[surface]}</p>
      <h2 className="pw-access-teaser-title">{title}</h2>
      <p className="pw-access-lede">{description}</p>
      <Link href={href} className="pw-btn">
        Request access
      </Link>
    </div>
  );
}
