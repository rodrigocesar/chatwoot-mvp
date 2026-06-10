import type {
  AccountUserRef,
  AddUserToWorkspaceInput,
  ChatwootAdapter,
  CreateUserInput,
  CreateWorkspaceInput,
  InboxRef,
  UserRef,
  WorkspaceRef,
} from './adapter';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 30);
}

function shortId(): string {
  return Math.random().toString(36).slice(2, 8);
}

function hashEmail(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = (hash << 5) - hash + email.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

function delay(ms = 150): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getBaseUrl(): string {
  return process.env.CHATWOOT_BASE_URL ?? 'http://localhost:3001';
}

export class MockChatwootAdapter implements ChatwootAdapter {
  async isReachable(): Promise<boolean> {
    return true;
  }

  async createWorkspace(input: CreateWorkspaceInput): Promise<WorkspaceRef> {
    await delay();
    const accountId = `mock-${slugify(input.name)}-${shortId()}`;
    const baseUrl = getBaseUrl();
    return {
      accountId,
      name: input.name,
      status: 'connected',
      dashboardUrl: `${baseUrl}/app/accounts/${accountId}/dashboard`,
    };
  }

  async getWorkspace(accountId: string): Promise<WorkspaceRef | null> {
    await delay(50);
    const baseUrl = getBaseUrl();
    return {
      accountId,
      name: accountId,
      status: 'connected',
      dashboardUrl: `${baseUrl}/app/accounts/${accountId}/dashboard`,
    };
  }

  async createUser(input: CreateUserInput): Promise<UserRef> {
    await delay();
    return {
      userId: `mock-user-${hashEmail(input.email)}`,
      email: input.email,
      status: 'synced',
    };
  }

  async addUserToWorkspace(input: AddUserToWorkspaceInput): Promise<AccountUserRef> {
    await delay(50);
    return {
      accountId: input.accountId,
      userId: input.userId,
      role: input.role,
    };
  }

  async listInboxes(_accountId: string): Promise<InboxRef[]> {
    await delay(50);
    return [];
  }

  async getWorkspaceAccessUrl(accountId: string, _userId?: string): Promise<string> {
    const baseUrl = getBaseUrl();
    return `${baseUrl}/app/accounts/${accountId}/dashboard`;
  }
}
