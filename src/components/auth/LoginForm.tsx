"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { ensureProfileForUser } from "@/lib/supabase/ensure-profile";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  defaultPostLoginPath,
  syncWorkspaceSessionFromAuth,
} from "@/lib/supabase/session-bridge";

type View = "magic" | "password";

function safeNext(raw: string | null, fallback = "/app/"): string {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return fallback;
}

function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.95 10.7A5.4 5.4 0 0 1 3.66 9c0-.59.1-1.17.29-1.7V4.97H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.03l2.99-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A8.87 8.87 0 0 0 9 0 9 9 0 0 0 .96 4.97l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58z"
      />
    </svg>
  );
}

function GitHubGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.5 7.5 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.19 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));
  const configError = searchParams.get("error") === "supabase_not_configured";

  const [view, setView] = useState<View>("magic");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(
    configError
      ? "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY."
      : "",
  );
  const [info, setInfo] = useState("");
  const [pending, setPending] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const supabaseReady = isSupabaseConfigured();

  function resetMessages() {
    setError("");
    setInfo("");
  }

  async function onOAuth(provider: "google" | "github") {
    resetMessages();
    setPending(true);
    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setError("Supabase is not configured for this environment.");
      setPending(false);
      return;
    }
    const origin = window.location.origin;
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${origin}/auth/callback/?next=${encodeURIComponent(next)}`,
        ...(provider === "google"
          ? {
              queryParams: {
                access_type: "offline",
                prompt: "consent",
              },
            }
          : {}),
      },
    });
    if (oauthError) {
      const label = provider === "google" ? "Google" : "GitHub";
      setError(
        oauthError.message.includes("provider is not enabled")
          ? `${label} sign-in is not enabled yet. Enable it in Supabase → Authentication → Providers.`
          : oauthError.message,
      );
      setPending(false);
    }
  }

  async function onMagicContinue(e: React.FormEvent) {
    e.preventDefault();
    resetMessages();
    setPending(true);
    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setError("Supabase is not configured for this environment.");
      setPending(false);
      return;
    }
    const origin = window.location.origin;
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${origin}/auth/callback/?next=${encodeURIComponent(next)}`,
        shouldCreateUser: true,
      },
    });
    setPending(false);
    if (otpError) {
      setError(otpError.message);
      return;
    }
    setMagicSent(true);
    setInfo("Check your email for your magic link.");
  }

  async function onPasswordSignIn(e: React.FormEvent) {
    e.preventDefault();
    resetMessages();
    setPending(true);
    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setError("Supabase is not configured for this environment.");
      setPending(false);
      return;
    }
    try {
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
      if (signInError) {
        setError(signInError.message);
        setPending(false);
        return;
      }
      if (data.user) {
        await ensureProfileForUser(supabase, data.user);
        const session = await syncWorkspaceSessionFromAuth(supabase, data.user);
        const dest = safeNext(
          searchParams.get("next"),
          defaultPostLoginPath(session.role),
        );
        router.push(dest);
        router.refresh();
        return;
      }
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
      setPending(false);
    }
  }

  return (
    <div className="pw-login-card">
      <div className="pw-login-card-head">
        <div>
          <h1 className="pw-login-title">Welcome back</h1>
          <p className="pw-login-lede">
            {view === "magic"
              ? "Enter your email to get your magic link."
              : "Sign in with your email and password."}
          </p>
        </div>
        <Link
          href="/"
          className="pw-login-close"
          aria-label="Close and return home"
        >
          ×
        </Link>
      </div>

      {!supabaseReady && (
        <p className="pw-login-error">
          Supabase env vars are missing — sign-in will not work until they are
          set.
        </p>
      )}
      {error && <p className="pw-login-error">{error}</p>}
      {info && <p className="pw-login-info">{info}</p>}

      {view === "magic" ? (
        <form
          onSubmit={(e) => void onMagicContinue(e)}
          className="pw-login-stack"
        >
          <label className="sr-only" htmlFor="login-email">
            Email
          </label>
          <input
            id="login-email"
            className="pw-login-input"
            name="email"
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
            {pending ? "Sending…" : magicSent ? "Resend magic link" : "Continue"}
          </button>
        </form>
      ) : (
        <form
          onSubmit={(e) => void onPasswordSignIn(e)}
          className="pw-login-stack"
        >
          <label className="sr-only" htmlFor="login-email-password">
            Email
          </label>
          <input
            id="login-email-password"
            className="pw-login-input"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label className="sr-only" htmlFor="login-password">
            Password
          </label>
          <input
            id="login-password"
            className="pw-login-input"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
          <button
            type="submit"
            className="pw-login-primary"
            disabled={pending || !supabaseReady}
          >
            {pending ? "Signing in…" : "Continue"}
          </button>
        </form>
      )}

      <div className="pw-login-stack pw-login-oauth">
        <button
          type="button"
          className="pw-login-oauth-btn"
          disabled={pending || !supabaseReady}
          onClick={() => void onOAuth("google")}
        >
          <GoogleGlyph />
          Continue with Google
        </button>
        <button
          type="button"
          className="pw-login-oauth-btn"
          disabled={pending || !supabaseReady}
          onClick={() => void onOAuth("github")}
        >
          <GitHubGlyph />
          Continue with GitHub
        </button>
      </div>

      {view === "magic" ? (
        <button
          type="button"
          className="pw-login-text-link"
          onClick={() => {
            resetMessages();
            setView("password");
          }}
        >
          Login with password
        </button>
      ) : (
        <button
          type="button"
          className="pw-login-text-link"
          onClick={() => {
            resetMessages();
            setView("magic");
          }}
        >
          Login with magic link
        </button>
      )}

      <div className="pw-login-footer">
        <Link href="/forgot-password/" className="pw-login-footer-link">
          Forgot your password?
        </Link>
      </div>
    </div>
  );
}
