import { notFound } from 'next/navigation';
import { CustomerNav } from '@/components/customers/CustomerNav';
import { OpenChatwootButton } from '@/components/omnichannel/OpenChatwootButton';
import { StatusChip } from '@/components/ui/StatusChip';
import { getConnectionStatus } from '@/server/services/omnichannel-service';

type PageProps = { params: Promise<{ id: string }> };

export default async function ConnectionStatusPage({ params }: PageProps) {
  const { id } = await params;

  let status;
  try {
    status = await getConnectionStatus(id);
  } catch {
    notFound();
  }

  return (
    <div>
      <CustomerNav customerId={id} active="status" />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Chatwoot Connection Status</h1>
        <OpenChatwootButton customerId={id} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <InfoCard label="Company" value={status.companyName} />
        <InfoCard label="Chatwoot account ID" value={status.chatwootAccountId ?? '—'} mono />
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-slate-500">Account status</p>
          <div className="mt-2">
            <StatusChip status={status.chatwootAccountStatus} />
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-slate-500">Adapter mode</p>
          <div className="mt-2">
            <StatusChip status={status.connectionHealth.mode === 'mock' ? 'mocked' : status.connectionHealth.mode} />
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-slate-500">Chatwoot reachable</p>
          <p className="mt-1 text-lg font-medium">
            {status.connectionHealth.chatwootReachable === null
              ? 'N/A (mock mode)'
              : status.connectionHealth.chatwootReachable
                ? 'Yes'
                : 'No'}
          </p>
        </div>
        <InfoCard label="Dashboard URL" value={status.chatwootDashboardUrl} />
      </div>
    </div>
  );
}

function InfoCard({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs uppercase text-slate-500">{label}</p>
      <p className={`mt-1 break-all text-sm ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  );
}
