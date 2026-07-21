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
