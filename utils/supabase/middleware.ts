import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/supabase/database.types";
import { isProtectedPath, loginRedirectPath } from "@/lib/supabase/auth-paths";

/**
 * Refresh the Supabase Auth session and enforce protected application routes.
 * Uses getClaims() (recommended) — never trust getSession() alone for authz.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    if (isProtectedPath(request.nextUrl.pathname)) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login/";
      redirectUrl.searchParams.set("next", request.nextUrl.pathname);
      redirectUrl.searchParams.set("error", "supabase_not_configured");
      return NextResponse.redirect(redirectUrl);
    }
    return supabaseResponse;
  }

  const supabase = createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
        Object.entries(headers).forEach(([headerKey, value]) =>
          supabaseResponse.headers.set(headerKey, value),
        );
      },
    },
  });

  // Validate JWT via getClaims — do not put logic between createServerClient and this call.
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const pathname = request.nextUrl.pathname;

  if (isProtectedPath(pathname) && !claims?.sub) {
    const redirectUrl = request.nextUrl.clone();
    const target = loginRedirectPath(pathname + request.nextUrl.search);
    return NextResponse.redirect(new URL(target, request.url));
  }

  // Logged-in users hitting /login go to the app (or ?next=).
  if (claims?.sub && (pathname === "/login" || pathname === "/login/")) {
    const next = request.nextUrl.searchParams.get("next");
    const dest =
      next && next.startsWith("/") && !next.startsWith("//") ? next : "/app/";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  return supabaseResponse;
}
