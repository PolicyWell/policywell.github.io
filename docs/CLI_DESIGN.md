# PolicyWell CLI Design - Compliance-first producer / IMO / carrier / client tool

**Status:** Design (Sprint 8 candidate)  
**Version:** 0.1  
**Date:** 2026-07-21  
**Binary name:** `pw`  
**Principle:** Same intelligence engines as the web app. Stricter surface area per role. No silent LLM claims.

---

## 1. Goal

Ship a single CLI that producers, IMOs, carriers, and clients can use in terminals, scripts, and advisor workflows - while remaining **compliance-safe**:

| Audience | Primary job in the CLI |
|----------|------------------------|
| **Client / policyholder** | Understand *their* household & policy context; see scores & approved guidance only |
| **Producer / advisor** | Run analysis, scenarios, comparisons; approve recommendations; prepare meetings |
| **IMO / firm / BD** | Supervise books, assignment, review pipelines, suitability flags |
| **Carrier** | Answer *only* from approved content packs; never invent product claims |

The CLI is **not** a freestyle chatbot. It is a **role-gated command surface** over deterministic PolicyWell engines, with optional LLM phrasing that is always secondary and labeled.

---

## 2. Compliance pillars (non-negotiable)

These map to engines already in the repo and must be enforced in CLI code paths, not “documented only.”

1. **Context before answer** - Every analysis command rebuilds hybrid context (`buildHybridContext`) before scoring or Q&A.
2. **Grounded outputs** - Policy answers cite document, extracted values, confidence, assumptions. Decline when evidence is missing.
3. **Human approval gate** - Recommendations start `pending`. Client-facing exports (`report`, `meeting-prep`) include **approved only**.
4. **Carrier pack isolation** - `pw carrier ask` uses `answerCarrierQuestion` only. Unsupported → explicit decline + compliance footer.
5. **No auto-mutating scores from feedback** - Feedback is logged; scores stay deterministic.
6. **Auditability** - Every mutating command writes an append-only audit event (who, role, command, inputs hash, outputs summary, timestamp).
7. **LLM is optional & labeled** - If Gemini/OpenAI is used for phrasing, stdout marks `synthesis: llm` vs `synthesis: deterministic`. Never let LLM invent numbers or carrier claims.
8. **Disclaimers** - Client and carrier command groups always append a short, role-appropriate disclaimer footer.

---

## 3. Architecture

```
pw (CLI)
 ├── auth / role session          → ~/.config/policywell/session.json
 ├── workspace store              → ~/.local/share/policywell/ (or --workspace)
 ├── command router (role ACL)
 ├── engines (shared with web)
 │    scoring · context · extraction · comparison
 │    scenarios · recommendations · tasks · imo · firm · carrier-kb · agent
 ├── output formatters            → text | json | markdown
 └── audit log                   → audit.jsonl
```

**Implementation note:** Extract shared engine imports into a Node-safe package boundary (`src/lib/*` already mostly pure). CLI lives at `packages/cli` or `src/cli` and **must not** import Next.js or `server-only` LLM modules except behind an explicit `pw agent ask --llm` path.

### Auth (MVP)

```bash
pw login --email jordan@advisors.example
pw whoami
pw logout
```

MVP reuses demo accounts / API tokens later. Session stores `{ userId, email, name, role, issuedAt }`. Every command checks role ACL before running.

---

## 4. Role → command ACL

| Command group | Client | Producer | IMO / Firm | Carrier |
|---------------|:------:|:--------:|:----------:|:-------:|
| `pw context` / `pw profile` | ✓ (self) | ✓ (active client) | ✓ (read books) | - |
| `pw ingest` / `pw docs` | ✓ (own) | ✓ | read | - |
| `pw scores` | ✓ | ✓ | ✓ | - |
| `pw ask` (grounded policy Q&A) | ✓ | ✓ | ✓ | - |
| `pw scenarios` | ✓ (view) | ✓ | ✓ | - |
| `pw compare` | - | ✓ | ✓ | - |
| `pw recs` (list / approve / reject) | view approved | ✓ | ✓ | - |
| `pw report` / `pw meeting-prep` | ✓ (approved only) | ✓ | ✓ | - |
| `pw tasks` / assign | view own | ✓ | ✓ | - |
| `pw clients` / `pw imo` / `pw firm` | - | limited | ✓ | - |
| `pw carrier` | - | ask (pack) | ask (pack) | ✓ (manage packs later) |
| `pw agent` | ✓ | ✓ | ✓ | pack-only ask |
| `pw audit` | own | own book | firm | own |

