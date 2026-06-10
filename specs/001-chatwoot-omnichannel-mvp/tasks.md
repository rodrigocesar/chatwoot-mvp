---
description: "Task list for Moonu Chatwoot Omnichannel MVP"
---

# Tasks: Moonu Chatwoot Omnichannel MVP

**Input**: Design documents from `/specs/001-chatwoot-omnichannel-mvp/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Organization**: Phases follow **Implementation Slices 1→4** from spec.md. User story labels map to spec priorities. **Slice 1 is the MVP checkpoint** (no Chatwoot required).

**Format**: `[ID] [P?] [Story?] Description with file path`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize Next.js monolith, Docker, and tooling per plan.md

- [ ] T001 Create `package.json` with Next.js 15, React 19, Prisma, Tailwind, Zod, Vitest scripts in `package.json`
- [ ] T002 [P] Add TypeScript config in `tsconfig.json` and Next.js config in `next.config.ts`
- [ ] T003 [P] Add Tailwind config in `tailwind.config.ts` and `src/app/globals.css`
- [ ] T004 Create `docker-compose.yml` with `moonu-db` (PostgreSQL 16, port 5433) service only for Slice 1
- [ ] T005 Create `.env.example` with `DATABASE_URL`, `CHATWOOT_MODE=mock`, `CHATWOOT_BASE_URL` placeholders
- [ ] T006 [P] Add ESLint/Prettier config in `eslint.config.mjs` and `.prettierrc`
- [ ] T007 Create root `README.md` with Slice 1 quick-start pointer to `specs/001-chatwoot-omnichannel-mvp/quickstart.md`
- [ ] T008 [P] Create Vitest config in `vitest.config.ts` and test script entries in `package.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema, adapter contract, shared libs — MUST complete before Slice 1 UI

**⚠️ CRITICAL**: No user story work until this phase is complete

- [ ] T009 Define Prisma schema for Customer, PhoneNumber, Extension, Agent, OmnichannelSetup in `prisma/schema.prisma`
- [ ] T010 Run initial migration and create `prisma/migrations/` via `npx prisma migrate dev`
- [ ] T011 Create Prisma client singleton in `src/lib/db.ts`
- [ ] T012 [P] Create Zod validation schemas for customer, telephony, omnichannel in `src/lib/validations/customer.ts`, `telephony.ts`, `omnichannel.ts`
- [ ] T013 Define `ChatwootAdapter` interface in `src/lib/chatwoot/adapter.ts` per `contracts/chatwoot-adapter.md`
- [ ] T014 Implement `MockChatwootAdapter` in `src/lib/chatwoot/mock-adapter.ts`
- [ ] T015 Implement `getChatwootAdapter()` factory in `src/lib/chatwoot/factory.ts` (reads `CHATWOOT_MODE`, default `mock`)
- [ ] T016 [P] Create shared UI primitives (Button, Badge, StatusChip, Table) in `src/components/ui/`
- [ ] T017 Create API error helper in `src/lib/api-error.ts` matching `contracts/rest-api.md` error shape
- [ ] T018 Implement `GET /api/health` in `src/app/api/health/route.ts`
- [ ] T019 Create app shell layout with nav in `src/app/layout.tsx` and home redirect in `src/app/page.tsx`
- [ ] T020 Add mock-mode banner component in `src/components/omnichannel/MockModeBanner.tsx`

**Checkpoint**: Schema migrates, mock adapter callable, health endpoint returns `chatwootMode: mock`

---

## Phase 3: Slice 1 — Local Visible Demo (US1 + US2 mock + US3 mock) 🎯 MVP

**Goal**: One customer: list → detail → telephony → enable omnichannel → mock status/checklist → open mock Chatwoot URL  
**Maps to**: User Story 1 (Slice 1 scope), User Story 2 (mock URL), User Story 3 (mock checklist)  
**Independent Test**: Run app with `moonu-db` only; complete SC-001 journey without Chatwoot

### Implementation

