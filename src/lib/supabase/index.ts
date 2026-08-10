export { createBrowserSupabaseClient, getSupabase } from "./client";
export type { TypedSupabaseClient } from "./client";
export type { Database, Tables, TablesInsert, TablesUpdate, Enums, Json } from "./database.types";
export { getSupabasePublicEnv, isSupabaseConfigured } from "./env";
// Intentionally NOT exporting createServiceRoleClient / admin helpers from this
// barrel — import `@/lib/supabase/admin` only from trusted server modules.
