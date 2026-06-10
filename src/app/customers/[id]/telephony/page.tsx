'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CustomerNav } from '@/components/customers/CustomerNav';
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

interface PhoneNumber {
  id: string;
  e164Number: string;
  label: string;
  status: string;
}

interface Extension {
  id: string;
  extensionNumber: string;
  displayName: string;
  assignedUserName: string | null;
  status: string;
}

export default function TelephonyPage() {
  const params = useParams();
  const customerId = params.id as string;
  const [tab, setTab] = useState<'numbers' | 'extensions'>('numbers');
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [extensions, setExtensions] = useState<Extension[]>([]);
  const [phoneForm, setPhoneForm] = useState({ e164Number: '+551140000000', label: 'Main line', status: 'active' });
  const [extForm, setExtForm] = useState({
    extensionNumber: '100',
    displayName: 'Reception',
    assignedUserName: '',
    status: 'active',
  });

  async function load() {
    const [phonesRes, extRes] = await Promise.all([
      fetch(`/api/customers/${customerId}/phone-numbers`),
      fetch(`/api/customers/${customerId}/extensions`),
    ]);
    const phonesBody = await phonesRes.json();
    const extBody = await extRes.json();
    setPhoneNumbers(phonesBody.data ?? []);
    setExtensions(extBody.data ?? []);
  }

  useEffect(() => {
    load();
  }, [customerId]);

  async function addPhone(e: React.FormEvent) {
    e.preventDefault();
    await fetch(`/api/customers/${customerId}/phone-numbers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(phoneForm),
    });
    await load();
  }

  async function addExtension(e: React.FormEvent) {
    e.preventDefault();
    await fetch(`/api/customers/${customerId}/extensions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...extForm,
        assignedUserName: extForm.assignedUserName || undefined,
      }),
    });
    await load();
  }

  return (
    <div>
      <CustomerNav customerId={customerId} active="telephony" />
      <h1 className="mb-4 text-2xl font-semibold">Telephony</h1>

      <div className="mb-4 flex gap-2">
        <Button
          variant={tab === 'numbers' ? 'primary' : 'secondary'}
          onClick={() => setTab('numbers')}
        >
          Phone numbers
        </Button>
        <Button
          variant={tab === 'extensions' ? 'primary' : 'secondary'}
          onClick={() => setTab('extensions')}
        >
          Extensions
        </Button>
      </div>

      {tab === 'numbers' ? (
        <>
          <form onSubmit={addPhone} className="mb-4 rounded-lg border bg-white p-4">
            <h2 className="mb-2 font-medium">Add phone number</h2>
            <div className="grid gap-2 sm:grid-cols-3">
              <input
                className="rounded border px-3 py-2 text-sm"
                placeholder="E.164"
                value={phoneForm.e164Number}
                onChange={(e) => setPhoneForm({ ...phoneForm, e164Number: e.target.value })}
              />
              <input
                className="rounded border px-3 py-2 text-sm"
                placeholder="Label"
                value={phoneForm.label}
                onChange={(e) => setPhoneForm({ ...phoneForm, label: e.target.value })}
              />
              <Button type="submit">Add</Button>
            </div>
          </form>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Number</TableHeaderCell>
                <TableHeaderCell>Label</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {phoneNumbers.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.e164Number}</TableCell>
                  <TableCell>{p.label}</TableCell>
                  <TableCell>
                    <StatusChip status={p.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      ) : (
        <>
          <form onSubmit={addExtension} className="mb-4 rounded-lg border bg-white p-4">
            <h2 className="mb-2 font-medium">Add extension</h2>
            <div className="grid gap-2 sm:grid-cols-4">
              <input
                className="rounded border px-3 py-2 text-sm"
                placeholder="Extension"
                value={extForm.extensionNumber}
                onChange={(e) => setExtForm({ ...extForm, extensionNumber: e.target.value })}
              />
              <input
                className="rounded border px-3 py-2 text-sm"
                placeholder="Display name"
                value={extForm.displayName}
                onChange={(e) => setExtForm({ ...extForm, displayName: e.target.value })}
              />
              <input
                className="rounded border px-3 py-2 text-sm"
                placeholder="Assigned user (optional)"
                value={extForm.assignedUserName}
                onChange={(e) => setExtForm({ ...extForm, assignedUserName: e.target.value })}
              />
              <Button type="submit">Add</Button>
            </div>
          </form>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Ext</TableHeaderCell>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell>Assigned</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {extensions.map((ext) => (
                <TableRow key={ext.id}>
                  <TableCell>{ext.extensionNumber}</TableCell>
                  <TableCell>{ext.displayName}</TableCell>
                  <TableCell>{ext.assignedUserName ?? '—'}</TableCell>
                  <TableCell>
                    <StatusChip status={ext.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}
    </div>
  );
}
