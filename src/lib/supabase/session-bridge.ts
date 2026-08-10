import type { User } from "@supabase/supabase-js";
import type { SessionUser, UserRole } from "@/lib/types";
import { persistSession } from "@/lib/use-workspace";
import type { Database } from "./database.types";
import type { TypedSupabaseClient } from "./client";

type ProfileRole = Database["public"]["Enums"]["profile_role"];

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** True when the id looks like a Supabase auth.users uuid (not a local demo id). */
export function isSupabaseUserId(id: string): boolean {
  return UUID_RE.test(id);
}

/**
 * Map Postgres profile_role → local workspace UserRole used by product pages.
 * Demo-only roles (carrier) stay available via authenticateDemo.
 */
export function mapProfileRoleToUserRole(role: ProfileRole | null | undefined): UserRole {
  switch (role) {
    case "producer":
      return "advisor";
    case "agency_admin":
      return "imo";
    case "policywell_admin":
      return "broker_dealer";
    case "consumer":
    default:
      return "policyholder";
  }
}

export function displayNameFromAuth(
  user: User,
  firstName?: string | null,
  lastName?: string | null,
): string {
  const fromProfile = [firstName, lastName].filter(Boolean).join(" ").trim();
  if (fromProfile) return fromProfile;
  const meta = user.user_metadata ?? {};
  const metaName =
    (typeof meta.full_name === "string" && meta.full_name.trim()) ||
    (typeof meta.name === "string" && meta.name.trim()) ||
    [
      typeof meta.first_name === "string" ? meta.first_name.trim() : "",
      typeof meta.last_name === "string" ? meta.last_name.trim() : "",
    ]
      .filter(Boolean)
      .join(" ")
      .trim();
  if (metaName) return metaName;
  const email = user.email?.trim();
  if (email) return email.split("@")[0] || email;
  return "PolicyWell user";
}

export function sessionUserFromAuth(
  user: User,
  profileRole?: ProfileRole | null,
  firstName?: string | null,
  lastName?: string | null,
): SessionUser {
  return {
    id: user.id,
    email: user.email?.trim() || `${user.id}@users.policywell.local`,
    name: displayNameFromAuth(user, firstName, lastName),
    role: mapProfileRoleToUserRole(profileRole),
  };
}

/**
 * After Supabase Auth succeeds, mirror the user into the local workspace session
 * that product pages (`useSession`) still read on the static GitHub Pages build.
 */
export async function syncWorkspaceSessionFromAuth(
  supabase: TypedSupabaseClient,
  user: User,
): Promise<SessionUser> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, role")
    .eq("id", user.id)
    .maybeSingle();

  const session = sessionUserFromAuth(
    user,
    profile?.role,
    profile?.first_name,
    profile?.last_name,
  );
  persistSession(session);
  return session;
}

/** Clear mirrored workspace session when signing out of Supabase Auth. */
export function clearWorkspaceAuthSession(current?: SessionUser | null) {
  if (current && !isSupabaseUserId(current.id)) {
    // Leave demo / guest local sessions alone.
    return;
  }
  persistSession(null);
}

export function defaultPostLoginPath(role: UserRole): string {
  switch (role) {
    case "imo":
      return "/imo/";
    case "broker_dealer":
      return "/firm/";
    case "advisor":
      return "/clients/";
    case "carrier":
      return "/carrier/";
    default:
      return "/app/";
  }
}
