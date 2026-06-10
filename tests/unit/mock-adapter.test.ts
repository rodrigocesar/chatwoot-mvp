import { describe, expect, it, beforeEach } from 'vitest';
import { MockChatwootAdapter } from '@/lib/chatwoot/mock-adapter';

describe('MockChatwootAdapter', () => {
  let adapter: MockChatwootAdapter;

  beforeEach(() => {
    adapter = new MockChatwootAdapter();
    process.env.CHATWOOT_BASE_URL = 'http://localhost:3001';
  });

  it('is always reachable', async () => {
    await expect(adapter.isReachable()).resolves.toBe(true);
  });

  it('creates workspace with mock account ID pattern', async () => {
    const workspace = await adapter.createWorkspace({ name: 'Clínica Exemplo' });
    expect(workspace.accountId).toMatch(/^mock-clinica-exemplo-/);
    expect(workspace.status).toBe('connected');
    expect(workspace.dashboardUrl).toContain(workspace.accountId);
    expect(workspace.dashboardUrl).toContain('http://localhost:3001');
  });

  it('creates distinct workspaces for different customers', async () => {
    const a = await adapter.createWorkspace({ name: 'Clínica Exemplo' });
    const b = await adapter.createWorkspace({ name: 'Escritório Contábil Alfa' });
    expect(a.accountId).not.toBe(b.accountId);
  });

  it('creates user with deterministic mock ID from email', async () => {
    const user = await adapter.createUser({
      name: 'Maria Silva',
      email: 'maria@clinica.example',
      role: 'agent',
    });
    expect(user.userId).toMatch(/^mock-user-/);
    expect(user.status).toBe('synced');
  });

  it('returns dashboard URL for workspace access', async () => {
    const workspace = await adapter.createWorkspace({ name: 'Test Co' });
    const url = await adapter.getWorkspaceAccessUrl(workspace.accountId);
    expect(url).toBe(`http://localhost:3001/app/accounts/${workspace.accountId}/dashboard`);
  });

  it('returns empty inbox list by default', async () => {
    const inboxes = await adapter.listInboxes('mock-test-123');
    expect(inboxes).toEqual([]);
  });
});
