"use client";

import Link from "next/link";
import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [pending, setPending] = useState(false);

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
    <form
      onSubmit={(e) => void onSubmit(e)}
      className="pw-panel p-6 space-y-4 shadow-[var(--shadow-soft)]"
    >
      <label className="block text-sm text-stone">
        Email
        <input
          className="pw-input mt-2"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>
      {error && <p className="text-sm text-danger">{error}</p>}
      {info && <p className="text-sm text-ok">{info}</p>}
      <button type="submit" className="pw-btn w-full" disabled={pending}>
        {pending ? "Sending…" : "Send reset link"}
      </button>
      <p className="text-sm text-stone text-center">
        <Link href="/login/" className="underline hover:text-pine">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
