# PolicyWell Morning Report — Sprint 5

**Date:** 2026-07-21  
**Branch:** `cursor/sprint1-mvp-c124`  
**Manual version:** 0.1  
**Previous sprint:** Sprint 4 (human approval + score history, see below)

## Verdict

Sprint 5 turns approvals into action: human-approved recommendations become dated follow-up tasks with documented per-rule timelines, and advisors get a downloadable meeting preparation pack (Manual §11 "Meeting preparation") assembled from context, deterministic reports, approved recommendations, and open tasks.

## Shipped

### Follow-up task workflow
- `src/lib/tasks.ts`: only **approved** recommendations become tasks (pending/rejected never do — test-asserted). Due dates follow documented per-rule timelines (verification/profile 7 days, funding 14, loans/beneficiary 21, coverage/review 30). Regeneration is idempotent — existing tasks preserved. Toggle completion, overdue detection, open/overdue/completed summary.
- **Tasks page** (`/tasks`, in nav for all roles): stat tiles, generate-from-approved, checkbox completion, overdue badges.

### Meeting preparation pack (Manual §11)
- `src/lib/meeting-prep.ts`: pack with agenda, talking points (scores, household, profile gaps), approved recommendations only, open tasks, questions, warnings, documents on file with verification state, three funding-scenario summaries, and documented assumptions.
- Markdown export; **Download meeting pack (.md)** button on the report page.

## Tests

`npm test`: **35/35 passing** (Sprint 5 adds 6 — approval gating for tasks, due-date rules, idempotent regeneration, toggle/overdue, pack content, markdown export).
Typecheck, lint, production build clean. Live server restarted; all routes 200 locally and via the public tunnel URL.

## Push status

Unchanged: no GitHub credentials in this environment; `origin` configured for `PolicyWell/PW-MVP`. User has local-push instructions + downloadable bundle. App is live at a temporary Cloudflare quick-tunnel URL.

## Next sprint candidates

- Real LLM interview + extraction behind existing interfaces (needs API key)
- Database persistence and real authentication (needs infra decision)
- Broker-dealer / financial-institution views
- Task assignment/ownership for multi-advisor firms

---

# PolicyWell Morning Report — Sprint 4

**Date:** 2026-07-21  
**Branch:** `cursor/sprint1-mvp-c124`  
**Manual version:** 0.1  
**Previous sprint:** Sprint 3 (IMO engine + email import, see below)

## Verdict

Sprint 4 closes the remaining gap in the core workflow (Manual §4): an explicit **Human Approval** stage. Recommendations are now first-class objects generated deterministically from context and scores, reviewed in an approve/reject queue, and only approved items reach client-facing reports. Score trend history rounds out the Continuous Improvement loop.

## Shipped

### Recommendation engine + human approval (Manual §4)
- `src/lib/recommendations.ts`: seven deterministic rules (fund to target, policy loan review, coverage gap, beneficiary confirmation, document verification, profile completion, schedule review) — each with rationale, input values, and confidence. All start `pending`.
- **Approval queue** in the workspace: approve/reject per item with decision timestamps.
- **Report gating**: `/report` shows an "Approved recommendations" section fed only by `approvedForReport()`; pending/rejected items never reach client output (test-asserted).

### Score history (Continuous Improvement)
- `src/lib/history.ts`: score snapshots (overall, policy health, protection, review priority), capped at 50 entries, with trend delta since first snapshot.
- Workspace bar chart + "Record snapshot" action.

## Tests

`npm test`: **29/29 passing** (Sprint 4 adds 5 — rule determinism, per-client rule targeting on the IMO seed, approval gating, snapshot trend, history cap).
Typecheck, lint, production build clean; routes smoke-tested.

## Push status

Push to `https://github.com/PolicyWell/PW-MVP` remains **blocked — no GitHub credentials in this environment**. `origin` is configured and ready. A full repo bundle exists at `policywell-sprints1-3.bundle` (untracked). Unblock via: PAT pasted in chat, `GITHUB_TOKEN` secret + new agent run, or relaunch from cursor.com/agents with the repo connected.

## Next sprint candidates

- Real LLM interview + extraction behind existing interfaces (needs API key)
- Database persistence and real authentication (needs infra decision)
- Broker-dealer / financial-institution views
- Recommendation → follow-up task workflow for advisors

