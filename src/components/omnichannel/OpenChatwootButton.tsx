'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface OpenChatwootButtonProps {
  customerId: string;
  disabled?: boolean;
}

export function OpenChatwootButton({ customerId, disabled }: OpenChatwootButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleOpen() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/customers/${customerId}/omnichannel/open`);
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error?.message ?? 'Failed to get inbox URL');
      }
      const { url } = await res.json();
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open inbox');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="inline-flex flex-col gap-1">
      <Button onClick={handleOpen} disabled={disabled || loading} variant="primary">
        {loading ? 'Opening…' : 'Open Omnichannel Inbox'}
      </Button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
