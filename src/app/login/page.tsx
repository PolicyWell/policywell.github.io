import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <AuthShell
      title="Sign in"
      description="Access your PolicyWell workspace with email and password. Credentials are stored only in Supabase Auth."
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
