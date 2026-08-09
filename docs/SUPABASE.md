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

## Notes

- Demo login remains localStorage until Auth is migrated.
- Never commit the service role key.

## Private docs access (optional)

Set `NEXT_PUBLIC_DOCS_ACCESS_CODE` to soft-gate `/docs` with an access-code screen (session unlock; also accepts `?code=`). Leave unset to keep docs public. For GitHub Pages, add the same name as an Actions secret.
