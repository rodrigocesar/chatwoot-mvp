import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getChatwootAdapter, getChatwootMode } from '@/lib/chatwoot/factory';

export async function GET() {
  let database: 'ok' | 'error' = 'ok';
  try {
    await db.$queryRaw`SELECT 1`;
  } catch {
    database = 'error';
  }

  const mode = getChatwootMode();
  let chatwootReachable: boolean | null = null;

  if (mode === 'real') {
    try {
      const adapter = getChatwootAdapter();
      chatwootReachable = await adapter.isReachable();
    } catch {
      chatwootReachable = false;
    }
  }

  return NextResponse.json({
    status: database === 'ok' ? 'ok' : 'degraded',
    database,
    chatwootMode: mode,
    chatwootReachable,
  });
}
