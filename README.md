# PolicyWell

**Building the Intelligence Layer for Insurance.**

Primary product surface: the **Insurance Intelligence Agent** at `/agent`.

## Requirements

- **Node.js 20.9+** (Next.js 16). Check with `node -v`.
- If you use nvm: `nvm install` (reads `.nvmrc`) then `nvm use`.

## Run locally (dev)

```bash
# From the project root (folder that contains package.json)
npm install
npm test          # should be 39 passing
npm run dev
```

Open:

- Agent: http://localhost:3000/agent
- Home: http://localhost:3000

On `/agent`: click **Seed IUL demo**, then ask `Will my policy lapse?`

## Production build locally

```bash
npm install
npm run build
npm start
```

Then open http://localhost:3000/agent

## If it fails

| Symptom | Fix |
|---------|-----|
| `You are using Node.js 18` / engine errors | Upgrade Node to 20.9+ |
| `Cannot find module …` | Delete `node_modules` and `package-lock.json`, then `npm install` |
| Port 3000 in use | `npm run dev -- -p 3001` and open that port |
| No `/agent` route (404) | You have an old copy — use the latest bundle or pull latest commits |
| Bundle clone looks empty | `git clone <file>.bundle PW-MVP && cd PW-MVP` — must see `src/app/agent` |

Verify the agent files exist:

```bash
ls src/app/agent/page.tsx src/app/api/agent/route.ts src/lib/agent/index.ts
```

## Demo accounts

| Email | Role |
|-------|------|
| alex@example.com | Policyholder → lands on `/agent` |
| jordan@advisors.example | Advisor |
| casey@imo.example | IMO |
| morgan@carrier.example | Carrier |

Optional LLM phrasing: `export OPENAI_API_KEY=sk-...` then restart `npm run dev`. Without a key the agent still runs (tool planner + synthesizer).

## Docs

- [Engineering Manual](./docs/ENGINEERING_MANUAL.md)
- [Morning Report](./docs/MORNING_REPORT.md)
