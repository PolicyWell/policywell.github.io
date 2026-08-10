import type { User } from "@supabase/supabase-js";
import type { SessionUser, UserRole } from "@/lib/types";
import { persistSession } from "@/lib/use-workspace";
import type { Database } from "./database.types";
import type { TypedSupabaseClient } from "./client";
import { isSupabaseAuthUserId } from "./persist-document";

type ProfileRole = Database["public"]["Enums"]["profile_role"];

function mapProfileRole(role: ProfileRole | null | undefined): UserRole {
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

function displayName(user: User, first?: string | null, last?: string | null) {
  const fromProfile = [first, last].filter(Boolean).join(" ").trim();
  if (fromProfile) return fromProfile;
  const meta = user.user_metadata ?? {};
  const metaName =
    (typeof meta.full_name === "string" && meta.full_name.trim()) ||
    (typeof meta.name === "string" && meta.name.trim()) ||
    "";
  if (metaName) return metaName;
  return user.email?.split("@")[0] || "PolicyWell user";
}

/** Mirror Supabase Auth into the local workspace SessionUser used by product pages. */
export async function syncWorkspaceSessionFromAuth(
  supabase: TypedSupabaseClient,
  user: User,
): Promise<SessionUser> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, role")
    .eq("id", user.id)
    .maybeSingle();

  const session: SessionUser = {
    id: user.id,
    email: user.email?.trim() || `${user.id}@users.policywell.local`,
    name: displayName(user, profile?.first_name, profile?.last_name),
    role: mapProfileRole(profile?.role),
  };
  persistSession(session);
  return session;
}

export function clearMirroredAuthSession(current: SessionUser | null) {
  if (current && !isSupabaseAuthUserId(current.id)) return;
  persistSession(null);
}
