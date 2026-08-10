"use client";

import Link from "next/link";
import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [pending, setPending] = useState(false);
  const supabaseReady = isSupabaseConfigured();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    setPending(true);
    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setError("Supabase is not configured.");
      setPending(false);
      return;
    }
    const origin = window.location.origin;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo: `${origin}/auth/update-password/` },
    );
    setPending(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setInfo("If an account exists for that email, a reset link is on its way.");
  }

  return (
    <div className="pw-login-card">
      <div className="pw-login-card-head">
        <div>
          <h1 className="pw-login-title">Forgot password?</h1>
          <p className="pw-login-lede">
            Enter your email and we&apos;ll send a secure reset link.
          </p>
        </div>
        <Link
          href="/login/"
          className="pw-login-close"
          aria-label="Back to sign in"
        >
          ×
        </Link>
      </div>

      {error && <p className="pw-login-error">{error}</p>}
      {info && <p className="pw-login-info">{info}</p>}

      <form onSubmit={(e) => void onSubmit(e)} className="pw-login-stack">
        <label className="sr-only" htmlFor="forgot-email">
          Email
        </label>
        <input
          id="forgot-email"
          className="pw-login-input"
          type="email"
          autoComplete="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button
          type="submit"
          className="pw-login-primary"
          disabled={pending || !supabaseReady}
        >
          {pending ? "Sending…" : "Continue"}
        </button>
      </form>

      <div className="pw-login-footer">
        <Link href="/login/" className="pw-login-footer-link">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
