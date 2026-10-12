import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface TabItem {
  value: string;
  label: string;
  icon?: ReactNode;
  badge?: ReactNode;
}

export function Tabs({
  items,
  value,
  onChange,
}: {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div role="tablist" className="flex gap-0.5 border-b border-border">
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={cn(
              'flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-body-2 font-medium transition-colors duration-150',
              active
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary hover:border-neutral-300',
            )}
          >
            {item.icon}
            {item.label}
            {item.badge}
          </button>
        );
      })}
    </div>
  );
}
