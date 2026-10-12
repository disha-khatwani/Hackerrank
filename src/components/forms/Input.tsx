import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { cn } from '@/utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  leadingIcon?: ReactNode;
}

const baseFieldClasses =
  'w-full rounded-lg border border-border-strong bg-surface text-body-2 text-text-primary placeholder:text-text-tertiary transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:border-transparent disabled:bg-surface-muted disabled:text-text-disabled disabled:cursor-not-allowed';

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, leadingIcon, ...props },
  ref,
) {
  if (leadingIcon) {
    return (
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
          {leadingIcon}
        </span>
        <input
          ref={ref}
          className={cn(baseFieldClasses, 'h-9 pl-9 pr-3', invalid && 'border-error focus-visible:ring-error/30', className)}
          aria-invalid={invalid}
          {...props}
        />
      </div>
    );
  }
  return (
    <input
      ref={ref}
      className={cn(baseFieldClasses, 'h-9 px-3', invalid && 'border-error focus-visible:ring-error/30', className)}
      aria-invalid={invalid}
      {...props}
    />
  );
});

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, invalid, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      className={cn(
        baseFieldClasses,
        'min-h-24 px-3 py-2.5 resize-y',
        invalid && 'border-error focus-visible:ring-error/30',
        className,
      )}
      aria-invalid={invalid}
      {...props}
    />
  );
});
