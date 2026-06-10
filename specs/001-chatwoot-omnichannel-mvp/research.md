# Research: Moonu Chatwoot Omnichannel MVP

**Date**: 2026-06-10  
**Feature**: [spec.md](./spec.md)

## 1. Application Architecture (Option A vs Option B)

### Decision

**Option A — Single Next.js application** with App Router API routes, Prisma ORM, and PostgreSQL (SQLite acceptable for solo dev without Docker DB).

### Rationale

- One deployable unit, one `package.json`, one Docker service for the simulator — fastest path to a demoable MVP.
- API routes colocated with UI reduce CORS, auth, and deployment complexity.
- Prisma gives typed schema aligned with the spec entities without a separate backend codebase.
- The MVP has a single admin user persona and ~7 screens; no need for independent frontend/backend release cycles.

### Alternatives Considered

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| **A: Next.js monolith** | Simplest local setup, shared types, one compose service | API and UI scale together | **Selected** |
| **B: Separate React + Node API** | Clear service boundary, team parallelism | Two services, duplicated types, CORS, slower MVP | Rejected for MVP |

**When Option B would win**: Multiple client apps (mobile + web), separate teams, or Moonu Simulator embedded as iframe/widget with strict API versioning. None apply to this MVP.

---

## 2. Database Choice

### Decision

**PostgreSQL** in Docker Compose for local development; Prisma supports SQLite as a documented fallback for quick starts without containers.

### Rationale

- Aligns with Chatwoot's own PostgreSQL dependency — developers already run Postgres in compose.
- JSON fields and relational integrity suit Customer → PhoneNumber/Extension/Agent/OmnichannelSetup relationships.
- SQLite remains viable via `DATABASE_URL=file:./dev.db` for zero-dependency prototyping.

### Alternatives Considered

- **SQLite only**: Simpler but diverges from compose stack and multi-service local env.
- **MongoDB**: No strong document-model benefit for normalized tenant data.

---

## 3. Chatwoot Integration Model

### Decision

Implement a **`ChatwootAdapter` interface** with two implementations:

1. **`MockChatwootAdapter`** (default for first demo) — generates plausible workspace/user/inbox IDs and dashboard URLs.
2. **`PlatformApiChatwootAdapter`** — calls Chatwoot Platform API on self-hosted instances when `CHATWOOT_MODE=real` and credentials are configured.

Mode selected via environment variable; application code depends only on the interface.

### Rationale

- Spec requires honest UI when automation is unknown; mock mode enables full demo without Chatwoot running.
- Platform API is the documented path for multi-tenant account provisioning on self-hosted Chatwoot.
- Adapter boundary satisfies FR-011/FR-012 without leaking Chatwoot HTTP details into domain services.

### Alternatives Considered

- **Direct HTTP calls in route handlers**: Faster initially but blocks mock/real swap and testing.
- **Fork Chatwoot**: Explicitly out of scope per spec.

---

## 4. Chatwoot Platform API Capabilities (Self-Hosted)

### Decision

| Operation | MVP approach | API / method |
|-----------|--------------|--------------|
| Create workspace (account) | **Automatable** via Platform API when `real` mode | `POST /platform/api/v1/accounts` |
| Create user | **Automatable** | `POST /platform/api/v1/users` |
| Add user to account | **Automatable** | `POST /platform/api/v1/accounts/{account_id}/account_users` |
| User SSO / open dashboard | **Automatable** | `GET /platform/api/v1/users/{id}/login` → redirect URL |
| List inboxes | **Application API** (account-scoped user token) or manual | `GET /api/v1/accounts/{account_id}/inboxes` |
| Create WhatsApp inbox | **Manual in MVP** | No stable Platform API for channel provisioning; configure in Chatwoot UI |
| WhatsApp Embedded Signup | **Manual / future** | Out of scope for iteration 1 |

### Rationale

Chatwoot documents three API tiers: Client (public widget), Application (account operations), Platform (installation-level provisioning). Moonu's "create customer workspace" maps to Platform API account creation. Inbox/channel setup, especially WhatsApp, remains account-admin work inside Chatwoot for MVP.

**Critical constraint**: Platform API tokens can only access accounts/users **created by that platform app** (unless manually permitted in Rails console). Moonu Simulator must own provisioning end-to-end in `real` mode — pre-existing Chatwoot accounts created via UI are not linkable without manual permission grants.

### Tenant Isolation Finding

**Preliminary conclusion**: Chatwoot's **Account** model provides sufficient tenant isolation for Moonu-style SaaS on a **single shared Chatwoot installation**, with each Moonu customer mapped to one Chatwoot Account (workspace). Users belong to accounts via `AccountUser`; agents do not cross accounts unless explicitly added.

**Caveats to validate in implementation**:

- Platform app scope limits (linking vs creating).
- Super-admin vs account-admin permission boundaries.
- Branding/white-label limits depend on Chatwoot edition (AGPL self-hosted vs enterprise).

---

## 5. WhatsApp Setup Strategy

### Decision

**Guided checklist UI** with per-step statuses (`not_started`, `manual_setup_required`, `pending`, `connected`, `failed`). No real Meta/WhatsApp credentials required for first demo.

### Rationale

- Spec explicitly excludes full WhatsApp automation in v1.
- Checklist steps mirror real onboarding and can be manually advanced for stakeholder demos.
- When `real` mode connects to Chatwoot, inbox list polling can auto-mark "Chatwoot account created" and optionally detect WhatsApp inbox presence.

### Alternatives Considered

- **Full Embedded Signup**: High integration cost; deferred.
- **Hide WhatsApp until connected**: Hides core omnichannel story; rejected.

---

## 6. Authentication

### Decision

**No production auth in MVP.** Single implicit admin session (optional env `ADMIN_TOKEN` for API protection in shared demos). Agents open Chatwoot directly via generated login/SSO URL in `real` mode or mock URL in mock mode.

### Rationale

- Spec assumes "simple local authentication model suitable for demo."
- Real Moonu SSO → Chatwoot Platform User Login is a Phase 2+ concern; adapter reserves `getWorkspaceAccessUrl(userId)`.

---

## 7. Docker Compose Topology

### Decision

```text
services:
  moonu-simulator   # Next.js app
  moonu-db          # PostgreSQL for simulator only
  chatwoot          # Official/community image (optional profile)
  chatwoot-redis
  chatwoot-postgres # Separate DB from simulator
```

Chatwoot runs under compose **profile `chatwoot`** so mock-only demos need only simulator + moonu-db.

### Rationale

- Keeps Moonu DB separate from Chatwoot DB (clear system boundary).
- Optional profile avoids forcing full Chatwoot stack for UI-only development.

---

## 8. Resolved Technical Unknowns

| Unknown | Resolution |
|---------|------------|
| Stack selection | TypeScript + Next.js monolith (Option A) |
| Persistence | PostgreSQL + Prisma |
| Chatwoot account creation | Platform API in `real` mode; mock otherwise |
| WhatsApp provisioning | Manual checklist; no credentials required for demo |
| Tenant model | One Chatwoot Account per Moonu Customer |
| Secrets | `.env.local` / compose env files; never committed |

## 9. Remaining Unknowns (Document in Implementation)

- Exact Platform API payload fields for latest Chatwoot version (verify against running instance).
- Whether inbox listing can use Platform token or requires per-account Application API token.
- Chatwoot branding customization limits under AGPL self-hosted.
- Production pattern for subscription-driven access revocation.
- Long-term: one Chatwoot instance vs per-enterprise instance.