- [ ] T021 [P] [US1] Implement `customer-service.ts` CRUD in `src/server/services/customer-service.ts`
- [ ] T022 [P] [US1] Implement `GET/POST /api/customers` in `src/app/api/customers/route.ts`
- [ ] T023 [P] [US1] Implement `GET/PATCH /api/customers/[customerId]/route.ts`
- [ ] T024 [US1] Build customer list page in `src/app/customers/page.tsx` with create-customer form
- [ ] T025 [US1] Build customer detail page in `src/app/customers/[id]/page.tsx` with subscription badge
- [ ] T026 [P] [US1] Implement `telephony-service.ts` in `src/server/services/telephony-service.ts`
- [ ] T027 [P] [US1] Implement phone number API routes in `src/app/api/customers/[customerId]/phone-numbers/route.ts` and `[phoneNumberId]/route.ts`
- [ ] T028 [P] [US1] Implement extension API routes in `src/app/api/customers/[customerId]/extensions/route.ts` and `[extensionId]/route.ts`
- [ ] T029 [US1] Build telephony UI (tabs: numbers + extensions) in `src/app/customers/[id]/telephony/page.tsx`
- [ ] T030 [US1] Implement `omnichannel-service.ts` enable + dashboard DTO in `src/server/services/omnichannel-service.ts` (uses MockChatwootAdapter)
- [ ] T031 [US1] Implement `POST /api/customers/[customerId]/omnichannel/enable/route.ts`
- [ ] T032 [US1] Implement `GET /api/customers/[customerId]/omnichannel/route.ts`
- [ ] T033 [US1] Build omnichannel setup page in `src/app/customers/[id]/omnichannel/page.tsx` with enable CTA and status cards
- [ ] T034 [P] [US3] Initialize `checklistJson` with six steps on omnichannel enable in `omnichannel-service.ts`
- [ ] T035 [US3] Build WhatsApp checklist page in `src/app/customers/[id]/omnichannel/whatsapp/page.tsx` with status badges (`manual_setup_required`, `mocked`, etc.)
- [ ] T036 [US3] Implement `GET /api/customers/[customerId]/whatsapp-checklist/route.ts`
- [ ] T037 [US2] Implement `GET /api/customers/[customerId]/omnichannel/open/route.ts` returning mock dashboard URL from MockChatwootAdapter
- [ ] T038 [US2] Add **Open Omnichannel Inbox** button on customer detail and omnichannel pages in `src/components/omnichannel/OpenChatwootButton.tsx`
- [ ] T039 [P] [US1] Build Chatwoot connection status page in `src/app/customers/[id]/omnichannel/status/page.tsx`
- [ ] T040 [US1] Seed one demo customer "Clínica Exemplo" via `prisma/seed.ts` (telephony optional in seed)
- [ ] T041 [P] [US1] Add unit tests for `MockChatwootAdapter` in `tests/unit/mock-adapter.test.ts`
- [ ] T042 [P] [US1] Add integration test for Slice 1 journey in `tests/integration/slice1-journey.test.ts` (customer → telephony → enable omnichannel → mock open URL)
- [ ] T043 [US1] Verify SC-003: omnichannel dashboard fields match seeded test data in `tests/integration/slice1-journey.test.ts`

**Checkpoint**: Slice 1 exit — one customer full mock journey; Open Chatwoot uses mock URL; **T041–T043 tests pass** (`npm run test`)

---

## Phase 4: Slice 2 — Real Chatwoot Runtime (US2 real + US4 + US1 agents/linking)

**Goal**: Two customers with manually linked real Chatwoot account IDs; open-inbox lands on correct workspace  
**Maps to**: User Story 2 (real URL), User Story 4 (tenant isolation), User Story 1 (agent manual link)  
**Independent Test**: SC-002 + SC-006 with local/VM Chatwoot and `CHATWOOT_BASE_URL`

### Implementation

- [ ] T044 Add Chatwoot compose profile (`chatwoot`, `chatwoot-postgres`, `chatwoot-redis`) to `docker-compose.yml`
- [ ] T045 Document Chatwoot manual account creation steps in `docs/chatwoot-manual-setup.md`
- [ ] T046 Implement `RealUrlChatwootAdapter` (URL from stored IDs, no Platform API yet) in `src/lib/chatwoot/real-url-adapter.ts`
- [ ] T047 Update `src/lib/chatwoot/factory.ts` to select real-url adapter when `CHATWOOT_MODE=real`
- [ ] T048 [P] [US1] Add manual Chatwoot account ID link form and `PATCH` handler in `src/app/api/customers/[customerId]/omnichannel/link/route.ts`
- [ ] T049 [US1] Update omnichannel setup UI in `src/app/customers/[id]/omnichannel/page.tsx` for manual account ID entry and `setupMode: manual`
- [ ] T050 [P] [US1] Implement `agent-service.ts` in `src/server/services/agent-service.ts` with manual `chatwootUserId` link
- [ ] T051 [P] [US1] Implement agent API routes in `src/app/api/customers/[customerId]/agents/route.ts` and `[agentId]/route.ts`
- [ ] T052 [US1] Build agent management page in `src/app/customers/[id]/agents/page.tsx` with sync status badges
- [ ] T053 [US2] Update `GET .../omnichannel/open/route.ts` to build real `{CHATWOOT_BASE_URL}/app/accounts/{id}/dashboard` URLs
- [ ] T054 [US4] Extend `prisma/seed.ts` with second customer "Escritório Contábil Alfa" and third "Loja Boa Luz"
- [ ] T055 [US4] Add tenant comparison panel on omnichannel status page showing distinct `chatwootAccountId` per customer in `src/app/customers/[id]/omnichannel/status/page.tsx`
- [ ] T056 [US4] Document tenant isolation validation steps in `docs/chatwoot-investigation.md`
- [ ] T075 [P] [US4] Add tenant isolation integration test in `tests/integration/tenant-isolation.test.ts` — two customers with distinct `chatwootAccountId`, open-inbox URLs must differ (SC-006)
- [ ] T057 [US2] Handle Chatwoot unreachable state in `omnichannel-service.ts` and surface in status UI

