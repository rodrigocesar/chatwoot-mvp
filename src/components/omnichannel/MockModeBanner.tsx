export function MockModeBanner() {
  const mode = process.env.CHATWOOT_MODE ?? 'mock';
  if (mode !== 'mock') return null;

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-900">
      Demo mode — Chatwoot operations simulated (CHATWOOT_MODE=mock)
    </div>
  );
}
