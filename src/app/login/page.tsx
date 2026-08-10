import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <AuthShell
      title="Sign in"
      description="Sign in with Google, an email one-time code, or email and password. Sessions are stored in Supabase Auth and linked to your profile."
    >
      <Suspense
        fallback={
          <div className="pw-panel p-6 text-sm text-stone">Loading…</div>
        }
      >
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
