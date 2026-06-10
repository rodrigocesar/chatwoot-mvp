import type { ChatwootAdapter } from './adapter';
import { MockChatwootAdapter } from './mock-adapter';

let cachedAdapter: ChatwootAdapter | null = null;

export function getChatwootMode(): 'mock' | 'real' {
  const mode = process.env.CHATWOOT_MODE ?? 'mock';
  return mode === 'real' ? 'real' : 'mock';
}

export function getChatwootAdapter(override?: ChatwootAdapter): ChatwootAdapter {
  if (override) return override;
  if (cachedAdapter) return cachedAdapter;

  const mode = getChatwootMode();
  if (mode === 'mock') {
    cachedAdapter = new MockChatwootAdapter();
  } else {
    // Slice 2+: RealUrlChatwootAdapter / PlatformApiChatwootAdapter
    cachedAdapter = new MockChatwootAdapter();
  }

  return cachedAdapter;
}

export function resetChatwootAdapterCache(): void {
  cachedAdapter = null;
}
