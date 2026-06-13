# Implementation Plan: Moonu Chatwoot Omnichannel MVP

**Branch**: `001-chatwoot-omnichannel-mvp` | **Date**: 2026-06-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-chatwoot-omnichannel-mvp/spec.md`

## Summary

Build a **local-first Moonu Simulator** — a standalone TypeScript web application that provisions simulated Moonu customers (telephony, extensions, subscription status) and manages an **Omnichannel add-on** backed by an external self-hosted **Chatwoot** instance. The MVP uses a **single Next.js monolith** (Option A) with Prisma + PostgreSQL, a **Chatwoot adapter interface** (`mock` | `real`), and a realistic demo UI that works without real WhatsApp credentials. Chatwoot source code is not modified.

**Research**: [research.md](./research.md) — Option A selected; Platform API for workspace/user provisioning; WhatsApp inbox manual in v1.

**Delivery**: Four implementation slices ([spec.md](./spec.md#implementation-slices)); MVP = Slice 1 only (tasks T001–T043).

---

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20+

**Primary Dependencies**: Next.js 15 (App Router), React 19, Prisma, Tailwind CSS, Zod (validation)

**Storage**: PostgreSQL 16 (simulator DB via Docker); SQLite fallback documented for Prisma local dev

**Testing**: Vitest (unit), Playwright or Vitest + fetch (API integration), adapter contract tests with mock/real modes

**Target Platform**: Local development on Linux/macOS/WSL2; Docker Compose orchestration

**Project Type**: Web application (admin simulator + REST API)

**Performance Goals**: Admin UI interactions < 1s perceived; adapter calls show loading states; no scale targets for MVP

**Constraints**:

- No Chatwoot fork or source modifications
- No real PBX/SIP/billing
- Secrets in `.env.local` only
- No real WhatsApp credentials required for first demo
- Prefer mock Chatwoot mode until Platform API verified against running instance

**Scale/Scope**: ~7 screens, 5 domain entities, 3 seed customers (1 Slice 1, +2 Slice 2), single admin persona

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verified against `.specify/memory/constitution.md` v1.1.0 (key principles):

| Area | Pre-Design | Post-Design |
|------|------------|-------------|
| I. Simplicity / vertical slices | PASS — Option A monolith | PASS |
| II–III. External Chatwoot + upgradeability | PASS — Platform API; no fork | PASS |
| IV–V. Local-first + deployable | PASS — mock default; env config | PASS |
| VI. Architectural boundaries | PASS — adapter interface | PASS |
| VII. Tenant isolation | PASS — 1 Account/Customer; 2+ tenants | PASS |
| VIII–IX. Security + visible MVP | PASS — 7 screens planned | PASS |
| X. Manual first | PASS — checklist + status honesty | PASS |
| XI–XII. Hypothesis + tests | PASS — phases map to questions; test plan | PASS |
| XIII–XV. Docs, cost, ops | PASS — quickstart, contracts, compose profiles | PASS |
| XVI–XVIII. Reversible, no PBX, white-label | PASS — mock/real swap; no SIP; no deep branding | PASS |

**Gaps to address in implementation**: seed all three demo customers (Clínica Exemplo, Escritório
Contábil Alfa, Loja Boa Luz); add `docs/decisions/` and `docs/production-gaps.md`.

**Post-design re-check**: PASS — adapter is sole Chatwoot extension point; no unjustified complexity.

---

## 1. Architecture

### System Context

```text
┌─────────────────────────────────────────────────────────────┐
│                     Moonu Simulator                          │
│  ┌──────────────┐    ┌──────────────┐    ┌───────────────┐  │
│  │  Next.js UI  │───▶│  API Routes  │───▶│ Domain Services│  │
│  │  (React)     │    │  /api/*      │    │ + Prisma      │  │
│  └──────────────┘    └──────────────┘    └───────┬───────┘  │
│                                                   │          │
│                                          ┌────────▼────────┐ │
│                                          │ ChatwootAdapter │ │
│                                          │ mock │ real     │ │
│                                          └────────┬────────┘ │
└───────────────────────────────────────────────────┼─────────┘
                                                    │ HTTPS
                                          ┌─────────▼─────────┐
                                          │ Chatwoot (external)│
                                          │ Platform + App API │
                                          └───────────────────┘

┌─────────────────┐
│ moonu-db (PG)   │  ← Simulator only (not Chatwoot's DB)
└─────────────────┘
```

### Layering

| Layer | Responsibility |
|-------|----------------|
| **UI** (`src/app/`, `src/components/`) | Screens, forms, status badges, checklist |
| **API** (`src/app/api/`) | HTTP handlers, Zod validation, error mapping |
| **Domain** (`src/server/services/`) | Customer, telephony, omnichannel, agent orchestration |
| **Integration** (`src/lib/chatwoot/`) | `ChatwootAdapter` implementations |
| **Data** (`prisma/schema.prisma`) | Persistence |

### Option A vs Option B

| Criterion | Option A: Next.js monolith | Option B: Split FE + BE |
|-----------|---------------------------|-------------------------|
| Services to run | 1 (+ DB) | 2 (+ DB) |
| Shared types | Native | Requires package or codegen |
| Time to demo | **Fastest** | Slower |
| Team parallelism | Low need | Higher |
| **Decision** | **Selected** | Deferred |

### Chatwoot Boundary

- Moonu Simulator owns: customers, telephony simulation, subscription flags, linkage IDs, setup status.
- Chatwoot owns: conversations, inboxes, WhatsApp channel config, agent inbox UI.
- Telephony extensions never sync to Chatwoot.

---

## 2. Data Model

Full detail: [data-model.md](./data-model.md)

**Entities**: Customer, PhoneNumber, Extension, Agent, OmnichannelSetup

**Key decisions**:

- `OmnichannelSetup.checklistJson` stores WhatsApp step state (flexible without schema migrations).
- `Agent.status` includes `conflict` for duplicate Chatwoot emails.
- `setupMode` on OmnichannelSetup records `mock` | `automated` | `manual` for transparency.

---

## 3. API Endpoints

Full contract: [contracts/rest-api.md](./contracts/rest-api.md)

| Group | Endpoints |
|-------|-----------|
| Customers | `GET/POST /customers`, `GET/PATCH /customers/:id` |
| Phone numbers | CRUD under `/customers/:id/phone-numbers` |
| Extensions | CRUD under `/customers/:id/extensions` |
| Omnichannel | `POST .../enable`, `GET .../omnichannel`, `PATCH .../link` (Slice 2 manual account ID), `POST .../retry` (Slice 3+), `GET .../open` |
| Agents | `GET/POST /customers/:id/agents`, `POST .../retry`, `DELETE` |
| WhatsApp | `GET/PATCH .../whatsapp-checklist` |
| Health | `GET /health` |

---

## 4. UI Screens

| # | Screen | Route | Key actions |
|---|--------|-------|-------------|
| 1 | Customer list | `/customers` | List, search, create customer |
| 2 | Customer detail | `/customers/[id]` | Overview, subscription badge, nav to sub-sections |
| 3 | Phone numbers & extensions | `/customers/[id]/telephony` | Tabs: numbers + extensions CRUD |
| 4 | Omnichannel setup | `/customers/[id]/omnichannel` | Enable add-on, manual account ID link (S2), retry (S3+), setup mode indicator |
| 5 | Agent management | `/customers/[id]/agents` | Add agents, sync status, retry |
| 6 | Chatwoot connection status | `/customers/[id]/omnichannel/status` | Workspace health, adapter mode, last sync |
| 7 | WhatsApp setup checklist | `/customers/[id]/omnichannel/whatsapp` | Six steps, manual guidance, status badges |

**Global UI patterns**:

- Status chips: `not_started`, `manual_setup_required`, `pending`, `connected`, `failed`
- Primary CTA: **Open Omnichannel Inbox** (disabled until omnichannel enabled)
- Banner when `CHATWOOT_MODE=mock`: "Demo mode — Chatwoot operations simulated"

---

## 5. Chatwoot Adapter Design

Full contract: [contracts/chatwoot-adapter.md](./contracts/chatwoot-adapter.md)

```text
ChatwootAdapter (interface)
├── MockChatwootAdapter          ← CHATWOOT_MODE=mock (default)
├── RealUrlChatwootAdapter       ← CHATWOOT_MODE=real, no platform token (Slice 2)
└── PlatformApiChatwootAdapter   ← CHATWOOT_MODE=real + CHATWOOT_PLATFORM_API_TOKEN (Slice 3+)
```

**Factory**: `getChatwootAdapter()` reads env at request time (testable via DI).

**Domain service flow — Enable Omnichannel**:

1. Validate customer exists, not already enabled.
2. `adapter.createWorkspace({ name: companyName })`.
3. Persist `chatwootAccountId`, upsert `OmnichannelSetup`, update checklist `chatwoot_account`.
4. Set `whatsapp_inbox` → `manual_setup_required`.
5. Return dashboard DTO.

**Domain service flow — Create Agent**:

1. Require `omnichannelEnabled`.
2. `adapter.createUser` → `adapter.addUserToWorkspace`.
3. Update `Agent.chatwootUserId` and `status`.

**Mock fallback**: When `real` mode fails reachability check, optionally degrade with user-visible warning (do not silently switch — show `failed` + retry).

---

## 6. Local Environment Setup

### Docker Compose Services

| Service | Profile | Port | Purpose |
|---------|---------|------|---------|
| `moonu-simulator` | default | 3000 | Next.js app |
| `moonu-db` | default | 5433 | PostgreSQL for simulator |
| `chatwoot` | `chatwoot` | 3001 | Self-hosted Chatwoot |
| `chatwoot-postgres` | `chatwoot` | — | Chatwoot DB |
| `chatwoot-redis` | `chatwoot` | — | Chatwoot cache |

### Environment Files

- `.env.example` — committed template, no secrets
- `.env.local` — developer secrets (gitignored)
- `docker-compose.yml` — service wiring

### Chatwoot Platform App Setup (real mode)

1. Start Chatwoot with `--profile chatwoot`
2. Super Admin → Platform Apps → Create app → copy token
3. Set `CHATWOOT_PLATFORM_API_TOKEN` in `.env.local`

### Commands

```bash
docker compose up -d moonu-db
npm install && npx prisma migrate dev && npm run dev
# Optional:
docker compose --profile chatwoot up -d
```

See [quickstart.md](./quickstart.md) for validation scenarios.

---

## 7. Testing Strategy

| Layer | Tool | Scope |
|-------|------|-------|
| Unit | Vitest | Zod schemas, checklist transitions, adapter mock responses |
| Adapter contract | Vitest | Mock adapter implements full interface; snapshot operation classification |
| API integration | Vitest + test DB | Customer CRUD, enable omnichannel (mock), agent sync |
| E2E (optional) | Playwright | Primary demo journey on mock mode |
| Manual | quickstart.md | Real Chatwoot mode + tenant isolation with 2 customers |

**Critical test cases**:

- Enable omnichannel creates distinct mock account IDs per customer
- Agent email conflict surfaces `status: conflict`
- Chatwoot unreachable → `connectionHealth.chatwootReachable: false`, cached IDs preserved
- WhatsApp checklist initializes six steps on enable
- Open inbox URL contains correct `accountId` per customer

**CI (future)**: `npm run test` + `npm run lint` on PR; E2E optional due to Chatwoot dependency.

---

## 8. Risks and Unknowns

| Risk | Impact | Mitigation |
|------|--------|------------|
| Platform API cannot list inboxes | WhatsApp auto-detection blocked | Manual checklist; document in adapter contract |
| Platform token scope limits | Cannot link pre-existing Chatwoot accounts | Moonu always creates workspaces via adapter in real mode |
| Chatwoot version API drift | Real adapter breaks | Pin Chatwoot image version; integration test in CI when profile enabled |
| Inbox creation not in Platform API | No automated WhatsApp | Explicit `manual_setup_required` UI |
| Developer Chatwoot setup friction | Slow onboarding | Default `mock` mode; Chatwoot behind compose profile |
| Tenant isolation assumptions wrong | SaaS model risk | Document findings in `docs/chatwoot-investigation.md`; validate with 2 tenants |
| AGPL branding limits | Product positioning | Research doc; no white-label in MVP |

**Open strategic questions** (document, do not block MVP): shared vs per-customer Chatwoot deployment, subscription-driven access disable, Embedded Signup UX.

---

## 9. Implementation Phases

> **Authoritative delivery model**: Four slices defined in [spec.md](./spec.md#implementation-slices).
> Task breakdown: [tasks.md](./tasks.md). This section maps slices to plan architecture.

### Slice 1 — Local Visible Demo (MVP checkpoint)

- Next.js + Prisma + PostgreSQL + Docker Compose (`moonu-db` only)
- Customer list/detail, telephony (phone numbers + extensions)
- `ChatwootAdapter` interface + `MockChatwootAdapter` + factory (`CHATWOOT_MODE=mock`)
- Omnichannel enable, mock workspace status, mocked WhatsApp checklist (GET only)
- Open Chatwoot button (mock dashboard URL), connection status page
- Seed: **Clínica Exemplo** only
- Core tests: mock adapter unit + Slice 1 integration (constitution Principle XII)

**Out of scope**: Real Chatwoot, agents UI, manual ID linking, tenant isolation demo, API automation.

**Exit**: SC-001 — one customer, mock omnichannel, no external services. Tasks **T001–T043**.

### Slice 2 — Real Chatwoot Runtime

- Chatwoot compose profile; `CHATWOOT_BASE_URL` in env
- `RealUrlChatwootAdapter` — real URLs from manually stored account/user IDs (no Platform API yet)
- Manual account/user creation in Chatwoot UI + link forms in simulator
- Agent management UI with manual `chatwootUserId` link
- Tenant isolation: **two+ customers** with distinct linked account IDs (Escritório Contábil Alfa, Loja Boa Luz seeded)
- Tenant isolation integration test (`tests/integration/tenant-isolation.test.ts`) — **T075**, gates Slice 2 exit (SC-006)
- Unreachable Chatwoot handling on status UI

**Exit**: SC-002 + SC-006. Tasks **T044–T057, T075**.

### Slice 3 — API Automation Research

- Spike Platform API; document in `docs/decisions/0001-chatwoot-platform-api.md`
- `PlatformApiChatwootAdapter` — replace mock/manual ops incrementally
- `docs/chatwoot-operations.md` automated/manual/unknown matrix
- Retry provisioning endpoint; agent sync via API when verified, manual fallback retained

**Exit**: SC-005 + ≥1 API-driven operation with fallback. Tasks **T058–T066**.

### Slice 4 — WhatsApp Setup Flow

- Embedded Signup vs manual decision doc
- Checklist PATCH API, PT-BR guidance copy, optional inbox detection
- One real WhatsApp Cloud API number trial + blocker doc

**Exit**: Documented real setup attempt. Tasks **T067–T072**.

### Cross-cutting — Polish & quality gates

- Extend tests for edge cases
- `docs/production-gaps.md`, operational README notes, quickstart validation
- Tasks **T073–T080**

**Note**: Adapter evolution is **mock → real-url → platform-api** (three implementations, one interface).

---

## Project Structure

### Documentation (this feature)

```text
specs/001-chatwoot-omnichannel-mvp/
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/
│   ├── rest-api.md
│   └── chatwoot-adapter.md
└── tasks.md             # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
chatwoot-mvp/
├── docker-compose.yml
├── .env.example
├── package.json
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # redirect → /customers
│   │   ├── customers/
│   │   │   ├── page.tsx                # list
│   │   │   └── [id]/
│   │   │       ├── page.tsx            # detail
│   │   │       ├── telephony/page.tsx
│   │   │       ├── agents/page.tsx
│   │   │       └── omnichannel/
│   │   │           ├── page.tsx
│   │   │           ├── status/page.tsx
│   │   │           └── whatsapp/page.tsx
│   │   └── api/
│   │       ├── health/route.ts
│   │       └── customers/...
│   ├── components/
│   │   ├── ui/                         # buttons, badges, tables
│   │   ├── customers/
│   │   ├── omnichannel/
│   │   └── checklist/
│   ├── lib/
│   │   ├── db.ts
│   │   ├── validations/
│   │   └── chatwoot/
│   │       ├── adapter.ts              # interface
│   │       ├── factory.ts
│   │       ├── mock-adapter.ts
│   │       └── platform-api-adapter.ts
│   └── server/
│       └── services/
│           ├── customer-service.ts
│           ├── telephony-service.ts
│           ├── omnichannel-service.ts
│           └── agent-service.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── docs/
    ├── chatwoot-operations.md
    └── chatwoot-investigation.md
```

**Structure Decision**: Single Next.js application at repository root (Option A). No separate `frontend/` or `backend/` packages. Chatwoot runs as external Docker service, not in application source tree.

---

## Complexity Tracking

> No constitution violations requiring justification.

| Item | Status |
|------|--------|
| Adapter interface (2 implementations) | Justified by spec FR-011/FR-012 and mock-first demo |
| Separate Chatwoot DB in compose | Required — external system boundary |
