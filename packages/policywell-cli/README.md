# PolicyWell CLI

Global command: `policywell`

Talks to the local PolicyWell HTTP API (default `http://localhost:3000/api/v1`).

## Build

```bash
cd packages/policywell-cli
npm install
npm run build
```

## Global install

```bash
npm install -g ./packages/policywell-cli
```

(Run from the repository root, or pass an absolute path to the package.)

## Usage

```bash
policywell --help
policywell init
policywell ingest ./statement.pdf
policywell summary
policywell funding
policywell lapse
policywell cashvalue --age 65
policywell scenario --premium 612
policywell stats
```

Override API base:

```bash
policywell --api http://localhost:3000/api/v1 summary
# or
export POLICYWELL_API_BASE=http://localhost:3000/api/v1
```

### Live database append (hero counter)

With the Next app running locally and these env vars set in the app’s `.env.local`:

- `SUPABASE_SERVICE_ROLE_KEY`
- `INGEST_OWNER_USER_ID` (a UUID from `auth.users`)

`policywell ingest <file>` also writes Storage + `public.documents`, which increments `site_stats.analyzed_count` for the homepage live counter.

You can also pass the owner per request:

```bash
export POLICYWELL_OWNER_USER_ID=<auth-user-uuid>
policywell ingest ./statement.pdf
```

