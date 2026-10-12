import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export function Field({
  label,
  htmlFor,
  required,
  error,
  hint,
  children,
  className,
}: {
  label?: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label htmlFor={htmlFor} className="text-body-2 font-medium text-text-primary">
          {label}
          {required && (
            <span className="ml-1 text-error" aria-hidden>
              *
            </span>
          )}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-caption text-text-tertiary leading-relaxed">{hint}</p>}
      {error && (
        <p className="flex items-center gap-1 text-caption text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
