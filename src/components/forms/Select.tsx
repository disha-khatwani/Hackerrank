import { ChevronDown } from 'lucide-react';
import type { SelectHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { cn } from '@/utils/cn';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, invalid, children, ...props },
  ref,
) {
  return (
    <div className={cn('relative', className)}>
      <select
        ref={ref}
        className={cn(
          'h-9 w-full appearance-none rounded-lg border border-border-strong bg-surface px-3 pr-9 text-body-2 text-text-primary transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:border-transparent disabled:bg-surface-muted disabled:text-text-disabled disabled:cursor-not-allowed',
          invalid && 'border-error focus-visible:ring-error/30',
        )}
        aria-invalid={invalid}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-text-tertiary"
        aria-hidden
      />
    </div>
  );
});
