# Email, access codes, quotes, and Auth (DNS & OAuth)

This document answers: **do you need DNS?** and how PolicyWell wires workable codes + Google/email login.

## Short answers

| Goal | Need custom DNS? |
|------|------------------|
| Login with **email magic link / OTP** via Supabase Auth (default Supabase sender) | **No** for a first test. Emails come from Supabase’s domain and can land in spam. |
| Login with **Google OAuth** | **No DNS.** You need a Google Cloud OAuth client + enable Google in Supabase Auth. |
| Email **product access codes** and **quote confirmations** from `@policywell.ai` | **Yes.** Point DNS (SPF + DKIM, preferably DMARC) at your mail provider (Resend). |
| Send those emails from Resend’s test domain (`onboarding@resend.dev`) | **No DNS**, but you can only send to your own Resend account email until a domain is verified. |

## What the app does now

### Request access
1. Browser → Edge Function `request-access`
2. Row stored in `access_requests`
3. One-time code hashed into `issued_access_codes`
4. Resend emails the plaintext code + unlock URL (`?access_code=…`)
5. Unlock calls Edge Function `verify-access-code` (static env codes still work)

### Get a quote
1. Browser → Edge Function `request-quote`
2. Row stored in `quote_requests`
3. If an email was provided, a product access code is issued and emailed with the confirmation

### Sign in
- **Google** → `signInWithOAuth({ provider: "google" })` → `/auth/callback/`
- **Email code** → `signInWithOtp` (Supabase Auth emails the link/code)
- **Email + password** → existing signup/signin
- Profile row is created/updated in `public.profiles` (linked to `auth.users`)

## What you must configure (outside this repo)

### 1. Resend (required for access/quote emails)

1. Create a [Resend](https://resend.com) account
2. Add API key as a Supabase Edge Function secret: `RESEND_API_KEY`
3. Optional secrets:
   - `EMAIL_FROM` — e.g. `PolicyWell <access@policywell.ai>`
   - `ACCESS_NOTIFY_EMAIL` — ops inbox that gets a copy of requests

```bash
# Example (requires supabase CLI login + link)
supabase secrets set RESEND_API_KEY=re_xxx EMAIL_FROM="PolicyWell <access@policywell.ai>" ACCESS_NOTIFY_EMAIL=info@policywell.ai
```

### 2. DNS for `@policywell.ai` (recommended for production)

In your DNS host (Cloudflare, Route53, Google Domains, etc.), add the records Resend shows after you “Add Domain”:

- **SPF** (TXT) — authorizes Resend to send
- **DKIM** (TXT) — cryptographic signing
- **DMARC** (TXT) — policy for spoofing protection (recommended)

Until DNS verifies, use Resend’s onboarding domain for smoke tests only.

You do **not** need a separate “DNS product” beyond the DNS zone you already use for `policywell.ai`.

### 3. Google OAuth (Gmail login)

1. [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → OAuth 2.0 Client ID (Web)
2. Authorized redirect URI (exact):

   `https://mdcvzhwxdwxmgbdhxviy.supabase.co/auth/v1/callback`

3. Supabase Dashboard → Authentication → Providers → **Google** → paste Client ID + Secret → Enable
4. Authentication → URL configuration:
   - Site URL: `https://policywell.ai` (and local `http://localhost:3000` for dev)
   - Redirect allow list: `https://policywell.ai/auth/callback/`, `http://localhost:3000/auth/callback/`

No DNS change is required for Google OAuth itself.

### 4. Supabase Auth email (OTP / magic link)

Works with Supabase’s built-in mailer immediately.

For branded “from” addresses (`noreply@policywell.ai`), configure **custom SMTP** in Supabase Auth (Resend SMTP or another provider) and use the same DNS SPF/DKIM records.

## Edge Functions

| Function | JWT verify | Purpose |
|----------|------------|---------|
| `request-access` | off (public form) | Issue + email access code |
| `verify-access-code` | off (public unlock) | Validate emailed / stored codes |
| `request-quote` | off (public form) | Store quote + email confirmation/code |

Service role is used only inside the functions. Tables have RLS with **no** anon/authenticated policies.

## Local / CI env

See `.env.example` for:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `UNIVERSAL_ACCESS_CODE` — preferred ops backdoor (GitHub Actions secret; hashed into `NEXT_PUBLIC_UNIVERSAL_ACCESS_CODE_HASH` at Pages build). Unlocks docs + all product surfaces. Also set the same value as a Supabase Edge Function secret so `verify-access-code` accepts it.
- Optional surface-specific static codes (`DOCS_ACCESS_CODE`, `PRODUCT_ACCESS_CODE`)

Static env codes remain valid as an ops backdoor; emailed codes are the primary end-user path once Resend is set. Pages builds require `UNIVERSAL_ACCESS_CODE` and/or `DOCS_ACCESS_CODE`.
