/**
 * Shared /platform segment layout.
 * Access gating applies only under (gated); Coverage Library stays public.
 */
export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
