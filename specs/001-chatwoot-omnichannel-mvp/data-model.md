# Data Model: Moonu Chatwoot Omnichannel MVP

**Date**: 2026-06-10  
**Feature**: [spec.md](./spec.md)  
**ORM**: Prisma (PostgreSQL)

## Entity Relationship Overview

```text
Customer 1──* PhoneNumber
Customer 1──* Extension
Customer 1──* Agent
Customer 1──1 OmnichannelSetup
```

Telephony entities (PhoneNumber, Extension) have **no foreign keys** to Chatwoot. Omnichannel linkage lives on Customer and OmnichannelSetup; Agent stores optional `chatwootUserId`.

---

## Customer

Represents a simulated Moonu tenant.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | UUID | Yes | Primary key |
| `companyName` | string | Yes | Display name, e.g. "Clínica Exemplo" |
| `country` | string | Yes | ISO 3166-1 alpha-2 preferred (e.g. `BR`) |
| `subscriptionStatus` | enum | Yes | `active`, `trial`, `inactive`, `suspended` |
| `omnichannelEnabled` | boolean | Yes | Default `false` |
| `chatwootAccountId` | string | No | Set when omnichannel enabled |
| `createdAt` | datetime | Yes | Auto |
| `updatedAt` | datetime | Yes | Auto |

### Validation Rules

- `companyName`: 2–120 characters, trimmed.
- `country`: valid ISO code or free-text country name for demo.
- Enabling omnichannel requires `subscriptionStatus` in (`active`, `trial`) — warn only in MVP, do not hard-block.

### State Transitions

```text
omnichannelEnabled: false → true
  triggers: OmnichannelSetup upsert, ChatwootAdapter.createWorkspace()

omnichannelEnabled: true → false (discouraged in MVP)
  UI shows warning; does not delete Chatwoot workspace
```

---

## PhoneNumber

Simulated telephony number; not synced to Chatwoot.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | UUID | Yes | PK |
| `customerId` | UUID | Yes | FK → Customer |
| `e164Number` | string | Yes | E.164 format, e.g. `+551140000000` |
| `label` | string | Yes | e.g. "Main line" |
| `status` | enum | Yes | `active`, `inactive`, `pending` |

### Validation Rules

- `e164Number`: must match `^\+[1-9]\d{6,14}$` (simplified E.164).
- Unique per `customerId` + `e164Number`.

---

## Extension

Simulated PBX extension; outside Chatwoot.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | UUID | Yes | PK |
| `customerId` | UUID | Yes | FK → Customer |
| `extensionNumber` | string | Yes | e.g. `100` |
| `displayName` | string | Yes | e.g. "Reception" |
| `assignedUserName` | string | No | Free text for demo |
| `status` | enum | Yes | `active`, `inactive` |

### Validation Rules

- `extensionNumber`: unique per `customerId`.
- Pattern: 2–6 digit numeric string for demo consistency.

---

## Agent

Support user provisioned for omnichannel.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | UUID | Yes | PK |
| `customerId` | UUID | Yes | FK → Customer |
| `name` | string | Yes | Full name |
| `email` | string | Yes | Unique per customer |
| `role` | enum | Yes | `admin`, `agent` |
| `chatwootUserId` | string | No | Set after adapter sync |
| `status` | enum | Yes | `pending`, `synced`, `failed`, `conflict` |

### Validation Rules

- `email`: valid email format.
- Creating agent requires `customer.omnichannelEnabled === true`.
- On Chatwoot duplicate email: set `status = conflict`, surface error in UI.

### State Transitions

```text
pending → synced   (adapter success)
pending → failed   (adapter error)
pending → conflict (email exists in Chatwoot)
```

---

## OmnichannelSetup

One row per customer; tracks Chatwoot and WhatsApp provisioning.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | UUID | Yes | PK |
| `customerId` | UUID | Yes | FK → Customer, unique |
| `chatwootAccountStatus` | enum | Yes | See statuses below |
| `whatsappSetupStatus` | enum | Yes | See statuses below |
| `whatsappPhoneNumber` | string | No | E.164 when known |
| `chatwootInboxId` | string | No | When inbox linked |
| `setupMode` | enum | Yes | `automated`, `mock`, `manual` |
| `notes` | text | No | Admin/debug notes |
| `checklistJson` | JSON | Yes | Per-step WhatsApp checklist state |
| `lastSyncedAt` | datetime | No | Last adapter poll |
| `createdAt` | datetime | Yes | Auto |
| `updatedAt` | datetime | Yes | Auto |

### Shared Status Enum

`not_started` | `manual_setup_required` | `pending` | `connected` | `failed`

- `chatwootAccountStatus`: workspace provisioning state.
- `whatsappSetupStatus`: aggregate WhatsApp channel state.

### Checklist JSON Schema

```json
{
  "meta_business_account": { "status": "not_started", "mode": "manual", "note": "" },
  "whatsapp_number": { "status": "not_started", "mode": "manual", "note": "" },
  "chatwoot_account": { "status": "not_started", "mode": "automated", "note": "" },
  "whatsapp_inbox": { "status": "manual_setup_required", "mode": "manual", "note": "" },
  "test_message_received": { "status": "not_started", "mode": "manual", "note": "" },
  "agent_reply_tested": { "status": "not_started", "mode": "manual", "note": "" }
}
```

### Initialization on Omnichannel Enable

- `setupMode` = `mock` if `CHATWOOT_MODE=mock`, else `automated` or `manual` based on adapter result.
- `chatwoot_account` checklist step → `pending` then `connected` or `failed`.
- `whatsapp_inbox` → `manual_setup_required` by default.

---

## Integration Mapping (Moonu ↔ Chatwoot)

| Moonu Entity | Chatwoot Concept | Stored On |
|--------------|------------------|-----------|
| Customer | Account (workspace) | `Customer.chatwootAccountId` |
| Agent | User + AccountUser | `Agent.chatwootUserId` |
| WhatsApp channel | Inbox (WhatsApp channel) | `OmnichannelSetup.chatwootInboxId` |
| Extension / PhoneNumber | *(none)* | — |

---

## Seed Data (Demo)

Two customers for tenant isolation test:

1. **Clínica Exemplo** (BR) — primary demo journey with agents Maria Silva, João Souza.
2. **Tech Solutions Ltd** (US) — secondary tenant with distinct `chatwootAccountId`.

Seed script optional; quickstart documents manual creation steps.