---

# PolicyWell Morning Report — Sprint 3

**Date:** 2026-07-21  
**Branch:** `cursor/sprint1-mvp-c124`  
**Manual version:** 0.1  
**Previous sprint:** Sprint 2 (advisor + carrier engines, see below)

## Verdict

Sprint 3 delivers the IMO use case (Manual §6) and the email import ingestion channel (Manual §9): advisor activity tracking, carrier analytics, a standardized annual review pipeline and checklist, and pasted-email ingestion that flows through the same OCR/extraction/verification path as file uploads.

## Shipped

### IMO engine (Manual §6)
- **IMO analytics** (`src/lib/imo.ts`): deterministic aggregation across advisor rosters — per-advisor client counts, documents ingested, verification rates, average policy health, high-priority client counts; firm-wide carrier distribution; review pipeline sorted by review priority with overdue/due/current status thresholds (documented assumptions).
- **Standardized annual review checklist**: six data-derived checks per client (profile completeness, document verification, beneficiary context, target funding, coverage gap, review scheduling) — the same checklist for every advisor, satisfying "standardize annual reviews".
- **IMO dashboard** (`/imo`, IMO role): stat tiles, advisor activity table, carrier analytics bars, review pipeline, per-client checklist. Demo seed spans two advisors (Jordan Lee's 3 clients + Priya Shah's 2, including an intentionally unverified underfunded IUL that surfaces as overdue).
- New demo account: `casey@imo.example` (IMO role, lands on `/imo`).

### Email import channel (Manual §9)
- `src/lib/email-import.ts`: parses pasted emails (From/Subject headers optional), ingests the body through the existing OCR → extraction → confidence → human verification pipeline as a `.eml` document; sender and subject are searchable.
- Upload page gains an "Email import" panel.

## Tests

`npm test`: **24/24 passing** (Sprints 1–2: 18, Sprint 3: 6 — IMO aggregation determinism, overdue flagging, checklist, email parsing/ingestion).
Typecheck, lint, production build clean. Runtime smoke test: all 12 routes return 200.

## Acceptance criteria check (IMO goals, Manual §6)

- Increase advisor productivity ✓ (shared engine + roster + checklists)
- Standardize annual reviews ✓ (deterministic checklist, same for every client)
- Track advisor activity ✓ (activity table with verification rates)
- Carrier analytics ✓ (book-of-business distribution)

## Next sprint candidates

- Real LLM interview + extraction behind existing interfaces (needs API key secret)
- Database persistence and real authentication (needs infra decision)
- Broker-dealer / financial-institution views
- Score trend history over time

---

# PolicyWell Morning Report — Sprint 2

**Date:** 2026-07-21  
**Branch:** `cursor/sprint1-mvp-c124`  
**Manual version:** 0.1  
**Previous sprint:** Sprint 1 MVP (see below)

## Verdict

Sprint 2 delivers the Advisor use case (Manual §11) and Carrier use case (Manual §12) on top of the Sprint 1 engine: multi-client roster, deterministic policy comparison with 1035 warnings, funding scenario modeling with lapse detection, and a compliance-preserving carrier console.

## Shipped

### Advisor engine (Manual §11)
- **Client roster** (`/clients`, advisor/IMO roles): three seeded households — Alex Rivera (IUL + proposed FIA 1035 review), Taylor Brooks (underinsured young family), Ruka Tanaka (pre-retiree whole life with loan). Selecting a client loads their full context into the shared workspace.
- **Policy comparison** (`/compare`): deterministic side-by-side rows (carrier, product type, death benefit, cash value, premium, loans, riders), suitability summary requiring human advisor approval, clarification questions, and warnings (life→annuity death-benefit loss, dependents check, loan boot in 1035, surrender schedule restart).
- **Scenario modeling** (`src/lib/scenarios.ts`): deterministic annual projection — cash grows at documented crediting rate, COI grows at documented rate, lapse detected when cash value goes negative. Standard set: current funding / target funding / stop paying, rendered with sparkline charts.

