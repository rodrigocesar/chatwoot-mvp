# Moonu Simulator REST API Contract

**Base URL**: `http://localhost:3000/api`  
**Format**: JSON  
**Auth (MVP)**: Optional header `X-Admin-Token` when `ADMIN_TOKEN` env is set

## Conventions

- IDs are UUID strings.
- Timestamps ISO 8601 UTC.
- Errors: `{ "error": { "code": string, "message": string, "details"?: object } }`
- Status enums match [data-model.md](../data-model.md).

---

## Customers

### `GET /customers`

List all customers with summary fields.

**Response 200**

```json
{
  "data": [
    {
      "id": "uuid",
      "companyName": "Clínica Exemplo",
      "country": "BR",
      "subscriptionStatus": "active",
      "omnichannelEnabled": true,
      "chatwootAccountId": "42",
      "createdAt": "2026-06-10T12:00:00Z"
    }
  ]
}
```

### `POST /customers`

Create customer.

**Body**

```json
{
  "companyName": "Clínica Exemplo",
  "country": "BR",
  "subscriptionStatus": "active"
}
```

**Response 201**: Customer object.

### `GET /customers/:customerId`

Full customer detail including counts (phone numbers, extensions, agents).

### `PATCH /customers/:customerId`

Update `companyName`, `country`, `subscriptionStatus`.

---

## Phone Numbers

### `GET /customers/:customerId/phone-numbers`

### `POST /customers/:customerId/phone-numbers`

**Body**

```json
{
  "e164Number": "+551140000000",
  "label": "Main line",
  "status": "active"
}
```

### `PATCH /customers/:customerId/phone-numbers/:phoneNumberId`

### `DELETE /customers/:customerId/phone-numbers/:phoneNumberId`

---

## Extensions

### `GET /customers/:customerId/extensions`

### `POST /customers/:customerId/extensions`

**Body**

```json
{
  "extensionNumber": "100",
  "displayName": "Reception",
  "assignedUserName": "Ana",
  "status": "active"
}
```

### `PATCH /customers/:customerId/extensions/:extensionId`

### `DELETE /customers/:customerId/extensions/:extensionId`

---

## Omnichannel

### `POST /customers/:customerId/omnichannel/enable`

Enables omnichannel and upserts `OmnichannelSetup`. In `mock` mode, assigns a mock account ID via adapter. In `real` mode (Slice 2+), workspace may remain unlinked until `PATCH .../omnichannel/link` or Platform API provisioning (Slice 3).

**Response 200**

```json
{
  "customerId": "uuid",
  "omnichannelEnabled": true,
  "chatwootAccountId": "42",
  "setup": { "chatwootAccountStatus": "connected", "setupMode": "mock", "..." : "..." }
}
```

**Response 409**: Already enabled.  
**Response 502**: Chatwoot adapter failure (includes `setup.chatwootAccountStatus: failed`).

### `GET /customers/:customerId/omnichannel`

Returns omnichannel dashboard payload: setup record, checklist, agent sync summary, Chatwoot URL.

**Response 200**

```json
{
  "customerId": "uuid",
  "chatwootAccountId": "42",
  "chatwootAccountStatus": "connected",
  "whatsappSetupStatus": "manual_setup_required",
  "agentSyncSummary": { "total": 2, "synced": 2, "pending": 0, "failed": 0 },
  "chatwootDashboardUrl": "http://localhost:3001/app/accounts/42/dashboard",
  "setupMode": "mock",
  "checklist": { "meta_business_account": { "status": "not_started", "mode": "manual" } },
  "connectionHealth": { "chatwootReachable": true, "mode": "mock" }
}
```

### `PATCH /customers/:customerId/omnichannel/link`

Manually links an existing Chatwoot account ID to a customer after omnichannel is enabled. Used in **Slice 2** when accounts are created in the Chatwoot UI and IDs are entered in the simulator (`CHATWOOT_MODE=real`, `RealUrlChatwootAdapter`). Does not call Platform API.

**Preconditions**

- Customer exists and `omnichannelEnabled` is `true`
- `CHATWOOT_MODE` is `real` (returns **409** in `mock` mode)

**Body**

```json
{
  "chatwootAccountId": "42"
}
```

**Response 200**

```json
{
  "customerId": "uuid",
  "chatwootAccountId": "42",
  "chatwootAccountStatus": "connected",
  "setupMode": "manual",
  "chatwootDashboardUrl": "http://localhost:3001/app/accounts/42/dashboard"
}
```

**Response 400**: Missing or invalid `chatwootAccountId` (non-numeric string).  
**Response 404**: Customer not found.  
**Response 409**: Omnichannel not enabled, or mode is `mock`.  
**Response 422**: Customer already linked to a different `chatwootAccountId` (idempotent re-link with same ID returns 200).

### `POST /customers/:customerId/omnichannel/retry`

Retries failed workspace or agent sync operations.

### `GET /customers/:customerId/omnichannel/open`

Returns redirect URL for "Open Omnichannel Inbox".

**Response 200**

```json
{
  "url": "http://localhost:3001/app/accounts/42/dashboard"
}
```

---

## Agents

### `GET /customers/:customerId/agents`

### `POST /customers/:customerId/agents`

**Body**

```json
{
  "name": "Maria Silva",
  "email": "maria@clinica.example",
  "role": "agent"
}
```

Triggers Chatwoot user create + account_user link via adapter.  
**Response 201**: Agent with `status: synced` or `failed`/`conflict`.

### `POST /customers/:customerId/agents/:agentId/retry`

Retry failed agent sync.

### `DELETE /customers/:customerId/agents/:agentId`

Removes agent from simulator DB only (does not delete Chatwoot user in MVP).

---

## WhatsApp Checklist

### `GET /customers/:customerId/whatsapp-checklist`

Returns checklist steps with guidance text.

### `PATCH /customers/:customerId/whatsapp-checklist/:stepKey`

Manually update step status for demo/documentation.

**Body**

```json
{
  "status": "connected",
  "note": "Verified in Chatwoot UI"
}
```

**Valid `stepKey`**: `meta_business_account`, `whatsapp_number`, `chatwoot_account`, `whatsapp_inbox`, `test_message_received`, `agent_reply_tested`.

---

## Health

### `GET /health`

```json
{
  "status": "ok",
  "database": "ok",
  "chatwootMode": "mock",
  "chatwootReachable": null
}
```