`--force` never bypasses approval gates or carrier pack rules.

---

## 5. Command surface (v1)

Global flags on all commands:

```
--workspace <path>   # default: user data dir
--format text|json|md
--quiet              # machine-friendly, no tips
--no-llm             # default: deterministic only
--client <id>        # producer/IMO: set active household
```

### 5.1 Shared / session

```bash
pw login --email <email>
pw whoami
pw workspace init
pw workspace status
pw client use <id>          # producer/IMO
pw client list
```

### 5.2 Client & producer - household intelligence

```bash
pw context show
pw context update "married, 3 kids, TX, Mutual of Omaha IUL"
pw ingest file ./ledger.pdf
pw ingest email --from-file ./message.eml
pw docs list
pw docs verify <docId>      # producer+ ; client confirms own
pw scores [--explain]
pw ask "Will my policy lapse?"
pw scenarios run
pw compare --current <docA> --proposed <docB>
```

**Compliance behavior for `pw ask`:**
- Runs `update_context` heuristics only when utterance contains household facts (or via explicit `context update`).
- Answers via grounded `analyze_policy` / context engine.
- Prints grounding block: document · values · confidence · assumptions.
- If confidence &lt; threshold or no verified doc: exit code `3` (insufficient evidence), not a speculative answer.

### 5.3 Recommendations & human approval

```bash
pw recs generate
pw recs list [--status pending|approved|rejected]
pw recs approve <id|--all>
pw recs reject <id> --reason "..."
pw report export --out report.md      # approved only
pw meeting-prep export --out prep.md  # approved only
```

Client role: `recs list` shows **approved** only; `approve`/`reject` denied (exit `4` forbidden).

### 5.4 Tasks / firm ownership

```bash
pw tasks generate          # from approved recs
pw tasks list [--mine|--unassigned|--overdue]
pw tasks assign <taskId> --to adv_jordan
pw tasks done <taskId>
```

### 5.5 IMO / firm supervision

```bash
pw imo summary
pw imo pipeline [--status overdue|due|current]
pw imo checklist <clientId>
pw firm summary
pw firm suitability
pw firm board
```

### 5.6 Carrier (compliance-preserving)

```bash
pw carrier packs
pw carrier ask --carrier "Mutual of Omaha" "How does the IUL index credit?"
```

Rules:
- Answer assembled **only** from approved claims.
- Always append pack `complianceLanguage`.
- Unknown carrier/product → `supported: false`, non-zero exit `5`.
- No `--llm` override allowed on this path.

### 5.7 Agent (orchestrated turn)

```bash
pw agent ask "What do you recommend?"
pw agent ask "approve all" --no-llm
pw agent tools                 # list tool catalog
```

Same planner → tools → synthesizer as `/api/agent`. Default `--no-llm`. `--llm` only upgrades phrasing after tools run; if LLM fails, keep deterministic reply (current web behavior).

---

## 6. Output contracts

### Text (default)

Human-readable sections with stable headers for grepping:

```
## Scores
Overall: 72
Policy health: 68
...
## Grounding
Document: Mutual_of_Omaha_IUL_InForce.pdf
Confidence: 82%
Assumptions:
- ...
## Disclaimer
PolicyWell provides decision support, not a recommendation or guarantee...
```

### JSON (`--format json`)

Stable schema per command, e.g. scores:

```json
{
  "ok": true,
  "role": "advisor",
  "command": "scores",
  "synthesis": "deterministic",
  "data": { "overallIntelligenceScore": 72, "...": "..." },
  "grounding": { "documentIds": ["..."], "confidence": 0.82 },
  "disclaimer": "..."
}
```

### Exit codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 2 | Usage / validation error |
| 3 | Insufficient evidence / unverified docs |
| 4 | Forbidden for role |
| 5 | Carrier pack unsupported |
| 6 | Approval gate blocked (pending recs required) |
| 1 | Unexpected failure |

