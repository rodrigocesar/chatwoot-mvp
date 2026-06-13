# Chatwoot Adapter Interface Contract

**Package**: `src/lib/chatwoot/`  
**Consumers**: Omnichannel service, agent provisioning, dashboard URL generation  
**Implementations** (evolution: **mock → real-url → platform-api**):

| Class | Slice | When selected |
|-------|-------|---------------|
| `MockChatwootAdapter` | 1 | `CHATWOOT_MODE=mock` (default) |
| `RealUrlChatwootAdapter` | 2 | `CHATWOOT_MODE=real` and no `CHATWOOT_PLATFORM_API_TOKEN` |
| `PlatformApiChatwootAdapter` | 3+ | `CHATWOOT_MODE=real` and `CHATWOOT_PLATFORM_API_TOKEN` set |

**Factory**: `getChatwootAdapter()` in `src/lib/chatwoot/factory.ts` (T015, T047, T064).

## Configuration

| Env Var | Required | Description |
|---------|----------|-------------|
| `CHATWOOT_MODE` | Yes | `mock` (default) or `real` |
| `CHATWOOT_BASE_URL` | If real | e.g. `http://localhost:3001` |
| `CHATWOOT_PLATFORM_API_TOKEN` | Slice 3+ only | Platform app access token; when unset in `real` mode, factory uses `RealUrlChatwootAdapter` |
| `CHATWOOT_DASHBOARD_URL_TEMPLATE` | No | Default `{baseUrl}/app/accounts/{accountId}/dashboard` |

## Interface

```typescript
interface ChatwootAdapter {
  /** Health check for real mode; mock always returns true */
  isReachable(): Promise<boolean>;

  createWorkspace(input: CreateWorkspaceInput): Promise<WorkspaceRef>;
  getWorkspace(accountId: string): Promise<WorkspaceRef | null>;

  createUser(input: CreateUserInput): Promise<UserRef>;
  addUserToWorkspace(input: AddUserToWorkspaceInput): Promise<AccountUserRef>;

  listInboxes(accountId: string): Promise<InboxRef[]>;

  getWorkspaceAccessUrl(accountId: string, userId?: string): Promise<string>;
}

interface CreateWorkspaceInput {
  name: string;
  supportEmail?: string;
  locale?: string;
}

interface CreateUserInput {
  name: string;
  email: string;
  role: 'administrator' | 'agent';
}

interface AddUserToWorkspaceInput {
  accountId: string;
  userId: string;
  role: 'administrator' | 'agent';
}

interface WorkspaceRef {
  accountId: string;
  name: string;
  status: 'connected' | 'failed';
  dashboardUrl: string;
}

interface UserRef {
  userId: string;
  email: string;
  status: 'synced' | 'conflict' | 'failed';
  errorMessage?: string;
}

interface InboxRef {
  inboxId: string;
  name: string;
  channelType: string; // e.g. 'Channel::Whatsapp'
}

interface AccountUserRef {
  accountId: string;
  userId: string;
  role: string;
}
```

## Mock Implementation Behavior

| Method | Behavior |
|--------|----------|
| `createWorkspace` | Returns `accountId` = `mock-{slug(name)}-{shortId}` |
| `createUser` | Returns `userId` = `mock-user-{hash(email)}` |
| `addUserToWorkspace` | Always succeeds |
| `listInboxes` | Returns empty array or one fake WhatsApp inbox if `seedMockInbox=true` |
| `getWorkspaceAccessUrl` | Returns template URL with mock IDs |
| `isReachable` | `true` |

Simulated latency: 100–300ms optional for realistic UI loading states.

## Real URL Implementation (Slice 2)

`RealUrlChatwootAdapter` — no Chatwoot HTTP calls for provisioning. Workspace and user IDs are created manually in the Chatwoot UI and stored in the simulator (`Customer.chatwootAccountId`, `Agent.chatwootUserId`) via `PATCH .../omnichannel/link` and agent link forms.

| Method | Behavior |
|--------|----------|
| `createWorkspace` | Does **not** call Chatwoot API. Returns `status: pending` or defers until manual link; omnichannel enable may leave workspace unlinked until `PATCH .../link`. |
| `getWorkspace` | Reads stored `accountId` from DB; returns `null` if not linked. |
| `createUser` | Does **not** call Chatwoot API. Stores pending agent locally; `chatwootUserId` set via manual link UI. |
| `addUserToWorkspace` | No-op success when IDs already linked manually. |
| `listInboxes` | Returns `[]` (manual inbox setup in Chatwoot UI). |
| `getWorkspaceAccessUrl` | Builds `{CHATWOOT_BASE_URL}/app/accounts/{accountId}/dashboard` from stored ID. |
| `isReachable` | `HEAD` or lightweight GET to `{CHATWOOT_BASE_URL}`; on failure, connection health shows `chatwootReachable: false` (cached linkage retained). |

**Pairing with REST**: Manual account linking is **`PATCH /customers/:customerId/omnichannel/link`** ([rest-api.md](./rest-api.md)); implemented in T048.

## Platform API Implementation (Slice 3+)

| Method | HTTP | Notes |
|--------|------|-------|
| `createWorkspace` | `POST /platform/api/v1/accounts` | Body: `name`, optional `locale`, `support_email` |
| `getWorkspace` | `GET /platform/api/v1/accounts/{id}` | |
| `createUser` | `POST /platform/api/v1/users` | Handle 422 duplicate → `conflict` |
| `addUserToWorkspace` | `POST /platform/api/v1/accounts/{id}/account_users` | |
| `listInboxes` | `GET /api/v1/accounts/{id}/inboxes` | May require Application API token — **TBD**; fallback return `[]` + manual |
| `getWorkspaceAccessUrl` | `GET /platform/api/v1/users/{id}/login` | Use returned SSO URL when `userId` provided; else dashboard template |
| `isReachable` | `GET /platform/api/v1/accounts` or lightweight HEAD | |

**Auth header**: `api_access_token: {CHATWOOT_PLATFORM_API_TOKEN}`

## Error Mapping

| Chatwoot HTTP | Adapter result |
|---------------|----------------|
| 401 / 403 | Throw `ChatwootAuthError` → API 502 + `failed` status |
| 422 duplicate user | `UserRef.status = conflict` |
| 5xx / network | Throw `ChatwootUnavailableError` → connection health `unreachable` |

## Operation Classification (for docs)

| Operation | Mock (S1) | Real-url (S2) | Platform API (S3+) | MVP UI label |
|-----------|-----------|---------------|--------------------|--------------|
| Create workspace | Automated (mock ID) | Manual link via PATCH | Automated + manual fallback | Automated / Manual |
| Link workspace ID | N/A | Manual (`PATCH .../link`) | Manual fallback retained | Manual in S2 |
| Create agent user | Automated (mock ID) | Manual `chatwootUserId` link | Automated + manual fallback | Automated / Manual |
| List inboxes | Automated (empty) | Manual (returns `[]`) | Partial / manual | Manual if empty |
| Create WhatsApp inbox | N/A | Manual | Manual | Manual setup required |
| WhatsApp Embedded Signup | N/A | N/A | Not implemented | Manual |
| Open dashboard | Automated | Automated (stored ID URL) | Automated | Automated |
