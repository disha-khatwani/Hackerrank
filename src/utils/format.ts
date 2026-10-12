import { format, formatDistanceToNow } from 'date-fns';

export function formatDate(iso: string | null | undefined, pattern = 'MMM d, yyyy'): string {
  if (!iso) return '—';
  return format(new Date(iso), pattern);
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  return format(new Date(iso), 'MMM d, yyyy · h:mm a');
}

export function formatRelative(iso: string | null | undefined): string {
  if (!iso) return '—';
  return formatDistanceToNow(new Date(iso), { addSuffix: true });
}

export function formatPercent(value: number | null | undefined, fractionDigits = 0): string {
  if (value === null || value === undefined) return '—';
  return `${value.toFixed(fractionDigits)}%`;
}

export function formatCurrencyUsd(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}
