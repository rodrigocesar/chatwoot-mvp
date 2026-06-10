'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CustomerNav } from '@/components/customers/CustomerNav';
import { StatusChip } from '@/components/ui/StatusChip';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/components/ui/Table';

interface ChecklistStep {
  key: string;
  status: string;
  mode: string;
  note?: string;
  guidance: string;
}

const stepLabels: Record<string, string> = {
  meta_business_account: 'Meta Business Account',
  whatsapp_number: 'WhatsApp Number',
  chatwoot_account: 'Chatwoot Account',
  whatsapp_inbox: 'WhatsApp Inbox',
  test_message_received: 'Test Message Received',
  agent_reply_tested: 'Agent Reply Tested',
};

export default function WhatsAppChecklistPage() {
  const params = useParams();
  const customerId = params.id as string;
  const [steps, setSteps] = useState<ChecklistStep[]>([]);
  const [whatsappSetupStatus, setWhatsappSetupStatus] = useState('');
  const [setupMode, setSetupMode] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/customers/${customerId}/whatsapp-checklist`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json();
          setError(body.error?.message ?? 'Failed to load checklist');
          return;
        }
        const data = await res.json();
        setSteps(data.steps ?? []);
        setWhatsappSetupStatus(data.whatsappSetupStatus);
        setSetupMode(data.setupMode);
      });
  }, [customerId]);

  return (
    <div>
      <CustomerNav customerId={customerId} active="whatsapp" />
      <h1 className="mb-2 text-2xl font-semibold">WhatsApp Setup Checklist</h1>
      <div className="mb-4 flex gap-2">
        <StatusChip status={whatsappSetupStatus || 'not_started'} label={`WhatsApp: ${whatsappSetupStatus}`} />
        <StatusChip status={setupMode === 'mock' ? 'mocked' : setupMode} label={`Mode: ${setupMode}`} />
      </div>

      {error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Step</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Mode</TableHeaderCell>
              <TableHeaderCell>Guidance</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {steps.map((step) => (
              <TableRow key={step.key}>
                <TableCell>{stepLabels[step.key] ?? step.key}</TableCell>
                <TableCell>
                  <StatusChip status={step.status} />
                </TableCell>
                <TableCell>
                  <StatusChip status={step.mode === 'mocked' ? 'mocked' : step.mode} label={step.mode} />
                </TableCell>
                <TableCell className="max-w-md text-xs text-slate-600">{step.guidance}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
