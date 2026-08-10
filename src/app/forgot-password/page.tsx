import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Forgot password"
      description="We will email a secure reset link. Passwords are never stored in PolicyWell application tables."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
