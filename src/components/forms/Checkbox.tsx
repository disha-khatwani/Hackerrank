import { Check } from 'lucide-react';
import type { InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { cn } from '@/utils/cn';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { className, label, id, ...props },
  ref,
) {
  return (
    <label htmlFor={id} className="inline-flex items-center gap-2 text-body-2 text-text-primary">
      <span className="relative inline-flex size-4 items-center justify-center">
        <input
          ref={ref}
          id={id}
          type="checkbox"
          className={cn(
            'peer size-4 appearance-none rounded border border-border-strong bg-surface checked:border-primary checked:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring',
            className,
          )}
          {...props}
        />
        <Check className="pointer-events-none absolute size-3 scale-0 text-white peer-checked:scale-100" aria-hidden />
      </span>
      {label}
    </label>
  );
});
