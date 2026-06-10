'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { StatusChip } from '@/components/ui/StatusChip';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/components/ui/Table';

interface CustomerSummary {
  id: string;
  companyName: string;
  country: string;
  subscriptionStatus: string;
  omnichannelEnabled: boolean;
  chatwootAccountId: string | null;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    companyName: '',
    country: 'BR',
    subscriptionStatus: 'active',
  });
  const [error, setError] = useState<string | null>(null);

  async function loadCustomers() {
    setLoading(true);
    const res = await fetch('/api/customers');
    const body = await res.json();
    setCustomers(body.data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const body = await res.json();
      setError(body.error?.message ?? 'Failed to create customer');
      return;
    }
    setForm({ companyName: '', country: 'BR', subscriptionStatus: 'active' });
    setShowForm(false);
    await loadCustomers();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Customers</h1>
          <p className="text-sm text-slate-500">Simulated Moonu tenants</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} variant="primary">
          {showForm ? 'Cancel' : 'New Customer'}
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
        >
          <h2 className="mb-3 font-medium">Create customer</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="text-sm">
              Company name
              <input
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                required
              />
            </label>
            <label className="text-sm">
              Country
              <input
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                required
              />
            </label>
            <label className="text-sm">
              Subscription
              <select
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                value={form.subscriptionStatus}
                onChange={(e) => setForm({ ...form, subscriptionStatus: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="trial">Trial</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </label>
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <Button type="submit" className="mt-3">
            Create
          </Button>
        </form>
      )}

      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : customers.length === 0 ? (
        <p className="text-slate-500">No customers yet. Create one to start the demo.</p>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Company</TableHeaderCell>
              <TableHeaderCell>Country</TableHeaderCell>
              <TableHeaderCell>Subscription</TableHeaderCell>
              <TableHeaderCell>Omnichannel</TableHeaderCell>
              <TableHeaderCell></TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.companyName}</TableCell>
                <TableCell>{c.country}</TableCell>
                <TableCell>
                  <StatusChip status={c.subscriptionStatus} />
                </TableCell>
                <TableCell>
                  {c.omnichannelEnabled ? (
                    <StatusChip status="connected" label="Enabled" />
                  ) : (
                    <StatusChip status="not_started" label="Disabled" />
                  )}
                </TableCell>
                <TableCell>
                  <Link href={`/customers/${c.id}`} className="text-blue-600 hover:underline">
                    View
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
