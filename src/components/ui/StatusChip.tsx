import { Badge } from './Badge';

export type StatusValue =
  | 'not_started'
  | 'manual_setup_required'
  | 'pending'
  | 'connected'
  | 'failed'
  | 'mocked'
  | 'active'
  | 'inactive'
  | 'trial'
  | 'suspended'
  | 'synced'
  | 'conflict';

const statusStyles: Record<string, string> = {
  not_started: 'bg-slate-100 text-slate-700',
  manual_setup_required: 'bg-amber-100 text-amber-800',
  pending: 'bg-blue-100 text-blue-800',
  connected: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  mocked: 'bg-purple-100 text-purple-800',
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-slate-100 text-slate-600',
  trial: 'bg-blue-100 text-blue-800',
  suspended: 'bg-red-100 text-red-800',
  synced: 'bg-green-100 text-green-800',
  conflict: 'bg-orange-100 text-orange-800',
};

const statusLabels: Record<string, string> = {
  not_started: 'Not started',
  manual_setup_required: 'Manual setup required',
  pending: 'Pending',
  connected: 'Connected',
  failed: 'Failed',
  mocked: 'Mocked',
  active: 'Active',
  inactive: 'Inactive',
  trial: 'Trial',
  suspended: 'Suspended',
  synced: 'Synced',
  conflict: 'Conflict',
};

interface StatusChipProps {
  status: string;
  label?: string;
}

export function StatusChip({ status, label }: StatusChipProps) {
  const style = statusStyles[status] ?? 'bg-slate-100 text-slate-700';
  const displayLabel = label ?? statusLabels[status] ?? status;
  return <Badge className={style}>{displayLabel}</Badge>;
}
