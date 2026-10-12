import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'error' | 'info' | 'ai';

export interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: 'bg-neutral-100 text-neutral-600 ring-1 ring-neutral-200/80',
  primary: 'bg-primary-pale text-primary ring-1 ring-primary-light/60',
  success: 'bg-success-light text-success ring-1 ring-success/20',
  warning: 'bg-orange-light text-brown ring-1 ring-orange/20',
  error: 'bg-error-light text-error ring-1 ring-error/20',
  info: 'bg-info-light text-info ring-1 ring-info/20',
  ai: 'bg-surface-ai text-ai-dark-green ring-1 ring-ai-green/20',
};

export function Badge({ tone = 'neutral', children, icon, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-caption font-medium',
        TONE_CLASSES[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
