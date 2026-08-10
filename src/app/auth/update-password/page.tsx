import { AuthShell } from "@/components/auth/AuthShell";
import { UpdatePasswordForm } from "@/components/auth/UpdatePasswordForm";

export default function UpdatePasswordPage() {
  return (
    <AuthShell
      title="Choose a new password"
      description="Set a new password for your PolicyWell account. Credentials stay in Supabase Auth."
    >
      <UpdatePasswordForm />
    </AuthShell>
  );
}
