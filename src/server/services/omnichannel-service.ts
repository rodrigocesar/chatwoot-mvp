import type { ChatwootAdapter } from '@/lib/chatwoot/adapter';
import { getChatwootAdapter, getChatwootMode } from '@/lib/chatwoot/factory';
import { db } from '@/lib/db';
import {
  createInitialChecklist,
  type ChecklistJson,
  type ChecklistStepKey,
} from '@/lib/validations/omnichannel';
import { getCustomerById } from './customer-service';

function parseChecklist(json: unknown): ChecklistJson {
  return json as ChecklistJson;
}

export async function enableOmnichannel(customerId: string, adapter?: ChatwootAdapter) {
  const customer = await getCustomerById(customerId);

  if (customer.omnichannelEnabled) {
    throw new Error('ALREADY_ENABLED');
  }

  const chatwoot = adapter ?? getChatwootAdapter();
  const mode = getChatwootMode();
  const checklist = createInitialChecklist();

  try {
    checklist.chatwoot_account = { status: 'pending', mode: 'automated', note: '' };

    const workspace = await chatwoot.createWorkspace({ name: customer.companyName });

    if (workspace.status === 'failed') {
      throw new Error('ADAPTER_ERROR: Workspace creation failed');
    }

    checklist.chatwoot_account = { status: 'connected', mode: mode === 'mock' ? 'mocked' : 'automated', note: '' };
    checklist.whatsapp_inbox = { status: 'manual_setup_required', mode: 'manual', note: '' };

    const setupMode = mode === 'mock' ? 'mock' : 'automated';

    const [updatedCustomer, setup] = await db.$transaction([
      db.customer.update({
        where: { id: customerId },
        data: {
          omnichannelEnabled: true,
          chatwootAccountId: workspace.accountId,
        },
      }),
      db.omnichannelSetup.upsert({
        where: { customerId },
        create: {
          customerId,
          chatwootAccountStatus: 'connected',
          whatsappSetupStatus: 'manual_setup_required',
          setupMode,
          checklistJson: checklist,
          lastSyncedAt: new Date(),
        },
        update: {
          chatwootAccountStatus: 'connected',
          whatsappSetupStatus: 'manual_setup_required',
          setupMode,
          checklistJson: checklist,
          lastSyncedAt: new Date(),
        },
      }),
    ]);

    return {
      customerId: updatedCustomer.id,
      omnichannelEnabled: updatedCustomer.omnichannelEnabled,
      chatwootAccountId: updatedCustomer.chatwootAccountId,
      setup,
    };
  } catch (error) {
    if (error instanceof Error && error.message === 'ALREADY_ENABLED') {
      throw error;
    }

    await db.omnichannelSetup.upsert({
      where: { customerId },
      create: {
        customerId,
        chatwootAccountStatus: 'failed',
        whatsappSetupStatus: 'not_started',
        setupMode: mode === 'mock' ? 'mock' : 'automated',
        checklistJson: {
          ...checklist,
          chatwoot_account: { status: 'failed', mode: 'automated', note: 'Provisioning failed' },
        },
        notes: error instanceof Error ? error.message : 'Unknown error',
      },
      update: {
        chatwootAccountStatus: 'failed',
        notes: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    throw new Error(
      `ADAPTER_ERROR: ${error instanceof Error ? error.message : 'Omnichannel enable failed'}`,
    );
  }
}

export async function getOmnichannelDashboard(customerId: string, adapter?: ChatwootAdapter) {
  const customer = await getCustomerById(customerId);

  if (!customer.omnichannelEnabled) {
    throw new Error('NOT_ENABLED');
  }

  const setup = await db.omnichannelSetup.findUnique({ where: { customerId } });
  if (!setup) {
    throw new Error('NOT_FOUND');
  }

  const chatwoot = adapter ?? getChatwootAdapter();
  const mode = getChatwootMode();
  const accountId = customer.chatwootAccountId ?? '';

  let chatwootDashboardUrl = '';
  if (accountId) {
    chatwootDashboardUrl = await chatwoot.getWorkspaceAccessUrl(accountId);
  }

  const agents = await db.agent.findMany({ where: { customerId } });
  const agentSyncSummary = {
    total: agents.length,
    synced: agents.filter((a) => a.status === 'synced').length,
    pending: agents.filter((a) => a.status === 'pending').length,
    failed: agents.filter((a) => a.status === 'failed' || a.status === 'conflict').length,
  };

  let chatwootReachable: boolean | null = null;
  if (mode === 'real') {
    chatwootReachable = await chatwoot.isReachable();
  } else {
    chatwootReachable = true;
  }

  return {
    customerId: customer.id,
    chatwootAccountId: customer.chatwootAccountId,
    chatwootAccountStatus: setup.chatwootAccountStatus,
    whatsappSetupStatus: setup.whatsappSetupStatus,
    agentSyncSummary,
    chatwootDashboardUrl,
    setupMode: setup.setupMode,
    checklist: parseChecklist(setup.checklistJson),
    connectionHealth: {
      chatwootReachable,
      mode,
    },
  };
}

export async function getOpenInboxUrl(customerId: string, adapter?: ChatwootAdapter) {
  const customer = await getCustomerById(customerId);

  if (!customer.omnichannelEnabled || !customer.chatwootAccountId) {
    throw new Error('NOT_ENABLED');
  }

  const chatwoot = adapter ?? getChatwootAdapter();
  const url = await chatwoot.getWorkspaceAccessUrl(customer.chatwootAccountId);
  return { url };
}

export async function getWhatsAppChecklist(customerId: string) {
  const customer = await getCustomerById(customerId);

  if (!customer.omnichannelEnabled) {
    throw new Error('NOT_ENABLED');
  }

  const setup = await db.omnichannelSetup.findUnique({ where: { customerId } });
  if (!setup) {
    throw new Error('NOT_FOUND');
  }

  const checklist = parseChecklist(setup.checklistJson);
  const stepGuidance: Record<ChecklistStepKey, string> = {
    meta_business_account: 'Create or verify Meta Business Account for WhatsApp Cloud API.',
    whatsapp_number: 'Register a WhatsApp Business phone number in Meta Business Manager.',
    chatwoot_account: 'Chatwoot workspace linked to this customer.',
    whatsapp_inbox: 'Create WhatsApp inbox in Chatwoot and connect the Cloud API channel.',
    test_message_received: 'Send a test WhatsApp message and confirm it appears in Chatwoot.',
    agent_reply_tested: 'Reply from Chatwoot agent UI and verify delivery to WhatsApp.',
  };

  const steps = Object.entries(checklist).map(([key, value]) => ({
    key,
    ...value,
    guidance: stepGuidance[key as ChecklistStepKey] ?? '',
  }));

  return {
    customerId,
    whatsappSetupStatus: setup.whatsappSetupStatus,
    setupMode: setup.setupMode,
    steps,
  };
}

export async function getConnectionStatus(customerId: string, adapter?: ChatwootAdapter) {
  const dashboard = await getOmnichannelDashboard(customerId, adapter);
  const customer = await getCustomerById(customerId);

  return {
    customerId,
    companyName: customer.companyName,
    chatwootAccountId: customer.chatwootAccountId,
    ...dashboard,
  };
}
