import { cn } from '@/utils/cn';

const PALETTE = ['bg-primary-pale text-primary', 'bg-surface-ai text-ai-dark-green', 'bg-orange-light text-brown', 'bg-neutral-200 text-neutral-700'];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}

function paletteIndex(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash + name.charCodeAt(i)) % PALETTE.length;
  return hash;
}

export function Avatar({ name, size = 'md', className }: { name: string; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizeClasses = size === 'sm' ? 'size-7 text-caption' : size === 'lg' ? 'size-12 text-h4' : 'size-9 text-body-2';
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-medium',
        sizeClasses,
        PALETTE[paletteIndex(name)],
        className,
      )}
      title={name}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
