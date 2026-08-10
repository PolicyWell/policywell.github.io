/** Application routes that require an authenticated Supabase session. */
export const PROTECTED_PATH_PREFIXES = [
  "/app",
  "/cases",
  "/policies",
  "/upload",
] as const;

export function isProtectedPath(pathname: string): boolean {
  const path = pathname.split("?")[0] ?? pathname;
  const normalized = path.endsWith("/") && path.length > 1 ? path.slice(0, -1) : path;
  return PROTECTED_PATH_PREFIXES.some(
    (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`),
  );
}

export function loginRedirectPath(nextPath: string): string {
  const next = nextPath.startsWith("/") ? nextPath : "/app/";
  return `/login/?next=${encodeURIComponent(next)}`;
}
