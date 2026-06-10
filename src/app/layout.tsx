import type { Metadata } from 'next';
import Link from 'next/link';
import { MockModeBanner } from '@/components/omnichannel/MockModeBanner';
import './globals.css';

export const metadata: Metadata = {
  title: 'Moonu Simulator',
  description: 'Omnichannel admin simulator for Chatwoot evaluation',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <MockModeBanner />
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/customers" className="text-lg font-semibold text-slate-900">
              Moonu Simulator
            </Link>
            <nav className="flex gap-4 text-sm text-slate-600">
              <Link href="/customers" className="hover:text-slate-900">
                Customers
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
