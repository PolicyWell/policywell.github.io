# PolicyWell Engineering Manual

**Version 0.1** — “Building the Intelligence Layer for Insurance.”

This repository implements the PolicyWell Sprint 1 MVP according to the Engineering Manual.

## Development rules

Every task must:

1. Read Engineering Manual
2. Read Previous Sprint
3. Read Acceptance Criteria
4. Implement Feature
5. Write Tests
6. Run Tests
7. Generate Morning Report
8. Stop

- No production deployment
- No destructive migrations
- No guessing

## Sprint 1 status

| Day | Scope | Status |
|-----|-------|--------|
| 1 | Repo, auth, landing, natural layout, conversational onboarding | Done |
| 2 | Household profile, upload, OCR, extraction, review/edit | Done |
| 3 | Hybrid context engine, deterministic scores, AI explanation | Done |
| 4 | Agent workspace, timeline, reports, feedback | Done |
| 5 | QA, polish, investor demo, seed data, walkthrough | Done |

## Sprint 2 status

| Scope | Status |
|-------|--------|
| Advisor client roster (3 seeded households, workspace activation) | Done |
| Policy comparison engine (IUL vs FIA, suitability, 1035 warnings) | Done |
| Scenario modeling (deterministic projections, lapse detection) | Done |
| Carrier content packs + compliance-preserving console | Done |
| Role-aware navigation | Done |

## Sprint 3 status

| Scope | Status |
|-------|--------|
| IMO analytics (advisor activity, carrier distribution, review pipeline) | Done |
| Standardized annual review checklist | Done |
| IMO dashboard + IMO demo role | Done |
| Email import ingestion channel | Done |

## Sprint 4 status

| Scope | Status |
|-------|--------|
| Deterministic recommendation engine (7 rules, rationale + confidence) | Done |
| Human approval queue (approve/reject, gates client report) | Done |
| Score history snapshots + trend | Done |

## Sprint 5 status

| Scope | Status |
|-------|--------|
| Follow-up tasks from approved recommendations (dated, idempotent) | Done |
| Tasks page with overdue tracking | Done |
| Meeting preparation pack + markdown export | Done |

## Sprint 6 status (Agent)

| Scope | Status |
|-------|--------|
| Agent runtime with 10 tools, planner, synthesizer | Done |
| Optional OpenAI synthesis when OPENAI_API_KEY set | Done |
| Primary /agent chat UI + /api/agent | Done |
| Landing/login wired to agent | Done |

## Sprint 7 status (Firm ops)

| Scope | Status |
|-------|--------|
| Task assignment / ownership across firm roster | Done |
| Broker-dealer / FI firm supervision console (`/firm`) | Done |
| Suitability & compliance queue from comparison + scores | Done |
| Demo role `riley@firm.example` (broker_dealer) | Done |
| Stable localStorage snapshots (fix /agent React #185) | Done |

## Sprint 8 candidate (CLI)

| Scope | Status |
|-------|--------|
| Compliance-first `pw` CLI for client / producer / IMO / carrier | Design — see [CLI_DESIGN.md](./CLI_DESIGN.md) |

## Architecture

- **Next.js App Router** UI (minimal, premium, natural pine/sage aesthetic)
- **Demo authentication** — role-gated sessions (`policyholder` / `advisor` / `carrier`)
- **Conversational onboarding** — utterance → structured profiles with confidence + edit
- **Ingestion engine** — drag/drop, OCR heuristics, extraction JSON, human verification, search
- **Hybrid context engine** — always builds context before answering
- **Deterministic PolicyWell Score** — explainable; feedback does not auto-mutate scores
- **localStorage workspace** — Sprint 1 persistence (no production DB)

## Demo accounts

- `alex@example.com` — policyholder
- `jordan@advisors.example` — advisor
- `casey@imo.example` — IMO
- `riley@firm.example` — broker-dealer / FI
- `morgan@carrier.example` — carrier

Investor path: `/demo` → Seed sample data → Workspace → Report.
Firm path: login as `riley@firm.example` → `/firm` → Load firm demo.