---

## 7. Audit log

Append-only `audit.jsonl` per workspace:

```json
{
  "ts": "2026-07-21T13:00:00.000Z",
  "actor": { "id": "user_jordan", "role": "advisor", "email": "jordan@advisors.example" },
  "command": ["recs", "approve", "rec_fund_to_target"],
  "clientId": "client_alex",
  "result": "ok",
  "exitCode": 0,
  "summary": "Approved fund-to-target recommendation"
}
```

`pw audit tail [--client <id>]` for producers/IMOs. Carriers see only `carrier` commands. Clients see only their own actor events.

---

## 8. UX principles (CLI-specific)

- **Role-first prompts:** After login, help text is filtered to allowed commands.
- **Safe defaults:** Deterministic synthesis; client exports never include pending recs.
- **Scriptable:** JSON + exit codes first-class for IMO/ops automation.
- **Explainable:** `--explain` on scores prints the same score explanations as the web engine.
- **No dark patterns:** No “auto-approve,” no hidden LLM claims, no carrier free-text generation.

---

## 9. Suggested directory layout

```
src/cli/
  index.ts              # entry (bin: pw)
  program.ts            # commander/yargs router + ACL
  session.ts
  workspace-fs.ts       # file-backed store (not localStorage)
  format.ts
  audit.ts
  commands/
    login.ts
    context.ts
    ingest.ts
    scores.ts
    ask.ts
    scenarios.ts
    compare.ts
    recs.ts
    report.ts
    tasks.ts
    imo.ts
    firm.ts
    carrier.ts
    agent.ts
    audit.ts
```

Reuse: `src/lib/*` engines unchanged. Add thin `workspace-fs` adapter implementing the same operations as web `storage.ts`.

---

## 10. Acceptance criteria (Sprint 8)

1. `pw login` as each demo role; `pw whoami` shows role.
2. Client cannot `pw recs approve` (exit 4); can `pw report export` with approved-only content.
3. Producer can ingest → scores → ask (grounded) → generate recs → approve → meeting-prep.
4. `pw carrier ask` for unknown product exits 5 and prints pack decline + compliance language.
5. `pw agent ask` without LLM matches web deterministic synthesizer tool order (context first).
6. Audit log records approve/reject/assign/carrier-ask.
7. Tests: ACL matrix, approval gating on report export, carrier pack isolation, exit codes.
8. Morning report documents CLI surface; no production deploy.

---

## 11. Out of scope (v1)

- Production IdP / SSO
- Network multi-tenant API (CLI is local workspace + optional future `pw api` remote)
- Editing carrier packs in CLI (read-only packs from code)
- Interactive TUI dashboard (commands first; TUI later)

---

## 12. Example workflows

**Client**
```bash
pw login --email alex@example.com
pw ingest file ./inforce.pdf
pw scores --explain
pw ask "Am I at risk of lapse?"
pw report export --out my-report.md   # only after advisor approved recs
```

**Producer**
```bash
pw login --email jordan@advisors.example
pw client use client_alex
pw context update "worried about lapse"
pw scenarios run
pw recs generate && pw recs approve --all
pw meeting-prep export --out alex-prep.md
pw tasks generate && pw tasks assign task_rec_fund_to_target --to adv_jordan
```

**IMO / firm**
```bash
pw login --email riley@firm.example
pw firm summary
pw firm suitability --format json
pw tasks list --unassigned
```

**Carrier**
```bash
pw login --email morgan@carrier.example
pw carrier packs
pw carrier ask --carrier "Mutual of Omaha" "What is Life Protection Advantage?"
```

---

## 13. Decision summary

| Decision | Choice | Why |
|----------|--------|-----|
| One binary vs many | One `pw` + role ACL | Shared engines, simpler install, harder to misuse |
| Chat-first vs commands | Commands first; `agent ask` secondary | Compliance prefers explicit verbs |
| LLM default | Off | Avoid ungrounded producer/client output |
| Storage | File workspace, not browser localStorage | CLI/automation friendly + audit |
| Carrier path | Pack-only, no LLM | Matches Manual §12 |

---

*Next step when approved: implement Sprint 8 per §10 acceptance criteria.*
