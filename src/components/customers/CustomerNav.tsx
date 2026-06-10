import Link from 'next/link';

interface CustomerNavProps {
  customerId: string;
  active: 'overview' | 'telephony' | 'omnichannel' | 'whatsapp' | 'status';
}

const links = [
  { key: 'overview' as const, href: (id: string) => `/customers/${id}`, label: 'Overview' },
  { key: 'telephony' as const, href: (id: string) => `/customers/${id}/telephony`, label: 'Telephony' },
  {
    key: 'omnichannel' as const,
    href: (id: string) => `/customers/${id}/omnichannel`,
    label: 'Omnichannel',
  },
  {
    key: 'whatsapp' as const,
    href: (id: string) => `/customers/${id}/omnichannel/whatsapp`,
    label: 'WhatsApp Checklist',
  },
  {
    key: 'status' as const,
    href: (id: string) => `/customers/${id}/omnichannel/status`,
    label: 'Connection Status',
  },
];

export function CustomerNav({ customerId, active }: CustomerNavProps) {
  return (
    <nav className="mb-6 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
      {links.map((link) => (
        <Link
          key={link.key}
          href={link.href(customerId)}
          className={`rounded-md px-3 py-1.5 text-sm ${
            active === link.key
              ? 'bg-blue-100 font-medium text-blue-800'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
