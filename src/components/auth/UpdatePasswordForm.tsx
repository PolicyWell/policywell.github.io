"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export function UpdatePasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setPending(true);
    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setError("Supabase is not configured.");
      setPending(false);
      return;
    }
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setPending(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    router.push("/app/");
    router.refresh();
  }

  return (
    <div className="pw-login-card">
      <div className="pw-login-card-head">
        <div>
          <h1 className="pw-login-title">Choose a new password</h1>
          <p className="pw-login-lede">
            Credentials stay in Supabase Auth — never in application tables.
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

      <form onSubmit={(e) => void onSubmit(e)} className="pw-login-stack">
        <label className="sr-only" htmlFor="new-password">
          New password
        </label>
        <input
          id="new-password"
          className="pw-login-input"
          type="password"
          autoComplete="new-password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
        />
        <label className="sr-only" htmlFor="confirm-password">
          Confirm password
        </label>
        <input
          id="confirm-password"
          className="pw-login-input"
          type="password"
          autoComplete="new-password"
          placeholder="Confirm password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          minLength={8}
          required
        />
        <button type="submit" className="pw-login-primary" disabled={pending}>
          {pending ? "Updating…" : "Continue"}
        </button>
      </form>
    </div>
  );
}