### Carrier engine (Manual §12)
- **Approved content packs** (`src/lib/carrier-kb.ts`): Mutual of Omaha (Life Protection Advantage IUL) and Athene (Performance Elite FIA), each with approved claims, illustration notes, and compliance language.
- **Carrier console** (`/carrier`, in nav for carrier role): answers assembled ONLY from approved claims; compliance language appended verbatim; unknown carriers/products are declined — no unsupported claims generated.

### Platform
- Role-aware navigation (Clients for advisor/IMO, Carrier console for carrier; Compare for all).
- Client roster persistence + active-client activation in the shared localStorage workspace store.

## Tests

`npm test`: **18/18 passing** (Sprint 1: 10, Sprint 2: 8 — scenarios, comparison, roster, carrier packs).
Typecheck, lint, and production build clean. Runtime smoke test: all 11 routes return 200.

## Acceptance criteria check

- Advisor receives client summary, advisor summary, questions, warnings, recommended follow-up ✓ (Sprint 1 report + Sprint 2 comparison)
- Policy comparison, suitability summary, clarification questions, scenario modeling ✓
- Only approved carrier information used ✓ (test asserts every answer sentence comes from the pack)
- Compliance language preserved ✓ (verbatim, test-asserted)
- No unsupported claims generated ✓ (decline path, test-asserted)

## Out of scope (unchanged)

Production deployment, destructive migrations, live carrier APIs, real LLM/OCR vendors.

## Next sprint candidates

- IMO dashboards (advisor activity, carrier analytics — Manual §6)
- Real LLM interview + extraction behind existing interfaces
- Database persistence and real authentication
- Email import channel for ingestion

---

# PolicyWell Morning Report — Sprint 1

**Date:** 2026-07-21  
**Branch:** `cursor/sprint1-mvp-c124`  
**Manual version:** 0.1  
**Previous sprint:** none (initial MVP)

## Verdict

Sprint 1 MVP is implemented end-to-end: conversational onboarding, document ingestion with OCR/extraction/verification, hybrid context Q&A, deterministic PolicyWell scores, agent workspace, reports, feedback capture, and investor demo seed.

## Shipped

### Epic 1 — Onboarding Engine
- Conversational interview (no forms)
- Structured extraction (household, financial, insurance, goals, risk, retirement, carrier)
- Edit extracted fields
- Confidence score + missing-field highlights
- Profile save (localStorage)

### Epic 2 — Insurance Ingestion Engine
- Drag & drop / file upload
- OCR heuristics (Mutual of Omaha IUL demo template)
- AI extraction → structured JSON + confidence
- Human verification + searchable documents

### Hybrid Context + Scores
- Context assembled before every answer
- Deterministic scores: Protection, Retirement, Mortgage, Income Replacement, Beneficiary, Policy Health, Review Priority, Overall Intelligence
- Grounded answers cite document, extracted values, assumptions, confidence

### Agent workspace / Day 4–5
- Analysis timeline
- Client + advisor report (questions, warnings, follow-up)
- Feedback: Accurate / Needs Correction / Not Helpful (does not mutate scoring)
- Investor demo flow + Mutual of Omaha IUL seed

## QA verification (second pass, 2026-07-21 11:14 UTC)

- `npm test`: 10/10 passing (onboarding, ingestion, scoring/context/feedback)
- `npm run build`: clean production build, all 9 routes prerendered
- Runtime smoke test against `next start`: `/`, `/login`, `/demo`, `/onboarding`, `/profile`, `/upload`, `/workspace`, `/report` all return 200; unknown routes return 404; landing, demo, and login render expected content

## Tests

Run: `npm test`

Coverage focuses on acceptance criteria for onboarding, ingestion, scoring, grounded answers, reports, and feedback isolation.

## How to walk through

1. `npm run dev`
2. Open `/` — PolicyWell landing
3. `/demo` → Seed sample data
4. `/workspace` — scores, ask “Will my policy lapse?”, leave feedback
5. `/report` — advisor meeting prep
6. `/onboarding` — try conversational utterances
7. `/upload` — drop a file named with `Mutual` or `IUL`

## Explicitly out of scope (per manual)

- Production deployment
- Destructive migrations
- Live carrier APIs / production OCR vendors
- Auto-updating score logic from individual feedback

## Notes for next sprint

- Wire real LLM interview + document extraction behind the same interfaces
- Persist to a proper database
- Carrier compliance content packs
- Advisor multi-client roster