**Checkpoint**: Slice 2 exit — two customers, different linked IDs, correct open-inbox URLs; **T075 passes** (`npm run test`) demonstrating SC-006

---

## Phase 5: Slice 3 — API Automation Research (US1 automation)

**Goal**: Document API matrix; replace mock/manual operations incrementally with Platform API  
**Maps to**: User Story 1 (agent/workspace automation), FR-012, SC-005  
**Independent Test**: At least one operation API-driven with manual fallback still working

### Implementation

- [ ] T058 Create API research log template in `docs/decisions/0001-chatwoot-platform-api.md`
- [ ] T059 Spike Platform API account creation against running Chatwoot; record result (works / does not work / unknown) in `docs/decisions/0001-chatwoot-platform-api.md`
- [ ] T060 [P] Implement `PlatformApiChatwootAdapter` skeleton in `src/lib/chatwoot/platform-api-adapter.ts`
- [ ] T061 Implement `createWorkspace` via `POST /platform/api/v1/accounts` in `platform-api-adapter.ts` with fallback to manual link
- [ ] T062 [P] Implement `createUser` and `addUserToWorkspace` in `platform-api-adapter.ts` with conflict → `status: conflict`
- [ ] T063 Update `docs/chatwoot-operations.md` with automated/manual/unknown matrix per operation
- [ ] T064 Wire factory to use `platform-api-adapter.ts` when `CHATWOOT_MODE=real` and `CHATWOOT_PLATFORM_API_TOKEN` is set
- [ ] T065 [US1] Add retry provisioning action `POST .../omnichannel/retry/route.ts` and UI button on omnichannel page
- [ ] T066 [US1] Update agent service to prefer API sync when adapter supports it, else manual link

**Checkpoint**: Slice 3 exit — documented matrix + ≥1 automated provisioning path with fallback

---

## Phase 6: Slice 4 — WhatsApp Setup Flow (US3 real)

**Goal**: Real WhatsApp trial, Embedded Signup vs manual docs, blockers recorded  
**Maps to**: User Story 3 (Slice 4), SC-008 extension  
**Independent Test**: One Cloud API number attempt documented; checklist shows `connected` or `failed` with evidence

### Implementation

- [ ] T067 Create `docs/decisions/0002-whatsapp-embedded-signup-vs-manual.md` comparing Embedded Signup vs manual setup
- [ ] T068 [US3] Implement `PATCH /api/customers/[customerId]/whatsapp-checklist/[stepKey]/route.ts` for manual step updates
- [ ] T069 [US3] Enhance checklist UI with per-step guidance copy (PT-BR labels, EN code) in `src/components/checklist/WhatsAppChecklist.tsx`
- [ ] T070 [US3] Add optional inbox detection hook in adapter `listInboxes()` when Application API token available
- [ ] T071 Execute one real WhatsApp Cloud API number trial; record blockers in `docs/decisions/0003-whatsapp-cloud-api-trial.md`
- [ ] T072 [US3] Update checklist statuses from trial results in omnichannel service and document in `docs/chatwoot-operations.md`

**Checkpoint**: Slice 4 exit — real setup attempt documented with blockers

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Constitution compliance, extended tests, docs, quickstart validation

