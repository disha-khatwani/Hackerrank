import { Badge, type BadgeTone } from '@/components/ui/Badge';

const STATUS_TONE_MAP: Record<string, BadgeTone> = {
  draft: 'neutral',
  'in-review': 'warning',
  published: 'success',
  flagged: 'error',
  retired: 'neutral',
  archived: 'neutral',
  active: 'success',
  suspended: 'error',
  offboarding: 'warning',
  invited: 'neutral',
  opened: 'info',
  'in-progress': 'warning',
  completed: 'success',
  expired: 'error',
  'not-started': 'neutral',
  submitted: 'success',
  interrupted: 'warning',
  'failed-technical': 'error',
  pending: 'warning',
  'pending-review': 'warning',
  cleared: 'success',
  'confirmed-violation': 'error',
  connected: 'success',
  'not-configured': 'neutral',
  degraded: 'warning',
  error: 'error',
  scheduled: 'info',
  'on-demand-ready': 'info',
  cancelled: 'neutral',
  delivered: 'success',
  retrying: 'warning',
  failed: 'error',
  live: 'success',
  upcoming: 'info',
  ended: 'neutral',
  clear: 'success',
  'confirmed-leak': 'error',
};

export function StatusBadge({ status }: { status: string }) {
  const tone = STATUS_TONE_MAP[status] ?? 'neutral';
  const label = status
    .split('-')
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(' ');
  return <Badge tone={tone}>{label}</Badge>;
}
