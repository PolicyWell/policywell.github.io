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
