import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-14 text-center">
      {Icon && (
        <div className="flex size-14 items-center justify-center rounded-2xl bg-surface-muted text-text-tertiary ring-1 ring-border">
          <Icon className="size-6" aria-hidden />
        </div>
      )}
      <div className="space-y-1.5">
        <p className="text-h4 font-semibold text-text-primary">{title}</p>
        {description && (
          <p className="text-body-2 text-text-secondary max-w-xs leading-relaxed">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
