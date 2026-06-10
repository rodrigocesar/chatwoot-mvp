export interface CreateWorkspaceInput {
  name: string;
  supportEmail?: string;
  locale?: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  role: 'administrator' | 'agent';
}

export interface AddUserToWorkspaceInput {
  accountId: string;
  userId: string;
  role: 'administrator' | 'agent';
}

export interface WorkspaceRef {
  accountId: string;
  name: string;
  status: 'connected' | 'failed';
  dashboardUrl: string;
}

export interface UserRef {
  userId: string;
  email: string;
  status: 'synced' | 'conflict' | 'failed';
  errorMessage?: string;
}

export interface InboxRef {
  inboxId: string;
  name: string;
  channelType: string;
}

export interface AccountUserRef {
  accountId: string;
  userId: string;
  role: string;
}

export interface ChatwootAdapter {
  isReachable(): Promise<boolean>;
  createWorkspace(input: CreateWorkspaceInput): Promise<WorkspaceRef>;
  getWorkspace(accountId: string): Promise<WorkspaceRef | null>;
  createUser(input: CreateUserInput): Promise<UserRef>;
  addUserToWorkspace(input: AddUserToWorkspaceInput): Promise<AccountUserRef>;
  listInboxes(accountId: string): Promise<InboxRef[]>;
  getWorkspaceAccessUrl(accountId: string, userId?: string): Promise<string>;
}

export class ChatwootAuthError extends Error {
  constructor(message = 'Chatwoot authentication failed') {
    super(message);
    this.name = 'ChatwootAuthError';
  }
}

export class ChatwootUnavailableError extends Error {
  constructor(message = 'Chatwoot is unreachable') {
    super(message);
    this.name = 'ChatwootUnavailableError';
  }
}
