'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CustomerNav } from '@/components/customers/CustomerNav';
import { OpenChatwootButton } from '@/components/omnichannel/OpenChatwootButton';
import { Button } from '@/components/ui/Button';
import { StatusChip } from '@/components/ui/StatusChip';

interface Dashboard {
  customerId: string;
  chatwootAccountId: string | null;
  chatwootAccountStatus: string;
  whatsappSetupStatus: string;
  setupMode: string;
  chatwootDashboardUrl: string;
  connectionHealth: { chatwootReachable: boolean | null; mode: string };
}

export default function OmnichannelPage() {
  const params = useParams();
  const customerId = params.id as string;
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enabling, setEnabling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadCustomer() {
    const res = await fetch(`/api/customers/${customerId}`);
    const customer = await res.json();
    setEnabled(customer.omnichannelEnabled ?? false);
  }

  async function loadDashboard() {
    setLoading(true);
    await loadCustomer();
    if (!enabled) {
      setLoading(false);
      return;
    }
    const res = await fetch(`/api/customers/${customerId}/omnichannel`);
    if (res.ok) {
      setDashboard(await res.json());
    }
    setLoading(false);
  }

  useEffect(() => {
    loadCustomer().then(async () => {
      const res = await fetch(`/api/customers/${customerId}`);
      const customer = await res.json();
      if (customer.omnichannelEnabled) {
        const dashRes = await fetch(`/api/customers/${customerId}/omnichannel`);
        if (dashRes.ok) setDashboard(await dashRes.json());
      }
      setLoading(false);
    });
  }, [customerId]);

  async function handleEnable() {
    setEnabling(true);
    setError(null);
    const res = await fetch(`/api/customers/${customerId}/omnichannel/enable`, { method: 'POST' });
    if (!res.ok) {
      const body = await res.json();
      setError(body.error?.message ?? 'Enable failed');
      setEnabling(false);
      return;
    }
    setEnabled(true);
    const dashRes = await fetch(`/api/customers/${customerId}/omnichannel`);
    if (dashRes.ok) setDashboard(await dashRes.json());
    setEnabling(false);
  }

  return (
    <div>
      <CustomerNav customerId={customerId} active="omnichannel" />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Omnichannel Setup</h1>
        {enabled && <OpenChatwootButton customerId={customerId} />}
      </div>

      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : !enabled ? (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="font-medium">Enable omnichannel add-on</h2>
          <p className="mt-2 text-sm text-slate-600">
            Provisions a Chatwoot workspace (mock in demo mode) and initializes the WhatsApp setup
            checklist.
          </p>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <Button className="mt-4" onClick={handleEnable} disabled={enabling}>
            {enabling ? 'Enabling…' : 'Enable Omnichannel'}
          </Button>
        </div>
      ) : dashboard ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <StatusCard label="Chatwoot account" status={dashboard.chatwootAccountStatus} />
          <StatusCard label="WhatsApp setup" status={dashboard.whatsappSetupStatus} />
          <StatusCard label="Setup mode" status={dashboard.setupMode} />
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase text-slate-500">Account ID</p>
            <p className="mt-1 font-mono text-sm">{dashboard.chatwootAccountId}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 sm:col-span-2">
            <p className="text-xs uppercase text-slate-500">Dashboard URL</p>
            <p className="mt-1 break-all text-sm text-blue-600">{dashboard.chatwootDashboardUrl}</p>
          </div>
          <div className="sm:col-span-2">
            <Link
              href={`/customers/${customerId}/omnichannel/whatsapp`}
              className="text-sm text-blue-600 hover:underline"
            >
              View WhatsApp checklist →
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StatusCard({ label, status }: { label: string; status: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs uppercase text-slate-500">{label}</p>
      <div className="mt-2">
        <StatusChip status={status} />
      </div>
    </div>
  );
}
