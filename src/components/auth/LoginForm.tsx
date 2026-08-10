"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { authenticateDemo } from "@/lib/seed";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { ensureProfileForUser } from "@/lib/supabase/ensure-profile";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { clearWorkspaceData } from "@/lib/storage";
import { clearOnboardingBoot, persistSession } from "@/lib/use-workspace";

type Mode = "signin" | "signup";

function safeNext(raw: string | null): string {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/app/";
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));
  const configError = searchParams.get("error") === "supabase_not_configured";

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState(
    configError
      ? "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY."
      : "",
  );
  const [info, setInfo] = useState("");
  const [pending, setPending] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const supabaseReady = isSupabaseConfigured();

  async function onGoogleSignIn() {
    setError("");
    setInfo("");
    setPending(true);
    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setError("Supabase is not configured for this environment.");
      setPending(false);
      return;
    }
    const origin = window.location.origin;
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback/?next=${encodeURIComponent(next)}`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
    if (oauthError) {
      setError(
        oauthError.message.includes("provider is not enabled")
          ? "Google sign-in is not enabled yet. In Supabase → Authentication → Providers, enable Google and paste your Google Cloud OAuth Client ID/secret."
          : oauthError.message,
      );
      setPending(false);
    }
    // On success the browser navigates away to Google.
  }

  async function onEmailCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
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
    if (otpError) {
      setError(otpError.message);
      setPending(false);
      return;
    }
    setOtpSent(true);
    setInfo(
      "Check your email for a sign-in link / one-time code from Supabase Auth.",
    );
    setPending(false);
  }

  async function onSupabaseSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    setPending(true);

    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setError("Supabase is not configured for this environment.");
      setPending(false);
      return;
    }

    try {
      if (mode === "signup") {
        if (!firstName.trim() || !lastName.trim()) {
          setError("First and last name are required.");
          setPending(false);
          return;
        }
        const origin = window.location.origin;
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${origin}/auth/callback/`,
            data: {
              first_name: firstName.trim(),
              last_name: lastName.trim(),
              phone: phone.trim() || null,
            },
          },
        });
        if (signUpError) {
          setError(signUpError.message);
          setPending(false);
          return;
        }
        if (data.user) {
          await ensureProfileForUser(supabase, data.user, {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            phone: phone.trim() || null,
          });
        }
        if (data.session) {
          router.push(next);
          router.refresh();
          return;
        }
        setInfo(
          "Check your email to confirm your account, then sign in.",
        );
        setMode("signin");
        setPending(false);
        return;
      }

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
      }
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
      setPending(false);
    }
  }

  function onDemoSubmit(e: React.FormEvent) {
    e.preventDefault();
    const user = authenticateDemo(email);
    if (!user) {
      setError(
        "Unknown demo user. Try alex@example.com, jordan@advisors.example, casey@imo.example, riley@firm.example, or morgan@carrier.example",
      );
      return;
    }
    persistSession(user);
    const destination =
      user.role === "imo"
        ? "/imo/"
        : user.role === "broker_dealer"
          ? "/firm/"
          : user.role === "advisor"
            ? "/clients/"
            : user.role === "carrier"
              ? "/carrier/"
              : "/agent/";
    router.push(destination);
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 text-sm">
        <button
          type="button"
          className={`px-3 py-1.5 rounded-full ${mode === "signin" ? "bg-pine text-foam" : "text-stone hover:bg-pine/5"}`}
          onClick={() => {
            setMode("signin");
            setError("");
            setInfo("");
          }}
        >
          Sign in
        </button>
        <button
          type="button"
          className={`px-3 py-1.5 rounded-full ${mode === "signup" ? "bg-pine text-foam" : "text-stone hover:bg-pine/5"}`}
          onClick={() => {
            setMode("signup");
            setError("");
            setInfo("");
          }}
        >
          Sign up
        </button>
      </div>

      <div className="pw-panel p-6 space-y-3 shadow-[var(--shadow-soft)]">
        <button
          type="button"
          className="pw-btn w-full"
          disabled={pending || !supabaseReady}
          onClick={() => void onGoogleSignIn()}
        >
          Continue with Google
        </button>
        <p className="text-xs text-stone text-center">
          Google OAuth must be enabled in the Supabase dashboard (see docs).
        </p>
        <div className="relative py-2 text-center text-xs uppercase tracking-wider text-moss">
          <span className="bg-[var(--panel,theme(colors.white))] px-2 relative z-10">
            or email
          </span>
          <span
            aria-hidden
            className="absolute inset-x-0 top-1/2 border-t border-pine/10"
          />
        </div>
        <form onSubmit={(e) => void onEmailCode(e)} className="space-y-3">
          <label className="block text-sm text-stone">
            Email magic link / OTP
            <input
              className="pw-input mt-2"
              name="otp_email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <button
            type="submit"
            className="pw-btn-secondary w-full"
            disabled={pending || !supabaseReady}
          >
            {otpSent ? "Resend email code" : "Email me a sign-in code"}
          </button>
        </form>
      </div>

      <form
        onSubmit={(e) => void onSupabaseSubmit(e)}
        className="pw-panel p-6 space-y-4 shadow-[var(--shadow-soft)]"
      >
        <p className="text-xs uppercase tracking-wider text-moss">
          Or use email + password
        </p>
        {mode === "signup" && (
          <>
            <label className="block text-sm text-stone">
              First name
              <input
                className="pw-input mt-2"
                name="first_name"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </label>
            <label className="block text-sm text-stone">
              Last name
              <input
                className="pw-input mt-2"
                name="last_name"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </label>
            <label className="block text-sm text-stone">
              Phone{" "}
              <span className="text-moss normal-case tracking-normal">
                (optional)
              </span>
              <input
                className="pw-input mt-2"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </label>
          </>
        )}
        <label className="block text-sm text-stone">
          Email
          <input
            className="pw-input mt-2"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="block text-sm text-stone">
          Password
          <input
            className="pw-input mt-2"
            name="password"
            type="password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </label>
        {!supabaseReady && (
          <p className="text-sm text-amber">
            Supabase env vars are missing — sign-in will not work until they are
            set.
          </p>
        )}
        {error && <p className="text-sm text-danger">{error}</p>}
        {info && <p className="text-sm text-ok">{info}</p>}
        <button type="submit" className="pw-btn w-full" disabled={pending}>
          {pending
            ? "Please wait…"
            : mode === "signup"
              ? "Create account"
              : "Sign in"}
        </button>
        {mode === "signin" && (
          <p className="text-sm text-stone text-center">
            <Link href="/forgot-password/" className="underline hover:text-pine">
              Forgot password?
            </Link>
          </p>
        )}
      </form>

      <div className="text-sm text-stone">
        <button
          type="button"
          className="text-xs uppercase tracking-wider text-moss"
          onClick={() => setShowDemo((v) => !v)}
        >
          {showDemo ? "Hide" : "Show"} local demo workspace
        </button>
        {showDemo && (
          <form
            onSubmit={onDemoSubmit}
            className="mt-4 pw-panel p-4 space-y-3 border border-pine/10"
          >
            <p className="text-xs text-stone">
              LocalStorage-only demo (not Supabase Auth). Does not unlock{" "}
              <code>/app</code>, <code>/cases</code>, or <code>/policies</code>.
            </p>
            <label className="block text-sm text-stone">
              Demo email
              <input
                className="pw-input mt-2"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
              />
            </label>
            <button type="submit" className="pw-btn-secondary w-full !py-2">
              Continue to demo
            </button>
            <button
              type="button"
              className="text-xs uppercase tracking-wider text-moss"
              onClick={() => {
                clearWorkspaceData();
                clearOnboardingBoot();
                setError("");
              }}
            >
              Clear local workspace data
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
