import { NextRequest } from 'next/server';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { db } from '@/lib/db';
import { resetChatwootAdapterCache } from '@/lib/chatwoot/factory';
import { GET as listCustomers, POST as createCustomer } from '@/app/api/customers/route';
import { POST as enableOmnichannel } from '@/app/api/customers/[customerId]/omnichannel/enable/route';
import { GET as getOmnichannel } from '@/app/api/customers/[customerId]/omnichannel/route';
import { GET as openInbox } from '@/app/api/customers/[customerId]/omnichannel/open/route';
import { POST as createPhone } from '@/app/api/customers/[customerId]/phone-numbers/route';
import { POST as createExtension } from '@/app/api/customers/[customerId]/extensions/route';
import { GET as getChecklist } from '@/app/api/customers/[customerId]/whatsapp-checklist/route';

const TEST_PREFIX = 'slice1-test-';

async function cleanup() {
  await db.omnichannelSetup.deleteMany({
    where: { customer: { companyName: { startsWith: TEST_PREFIX } } },
  });
  await db.phoneNumber.deleteMany({
    where: { customer: { companyName: { startsWith: TEST_PREFIX } } },
  });
  await db.extension.deleteMany({
    where: { customer: { companyName: { startsWith: TEST_PREFIX } } },
  });
  await db.customer.deleteMany({
    where: { companyName: { startsWith: TEST_PREFIX } },
  });
}

function jsonRequest(url: string, method: string, body?: unknown) {
  return new NextRequest(`http://localhost:3000${url}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe('Slice 1 journey (SC-001 / SC-003)', () => {
  let customerId: string;
  let chatwootAccountId: string;

  beforeAll(async () => {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL required for integration tests');
    }
    resetChatwootAdapterCache();
    process.env.CHATWOOT_MODE = 'mock';
    await cleanup();
  });

  afterAll(async () => {
    await cleanup();
    await db.$disconnect();
  });

  it('creates a customer', async () => {
    const res = await createCustomer(
      jsonRequest('/api/customers', 'POST', {
        companyName: `${TEST_PREFIX}Clínica Exemplo`,
        country: 'BR',
        subscriptionStatus: 'active',
      }),
    );
    expect(res.status).toBe(201);
    const customer = await res.json();
    customerId = customer.id;
    expect(customer.omnichannelEnabled).toBe(false);
  });

  it('adds telephony (phone number + extension)', async () => {
    const phoneRes = await createPhone(
      jsonRequest(`/api/customers/${customerId}/phone-numbers`, 'POST', {
        e164Number: '+5511999887766',
        label: 'Main line',
        status: 'active',
      }),
      { params: Promise.resolve({ customerId }) },
    );
    expect(phoneRes.status).toBe(201);

    const extRes = await createExtension(
      jsonRequest(`/api/customers/${customerId}/extensions`, 'POST', {
        extensionNumber: '100',
        displayName: 'Reception',
        status: 'active',
      }),
      { params: Promise.resolve({ customerId }) },
    );
    expect(extRes.status).toBe(201);
  });

  it('enables omnichannel with mock adapter', async () => {
    const res = await enableOmnichannel(
      jsonRequest(`/api/customers/${customerId}/omnichannel/enable`, 'POST'),
      { params: Promise.resolve({ customerId }) },
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.omnichannelEnabled).toBe(true);
    expect(body.chatwootAccountId).toMatch(/^mock-/);
    chatwootAccountId = body.chatwootAccountId;
  });

  it('returns accurate omnichannel dashboard (SC-003)', async () => {
    const res = await getOmnichannel(
      jsonRequest(`/api/customers/${customerId}/omnichannel`, 'GET'),
      { params: Promise.resolve({ customerId }) },
    );
    expect(res.status).toBe(200);
    const dashboard = await res.json();

    expect(dashboard.customerId).toBe(customerId);
    expect(dashboard.chatwootAccountId).toBe(chatwootAccountId);
    expect(dashboard.chatwootAccountStatus).toBe('connected');
    expect(dashboard.whatsappSetupStatus).toBe('manual_setup_required');
    expect(dashboard.setupMode).toBe('mock');
    expect(dashboard.connectionHealth).toEqual({ chatwootReachable: true, mode: 'mock' });
    expect(dashboard.chatwootDashboardUrl).toContain(chatwootAccountId);

    const checklist = dashboard.checklist;
    expect(checklist.chatwoot_account.status).toBe('connected');
    expect(checklist.whatsapp_inbox.status).toBe('manual_setup_required');
    expect(Object.keys(checklist)).toHaveLength(6);
  });

  it('returns mock open-inbox URL', async () => {
    const res = await openInbox(
      jsonRequest(`/api/customers/${customerId}/omnichannel/open`, 'GET'),
      { params: Promise.resolve({ customerId }) },
    );
    expect(res.status).toBe(200);
    const { url } = await res.json();
    expect(url).toContain(chatwootAccountId);
    expect(url).toContain('/app/accounts/');
  });

  it('returns WhatsApp checklist with six steps', async () => {
    const res = await getChecklist(
      jsonRequest(`/api/customers/${customerId}/whatsapp-checklist`, 'GET'),
      { params: Promise.resolve({ customerId }) },
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.steps).toHaveLength(6);
    expect(body.whatsappSetupStatus).toBe('manual_setup_required');
  });

  it('lists customer in GET /customers', async () => {
    const res = await listCustomers();
    expect(res.status).toBe(200);
    const { data } = await res.json();
    const found = data.find((c: { id: string }) => c.id === customerId);
    expect(found).toBeDefined();
    expect(found.omnichannelEnabled).toBe(true);
  });
});
