# Quickstart: Moonu Chatwoot Omnichannel MVP

**Purpose**: Validate the MVP end-to-end locally.  
**References**: [plan.md](./plan.md), [data-model.md](./data-model.md), [contracts/rest-api.md](./contracts/rest-api.md)

## Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Git

Optional for Slice 2+ (`real` Chatwoot mode):

- Self-hosted Chatwoot instance (local or VM)

Optional for Slice 3 API automation:

- Platform App access token (Super Admin → Platform Apps)

## 1. Clone and Configure

```bash
git clone <repo-url> chatwoot-mvp
cd chatwoot-mvp
cp .env.example .env.local
```

**Minimum `.env.local` (Slice 1 mock demo — no Chatwoot required)**

```env
DATABASE_URL=postgresql://moonu:moonu@localhost:5433/moonu_simulator
CHATWOOT_MODE=mock
CHATWOOT_BASE_URL=http://localhost:3001
```

## 2. Start Local Stack

**Slice 1 — mock-only (simulator + DB)**

```bash
docker compose up -d moonu-db
npm install
npx prisma migrate dev
npm run dev
```

Open **http://localhost:3000**

**Slice 2+ — full stack with Chatwoot (optional profile)**

```bash
docker compose --profile chatwoot up -d
```

Set in `.env.local`:

```env
CHATWOOT_MODE=real
CHATWOOT_BASE_URL=http://localhost:3001
```

> **Slice 2** needs only `CHATWOOT_MODE=real` + `CHATWOOT_BASE_URL`. Platform token is for **Slice 3** API automation.

```env
# Slice 3 only:
CHATWOOT_PLATFORM_API_TOKEN=<platform-app-token>
```

## 3. Slice 1 Demo Journey (15 min target — no Chatwoot required)

Use this path for the **MVP checkpoint** (`CHATWOOT_MODE=mock`). No agents, no real Chatwoot, one customer is enough.

### Step 1 — Create customer

1. Go to **Customers** → **New Customer**
2. Enter: Company `Clínica Exemplo`, Country `BR`, Status `active`
3. **Expected**: Customer appears in list

### Step 2 — Add telephony

1. Open customer detail → **Phone Numbers**
2. Add `+551140000000`, label `Main line`
3. Go to **Extensions**, add:
   - `100` Reception
   - `101` Sales
   - `102` Support
4. **Expected**: Telephony data visible; no Chatwoot fields on these screens

### Step 3 — Enable omnichannel

1. Open **Omnichannel Setup** → **Enable Omnichannel**
2. **Expected**: `chatwootAccountStatus: connected`, `setupMode: mock`, mock workspace ID assigned

### Step 4 — Review dashboard

1. Open **Omnichannel Dashboard** / connection status
2. **Expected**: Workspace status (mock), WhatsApp `manual_setup_required`, no agent sync section (or N/A until Slice 2)

### Step 5 — WhatsApp checklist

1. Open **WhatsApp Setup Checklist**
2. **Expected**: Six steps with mock/manual labels; no credentials required

### Step 6 — Open Chatwoot

1. Click **Open Omnichannel Inbox**
2. **Expected**: Redirect to mock dashboard URL for this customer

> **Not in Slice 1**: Adding agents, linking real Chatwoot account IDs, tenant isolation with two customers — see §3b.

## 3b. Slice 2 Demo Journey (real Chatwoot + tenant isolation)

**Prerequisites**: Chatwoot running (`docker compose --profile chatwoot up -d`), `CHATWOOT_MODE=real`, `CHATWOOT_BASE_URL` set. Platform API token **not** required for Slice 2 (manual linking).

### Step 1 — Create accounts in Chatwoot UI

1. In Chatwoot setup UI, manually create **two** workspaces (accounts) for your demo customers
2. Note each **account ID**

### Step 2 — Link IDs in Moonu Simulator

1. For **Clínica Exemplo** and **Escritório Contábil Alfa**, open **Omnichannel Setup**
2. Enter the matching Chatwoot account ID (manual link)
3. **Expected**: `setupMode: manual`, real account ID stored

### Step 3 — Add agents (manual link)

1. Create users in Chatwoot UI per customer workspace
2. In Moonu **Agents**, add Maria Silva / João Souza and link `chatwootUserId` manually
3. **Expected**: Agent sync status reflects linked IDs

### Step 4 — Open Chatwoot + tenant check

1. Open inbox from each customer — must land on **different** workspace URLs
2. **Expected**: SC-006 tenant isolation demonstrated

## 4. Tenant Isolation Validation (Slice 2 only)

Use seed customers **Clínica Exemplo** and **Escritório Contábil Alfa** (or **Loja Boa Luz** as third tenant). Each must have a **different manually linked** `chatwootAccountId`.

| Check | Expected |
|-------|----------|
| Different `chatwootAccountId` | Yes |
| Open inbox from Customer A | Never shows Customer B workspace |
| Agent emails scoped per customer | Same email allowed across customers |

**Automated check**: Run `npm run test -- tests/integration/tenant-isolation.test.ts` (task T075) after manually linking both customers.

## 5. API Smoke Tests (optional)

```bash
# Health
curl http://localhost:3000/api/health

# Create customer
curl -X POST http://localhost:3000/api/customers \
  -H 'Content-Type: application/json' \
  -d '{"companyName":"API Test Co","country":"BR","subscriptionStatus":"active"}'

# Manual link (Slice 2, after enable)
curl -X PATCH http://localhost:3000/api/customers/{customerId}/omnichannel/link \
  -H 'Content-Type: application/json' \
  -d '{"chatwootAccountId":"42"}'
```

See [contracts/rest-api.md](./contracts/rest-api.md) for full endpoint list.

## 6. Run Tests

**Required before Slice 1 MVP sign-off** (constitution Principle XII):

```bash
npm run test
npm run test:integration
```

Slice 2 adds tenant isolation tests (`tests/integration/tenant-isolation.test.ts`).

## 7. Troubleshooting

| Symptom | Fix |
|---------|-----|
| DB connection refused | Ensure `moonu-db` container running on port 5433 |
| Omnichannel enable fails (real) | Verify account ID manually linked; Platform API is Slice 3 |
| Empty inbox list | Expected in MVP — complete WhatsApp setup manually in Chatwoot UI |
| Chatwoot unreachable | Dashboard shows cached linkage + `connectionHealth.chatwootReachable: false` |

## 8. What This Proves

**Slice 1**

- [ ] Moonu Simulator runs locally (mock mode)
- [ ] Customer + telephony CRUD works
- [ ] Omnichannel enable shows mock workspace status
- [ ] WhatsApp checklist renders honest mock/manual labels
- [ ] Open Chatwoot uses mock URL

**Slice 2+**

- [ ] Manual Chatwoot account linking works
- [ ] Agents sync with status visibility
- [ ] Two customers demonstrate tenant isolation
- [ ] Documentation classifies automated vs manual ops ([chatwoot-adapter.md](./contracts/chatwoot-adapter.md))