- [ ] T073 [P] Extend `tests/unit/mock-adapter.test.ts` for edge cases (conflict, unreachable) if not covered in T041
- [ ] T074 [P] Extend `tests/integration/slice1-journey.test.ts` for error paths (enable failure display)
- [ ] T076 Verify adapter boundary — no Chatwoot HTTP outside `src/lib/chatwoot/` (grep audit documented in PR checklist)
- [ ] T077 Create `docs/production-gaps.md` listing MVP-only security shortcuts
- [ ] T078 Add operational notes (startup, shutdown, troubleshooting) to `README.md`
- [ ] T079 [P] UI polish: loading states and error toasts on customer and omnichannel forms
- [ ] T080 Run full quickstart validation and record results in `docs/decisions/0004-quickstart-validation.md`

---

## Dependencies & Execution Order

### Phase Dependencies

```text
Phase 1 Setup
    ↓
Phase 2 Foundational (BLOCKS all stories)
    ↓
Phase 3 Slice 1 🎯 MVP — no Chatwoot required (includes T041–T043 tests)
    ↓
Phase 4 Slice 2 — requires running Chatwoot
    ↓
Phase 5 Slice 3 — requires Platform API token + Chatwoot
    ↓
Phase 6 Slice 4 — requires WhatsApp Cloud API credentials
    ↓
Phase 7 Polish
```

### User Story → Slice Mapping

| Story | Priority | First delivered in | Completed in |
|-------|----------|-------------------|--------------|
| US1 Provision telephony + omnichannel | P1 | Slice 1 (mock) | Slice 3 (API agents) |
| US2 Open omnichannel inbox | P2 | Slice 1 (mock URL) | Slice 2 (real URL) |
| US3 WhatsApp checklist | P3 | Slice 1 (mock) | Slice 4 (real trial) |
| US4 Tenant isolation | P2 | — | Slice 2 |

### Within Slice 1 (recommended order)

```text
T021–T025 Customers → T026–T029 Telephony → T030–T033 Omnichannel enable
    → T034–T036 Checklist → T037–T038 Open Chatwoot → T039–T040 Status + seed
    → T041–T043 Tests (required before MVP sign-off)
```

### Parallel Opportunities

**Phase 1**: T002, T003, T006, T008 in parallel  
**Phase 2**: T012, T016 in parallel after T011  
**Phase 3**: T021–T023 parallel; T027–T028 parallel; T034–T036 parallel with T037; T041–T042 parallel after T040  
**Phase 4**: T050–T051 parallel; T054 independent of T048–T049; T075 after T054–T056 (requires two seeded customers with linked IDs)  
**Phase 5**: T060–T062 parallel after T059 spike  
**Phase 7**: T073–T074, T079 in parallel  

---

## Parallel Example: Slice 1 Customer + Telephony

```bash
# After T021 customer-service exists:
Task T027 "phone-numbers API in src/app/api/customers/[customerId]/phone-numbers/route.ts"
Task T028 "extensions API in src/app/api/customers/[customerId]/extensions/route.ts"
# Then sequential:
Task T029 "telephony UI in src/app/customers/[id]/telephony/page.tsx"
```

---

## Implementation Strategy

### MVP First (Stop after Phase 3)

1. Complete Phase 1: Setup  
2. Complete Phase 2: Foundational (**blocking**)  
3. Complete Phase 3: Slice 1 (through **T043** tests)  
4. **STOP and VALIDATE** against SC-001, Slice 1 exit criteria, and **T041–T043** (constitution Principle XII)  
5. Demo to stakeholders without Chatwoot  

### Incremental Delivery

| Milestone | Phase | Demo capability |
|-----------|-------|-----------------|
| MVP | 3 | Mock omnichannel, checklist, open mock Chatwoot, tests pass |
| Real link | 4 | Two tenants, real workspace URLs, SC-006 tenant test (T075) |
| Automation | 5 | API-driven provisioning where verified |
| WhatsApp | 6 | Real number trial + blocker doc |

### Suggested First Session (LLM/agent)

Execute **T001→T020** (Setup + Foundational), then **T021→T043** (Slice 1 including tests) in one implementation sprint.

---

## Notes

- Agent management UI is **out of Slice 1** — starts Phase 4 (T052)
- Tenant isolation demo is **Slice 2 only** — do not block Slice 1 on two customers
- All Chatwoot HTTP must stay in `src/lib/chatwoot/` (constitution Principle VI)
- Spike tasks (T059, T071) must end with written result per constitution
- Seed customers per constitution: Clínica Exemplo (T040), Escritório Contábil Alfa + Loja Boa Luz (T054)
- Quickstart aligned with slices — see `quickstart.md` §3 and §3b
