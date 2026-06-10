# Quickstart: Moonu Chatwoot Omnichannel MVP

**Purpose**: Validate the MVP end-to-end locally.  
**References**: [plan.md](./plan.md), [data-model.md](./data-model.md), [contracts/rest-api.md](./contracts/rest-api.md)

## Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Git

Optional for `real` Chatwoot mode:

- Self-hosted Chatwoot instance
- Platform App access token (Super Admin → Platform Apps)

## 1. Clone and Configure

```bash
git clone <repo-url> chatwoot-mvp
cd chatwoot-mvp
cp .env.example .env.local
```

**Minimum `.env.local` (mock demo — no Chatwoot required)**

```env
DATABASE_URL=postgresql://moonu:moonu@localhost:5433/moonu_simulator
CHATWOOT_MODE=mock
CHATWOOT_BASE_URL=http://localhost:3001
```

## 2. Start Local Stack

**Mock-only (simulator + DB)**

```bash
docker compose up -d moonu-db
npm install
npx prisma migrate dev
npm run dev
```

Open **http://localhost:3000**

**Full stack with Chatwoot (optional profile)**

```bash
docker compose --profile chatwoot up -d
```

Set in `.env.local`:

```env
CHATWOOT_MODE=real
CHATWOOT_PLATFORM_API_TOKEN=<platform-app-token>
```

## 3. Primary Demo Journey (15 min target)

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
2. **Expected (mock)**: `chatwootAccountStatus: connected`, `setupMode: mock`, workspace ID assigned
3. **Expected (real)**: Workspace created in Chatwoot; ID stored

### Step 4 — Add agents

1. **Agents** → Add `Maria Silva` / `maria@clinica.example` / `agent`
2. Add `João Souza` / `joao@clinica.example` / `agent`
3. **Expected**: Agent sync status `synced` (mock or real)

### Step 5 — Review dashboard

1. Open **Omnichannel Dashboard**
2. **Expected**: Workspace status, agent sync summary, WhatsApp `manual_setup_required`, **Open Chatwoot** link works

### Step 6 — WhatsApp checklist

1. Open **WhatsApp Setup Checklist**
2. **Expected**: Six steps with statuses; inbox step shows manual guidance
3. Optionally mark steps via UI for demo progression

### Step 7 — Open Chatwoot

1. Click **Open Omnichannel Inbox**
2. **Expected (mock)**: Redirect to mock dashboard URL for this customer only
3. **Expected (real)**: Chatwoot workspace for Clínica Exemplo

## 4. Tenant Isolation Validation

Repeat Steps 1–5 for a second customer **Tech Solutions Ltd** (US).

| Check | Expected |
|-------|----------|
| Different `chatwootAccountId` | Yes |
| Open inbox from Customer A | Never shows Customer B workspace |
| Agent emails scoped per customer | Same email allowed across customers |

## 5. API Smoke Tests (optional)

```bash
# Health
curl http://localhost:3000/api/health

# Create customer
curl -X POST http://localhost:3000/api/customers \
  -H 'Content-Type: application/json' \
  -d '{"companyName":"API Test Co","country":"BR","subscriptionStatus":"active"}'
```

See [contracts/rest-api.md](./contracts/rest-api.md) for full endpoint list.

## 6. Run Tests

```bash
npm run test          # unit tests
npm run test:integration  # API + adapter tests (mock mode)
```

## 7. Troubleshooting

| Symptom | Fix |
|---------|-----|
| DB connection refused | Ensure `moonu-db` container running on port 5433 |
| Omnichannel enable fails (real) | Verify Platform API token; account must be created by same platform app |
| Empty inbox list | Expected in MVP — complete WhatsApp setup manually in Chatwoot UI |
| Chatwoot unreachable | Dashboard shows cached linkage + `connectionHealth.chatwootReachable: false` |

## 8. What This Proves

- [ ] Moonu Simulator runs locally
- [ ] Customer + telephony CRUD works
- [ ] Omnichannel enable provisions workspace (mock or real)
- [ ] Agents sync with status visibility
- [ ] WhatsApp checklist renders honest manual/automated labels
- [ ] Two customers demonstrate tenant isolation
- [ ] Documentation classifies automated vs manual Chatwoot operations ([chatwoot-adapter.md](./contracts/chatwoot-adapter.md))
