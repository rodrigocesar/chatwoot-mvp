import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CustomerNav } from '@/components/customers/CustomerNav';
import { OpenChatwootButton } from '@/components/omnichannel/OpenChatwootButton';
import { StatusChip } from '@/components/ui/StatusChip';
import { getCustomerById } from '@/server/services/customer-service';

type PageProps = { params: Promise<{ id: string }> };

export default async function CustomerDetailPage({ params }: PageProps) {
  const { id } = await params;

  let customer;
  try {
    customer = await getCustomerById(id);
  } catch {
    notFound();
  }

  return (
    <div>
      <CustomerNav customerId={id} active="overview" />

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{customer.companyName}</h1>
          <p className="text-sm text-slate-500">
            {customer.country} · Created {customer.createdAt.toLocaleDateString()}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <StatusChip status={customer.subscriptionStatus} />
          {customer.omnichannelEnabled && (
            <OpenChatwootButton customerId={id} />
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Phone numbers" value={customer._count.phoneNumbers} />
        <StatCard label="Extensions" value={customer._count.extensions} />
        <StatCard label="Agents" value={customer._count.agents} />
        <StatCard
          label="Omnichannel"
          value={customer.omnichannelEnabled ? 'Enabled' : 'Disabled'}
        />
      </div>

      {customer.chatwootAccountId && (
        <p className="mt-4 text-sm text-slate-600">
          Chatwoot account ID: <code className="rounded bg-slate-100 px-1">{customer.chatwootAccountId}</code>
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={`/customers/${id}/telephony`}
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm hover:bg-slate-50"
        >
          Manage telephony
        </Link>
        <Link
          href={`/customers/${id}/omnichannel`}
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm hover:bg-slate-50"
        >
          Omnichannel setup
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}
