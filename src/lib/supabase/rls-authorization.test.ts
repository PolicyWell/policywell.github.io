import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = path.resolve(__dirname, "../../..");
const STRICT_RLS_MIGRATION = path.join(
  ROOT,
  "supabase/migrations/20260810062857_strict_rls_and_private_storage.sql",
);
const RLS_SQL_TESTS = path.join(ROOT, "supabase/tests/rls_authorization.sql");

function read(file: string) {
  return readFileSync(file, "utf8");
}

describe("strict RLS migration invariants", () => {
  const sql = read(STRICT_RLS_MIGRATION);

  it("removes client-side policywell_admin bypass from case access", () => {
    expect(sql).toContain("or public.is_agency_admin_for_case(p_case_id)");
    expect(sql).toMatch(
      /create or replace function public\.is_case_accessible[\s\S]*?as \$\$\s*select\s*public\.is_case_owner/,
    );
    const accessibleFn = sql.slice(
      sql.indexOf("create or replace function public.is_case_accessible"),
      sql.indexOf("revoke all on function public.is_case_accessible"),
    );
    expect(accessibleFn).not.toContain("is_policywell_admin");
  });

  it("revokes is_policywell_admin execute from authenticated (no client bypass)", () => {
    expect(sql).toContain(
      "revoke all on function public.is_policywell_admin() from authenticated",
    );
    expect(sql).toContain("service_role");
  });

  it("keeps agency admin as a false hook until org membership exists", () => {
    expect(sql).toContain("is_agency_admin_for_case");
    expect(sql).toContain("select false");
    expect(sql).toContain("organization membership");
  });

  it("creates a private policy-documents storage bucket with case-path policies", () => {
    expect(sql).toContain("'policy-documents'");
    expect(sql).toContain("public = excluded.public");
    expect(sql).toMatch(/'policy-documents',\s*'policy-documents',\s*false,/);
    expect(sql).toContain("is_policy_document_path_accessible");
    expect(sql).toContain("policy_docs_storage_insert");
  });

  it("scopes profiles to the authenticated user only", () => {
    expect(sql).toContain("create policy profiles_select on public.profiles");
    expect(sql).toMatch(
      /create policy profiles_select on public\.profiles[\s\S]*?using \(\(select auth\.uid\(\)\) = id\);/,
    );
    expect(sql).not.toMatch(
      /create policy profiles_select on public\.profiles[\s\S]*?is_policywell_admin/,
    );
  });
});

describe("RLS authorization SQL test suite", () => {
  const sql = read(RLS_SQL_TESTS);

  it("covers consumer isolation and producer assignment scenarios", () => {
    expect(sql).toContain("FAIL: user A can see user B case");
    expect(sql).toContain("FAIL: user A can see user B policy");
    expect(sql).toContain("FAIL: user A can see user B document");
    expect(sql).toContain("FAIL: assigned producer cannot see assigned case");
    expect(sql).toContain("FAIL: unassigned producer can see case");
    expect(sql).toContain("PASS: all RLS authorization assertions succeeded");
  });
});

describe("service role env safety", () => {
  it("admin helper is server-only and rejects public service-role env", async () => {
    const adminSrc = read(path.join(ROOT, "src/lib/supabase/admin.ts"));
    expect(adminSrc).toContain('import "server-only"');
    expect(adminSrc).toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(adminSrc).toContain("NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY");
    expect(adminSrc).not.toMatch(/NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY\s*=/);
  });

  it("signed URL helper uses session client, not service role", () => {
    const src = read(path.join(ROOT, "src/lib/supabase/signed-url.ts"));
    expect(src).toContain('import "server-only"');
    expect(src).toContain("createSignedUrl");
    expect(src).toContain("policy-documents");
    expect(src).not.toContain("createServiceRoleClient");
    expect(src).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
  });
});
