import { z } from 'zod';

export const setupStatusSchema = z.enum([
  'not_started',
  'manual_setup_required',
  'pending',
  'connected',
  'failed',
]);

export const checklistStepSchema = z.object({
  status: setupStatusSchema,
  mode: z.enum(['manual', 'automated', 'mocked']),
  note: z.string().optional(),
});

export type ChecklistStep = z.infer<typeof checklistStepSchema>;

export const CHECKLIST_STEP_KEYS = [
  'meta_business_account',
  'whatsapp_number',
  'chatwoot_account',
  'whatsapp_inbox',
  'test_message_received',
  'agent_reply_tested',
] as const;

export type ChecklistStepKey = (typeof CHECKLIST_STEP_KEYS)[number];

export type ChecklistJson = Record<ChecklistStepKey, ChecklistStep>;

export function createInitialChecklist(): ChecklistJson {
  return {
    meta_business_account: { status: 'not_started', mode: 'manual', note: '' },
    whatsapp_number: { status: 'not_started', mode: 'manual', note: '' },
    chatwoot_account: { status: 'not_started', mode: 'automated', note: '' },
    whatsapp_inbox: { status: 'manual_setup_required', mode: 'manual', note: '' },
    test_message_received: { status: 'not_started', mode: 'manual', note: '' },
    agent_reply_tested: { status: 'not_started', mode: 'manual', note: '' },
  };
}
