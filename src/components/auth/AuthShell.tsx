import type { ReactNode } from "react";

/**
 * Centered auth stage — brand lives in the modal card (Hilt-style),
 * not as a separate page header overpowering the form.
 */
export function AuthShell({
  children,
  className = "",
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`pw-login-stage ${className}`.trim()}>
      <div className="pw-login-stage-bg" aria-hidden />
      <main className="pw-login-stage-main">{children}</main>
    </div>
  );
}
