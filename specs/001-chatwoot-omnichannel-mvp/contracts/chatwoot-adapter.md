# Chatwoot Adapter Interface Contract

**Package**: `src/lib/chatwoot/`  
**Consumers**: Omnichannel service, agent provisioning, dashboard URL generation  
**Implementations**: `MockChatwootAdapter`, `PlatformApiChatwootAdapter`

## Configuration

| Env Var | Required | Description |
|---------|----------|-------------|
| `CHATWOOT_MODE` | Yes | `mock` (default) or `real` |
| `CHATWOOT_BASE_URL` | If real | e.g. `http://localhost:3001` |
| `CHATWOOT_PLATFORM_API_TOKEN` | If real | Platform app access token |
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

## Real Implementation (Platform API)

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

| Operation | Mock | Real (target) | MVP UI label |
|-----------|------|---------------|--------------|
| Create workspace | Automated | Automated | Automated |
| Create agent user | Automated | Automated | Automated |
| List inboxes | Automated (empty) | Partial / manual | Manual if empty |
| Create WhatsApp inbox | N/A | Manual | Manual setup required |
| WhatsApp Embedded Signup | N/A | Not implemented | Manual |
| Open dashboard | Automated | Automated | Automated |
