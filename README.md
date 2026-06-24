# Nudge — Agentic Revenue CRM by NuStack (Release 0 Prototype)

> **Nudge** turns sales signals into explainable judgments and *nudges* the next
> best action, gated by confidence. The action queue is the home; the CRM record
> is a byproduct.

A working **closed-loop revenue execution** prototype: sales activity becomes
signals, signals become explainable deal judgments, judgments become
confidence-gated actions, and human corrections become structured learning data.

This is **Release 0** from the PRD ("demonstrate the loop with mocked
integrations") — not a dashboard-first CRM and not an auto-capture-only CRM.

## The loop this proves

```
transcript ─▶ Conversation Intelligence ─▶ signals ─▶ scores/judgments
                                                         │
   learning events ◀─ override/approve ◀─ Today Queue ◀─ stage proposal + actions
```

Concretely: paste a meeting transcript in a Deal Room → the agent extracts
evidence-cited signals → deal scores recalculate → the Stage Progression Agent
proposes a move (gated by confidence + autonomy policy) → you approve or reject
with a one-click reason → every step is audited and corrections become learning
events.

## Run it

```bash
npm install
npm run dev          # http://localhost:3000 (or 3001 if 3000 is taken)
```

No API key, no database, no external services required. All state is in-memory
and reseeds on server restart. Use **Reset demo** (top-right) to restore seed data.

## Demo flow (PRD 22.3)

1. **Today** — ranked action queue. Top card: a stage proposal for Acme.
2. Open the **Deal Room** (click any deal). Review the signal timeline,
   scores, buying group, MEDDPICC qualification, and audit trail.
3. In the Deal Room, **Process meeting transcript** → "Load sample" → run it.
   Watch scores jump and a new stage proposal appear.
4. **Approve** the stage move (or **Reject** and pick a reason). The deal
   advances; an audit event and learning event are written.
5. Go to **Forecast** — the changed deal shows up; override its category as a
   manager and see the override pattern logged.

## Architecture

| Layer | Location | Notes |
|---|---|---|
| Domain types | `src/lib/types.ts` | Mirrors PRD 04 objects + enums |
| Agent runtime | `src/lib/agents/` | Provider interface + deterministic mock |
| Scoring | `src/lib/agents/scoring.ts` | Composable, explainable scores (PRD 06) |
| Stage progression | `src/lib/agents/stageProgression.ts` | Evidence-gated proposals (PRD 07.8) |
| Autonomy | `src/lib/agents/autonomy.ts` | Confidence × risk → mode (PRD 08) |
| Store / orchestration | `src/lib/store.ts` | In-memory DB + the closed loop |
| Seed data | `src/lib/seed.ts` | PRD 22.2 first-prototype seed |
| API | `src/app/api/**` | REST handlers (PRD 11.2 subset) |
| UI | `src/app/**`, `src/components/**` | Today / Deals / Deal Room / Forecast |

### Swapping the mock agent for real Claude

The agent layer is provider-agnostic. `src/lib/agents/mockProvider.ts` exports
`agentProvider: AgentProvider`. To go live, implement the same `AgentProvider`
interface (`src/lib/agents/types.ts`) with an Anthropic SDK call and swap the
export — **no caller changes**. The mock uses deterministic keyword extraction so
the demo runs offline and reproducibly.

## What's intentionally out of scope (Release 0)

- Auth / multi-tenant isolation (single seeded workspace)
- Real Gmail / Calendar / Gong integrations (manual transcript paste instead)
- Persistence (in-memory only; resets on restart)
- Model retraining (learning events are logged, not consumed)
- Autonomous customer-facing actions (drafts only, per PRD 12.4)

These map to Release 1+ in the PRD. The point of Release 0 is the loop.

## PRD principles honored

- **Action queue over dashboard** — the home is a ranked queue, not charts.
- **Evidence before judgment** — every score/proposal cites source signals.
- **Confidence-gated autonomy** — actions queue for approval below threshold.
- **Human correction is a primitive** — reject in one click with a reason code.
- **Trust as a UX layer** — actor, confidence, rationale, evidence, audit on
  every agent action.
