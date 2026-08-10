# Supabase setup (prod + dev)

## Packages

```bash
npm install @supabase/supabase-js @supabase/ssr
```

## Clients (official SSR layout)

| File | Use |
|------|-----|
| `utils/supabase/client.ts` | Client Components / browser |
| `utils/supabase/server.ts` | Server Components, Route Handlers, Server Actions |
| `utils/supabase/middleware.ts` | Session refresh helper |
| `middleware.ts` | Calls `updateSession` (skipped on static Pages export) |

```ts
// Client Component
import { createClient } from "../../utils/supabase/client";

// Server Component / Route Handler
import { createClient } from "../../utils/supabase/server";
```

Convenience helpers also exist at `src/lib/supabase` (`getSupabase()`, etc.).

## Environment variables

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

| Environment | Git branch | Env source |
|-------------|------------|------------|
| Development | `dev` | `.env.local` |
| Production | `production` / `main` (Pages) | GitHub Actions secrets |

### Local

Keys belong in `.env.local` (gitignored). Restart `npm run dev` after edits.

### Production (GitHub Pages)

Repo → **Settings → Secrets and variables → Actions**:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Static export cannot run middleware; `scripts/build-pages.mjs` parks `middleware.ts` for that build. Browser client + publishable key still work when baked in at build time.

## Data foundation (Auth + case intelligence schema)

Imperative migrations (apply in order; do not create these tables from app code):

| Migration | Purpose |
|-----------|---------|
| `supabase/migrations/20260810062250_policywell_data_foundation.sql` | `profiles` (→ `auth.users`), cases, documents, ingestions, policies, facts, ledgers, analyses, opportunities, conversations, audit_events; RLS; indexes |
| `supabase/migrations/20260810062356_policywell_data_foundation_security_hardening.sql` | `search_path` + revoke anon/PUBLIC execute on SECURITY DEFINER helpers |

Typed definitions: `src/lib/supabase/database.types.ts` (wired into `utils/supabase/*` and `src/lib/supabase` clients).

Supabase Auth owns credentials. `public.profiles` has **no** password columns.

## Strict RLS + private document storage

| Migration | Purpose |
|-----------|---------|
| `supabase/migrations/20260810062857_strict_rls_and_private_storage.sql` | Owner / assigned-producer only; no client `policywell_admin` bypass; agency-admin hook (always false until org membership exists); private `policy-documents` bucket |

Access model:

- **Consumers** — own profile + own cases + case-linked documents/policies/facts/analyses
- **Producers** — only cases where `assigned_producer_id = auth.uid()`
- **Agency admins** — `is_agency_admin_for_case()` hook only (returns false today)
- **PolicyWell admins** — `service_role` / backend only (`src/lib/supabase/admin.ts`); never a client RLS OR

Storage path convention: `{case_id}/...` in bucket `policy-documents`. Browser viewing uses short-lived signed URLs (`src/lib/supabase/signed-url.ts`) under the user session — not public object URLs.

| Env | Client? | Purpose |
|-----|---------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | yes | Browser / SSR publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | **never** | Server-only admin (bypasses RLS). Never `NEXT_PUBLIC_*`. |

RLS authorization tests: `supabase/tests/rls_authorization.sql` + `src/lib/supabase/rls-authorization.test.ts`.

## Notes

- Demo login remains localStorage until Auth is migrated to Supabase Auth.
- Never commit the service role key.

## Private docs access (required for Pages)

`/docs` is always access-code gated (Access Restricted). Fail closed when no code is configured.

| Env | Purpose |
|-----|---------|
| `DOCS_ACCESS_CODE` | Preferred. Hashed at build into `NEXT_PUBLIC_DOCS_ACCESS_CODE_HASH` (plaintext not shipped). **Required** for `npm run build:pages` / GitHub Actions. |
| `NEXT_PUBLIC_DOCS_ACCESS_CODE` | Local-dev convenience only (plaintext in the client bundle). |

GitHub → Settings → Secrets and variables → Actions → create **`DOCS_ACCESS_CODE`**.

Unlock persists for the browser session; `?code=` share links work and are stripped after unlock. Docs are omitted from `sitemap.xml` and disallowed in `robots.txt`.

## Commercial V1 schema

Imperative migration: `supabase/migrations/20260808233000_commercial_v1.sql`

Creates owner-scoped commercial account / document / coverage / diligence tables plus a **private** Storage bucket `commercial-documents`. The `/commercial` UI remains localStorage-first until Auth is wired; apply the migration against prod/dev Supabase when ready.
