# Supabase setup (prod + dev)

PolicyWell ships as a static GitHub Pages export. Browser code uses the
**anon** key via `src/lib/supabase`. Never ship the service role key to Pages.

## Environments

| Environment | Git branch | Supabase project | Env source |
|-------------|------------|------------------|------------|
| Production | `production` (and `main` deploy) | Production project | GitHub Actions secrets |
| Development | `dev` | Dev project (or Supabase branch) | `.env.local` |

Recommended: **two Supabase projects** (or one project + a Supabase git branch
for preview) so local work never touches live data.

## 1. Create / pick projects

1. In [Supabase Dashboard](https://supabase.com/dashboard), create (or open):
   - `policywell-prod`
   - `policywell-dev`
2. For each: **Project Settings → API** copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 2. Local / `dev` branch

```bash
cp .env.example .env.local
# paste DEV url + anon key
npm run dev
```

Use helpers:

```ts
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

const supabase = getSupabase();
if (supabase) {
  // query / auth
}
```

## 3. Production (GitHub Pages)

In the GitHub repo: **Settings → Secrets and variables → Actions**, add:

- `NEXT_PUBLIC_SUPABASE_URL` = prod project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = prod anon key

The Pages workflow injects these at build time (`STATIC_EXPORT=1`).

## 4. Link CLI (optional)

```bash
npx supabase login
npx supabase link --project-ref <prod-or-dev-ref>
npx supabase db pull   # when you start using migrations
```

Supabase **database branches** (preview DBs) can map to the git `dev` branch
once the project is linked; keep `production` pointed at the primary DB.

## Notes

- Login is still the demo/localStorage flow until auth is migrated.
- `createServerSupabaseClient()` is for non-static hosts only (`server-only`).
