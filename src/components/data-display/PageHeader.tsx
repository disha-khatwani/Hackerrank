import type { ReactNode } from 'react';
import type { Crumb } from '@/components/navigation/Breadcrumbs';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
}: {
  title: string;
  description?: string;
  breadcrumbs?: Crumb[];
  actions?: ReactNode;
}) {
  return (
    <div className="space-y-2 pb-2">
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-h2 font-bold tracking-tight text-text-primary">{title}</h1>
          {description && (
            <p className="mt-1 text-body-2 text-text-secondary max-w-2xl leading-relaxed">{description}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
