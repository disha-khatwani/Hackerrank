import { Loader2 } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { forwardRef } from 'react';
import { cn } from '@/utils/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-[#4648D4] text-white shadow-sm hover:bg-[#3b3db8] active:scale-95 disabled:bg-neutral-200 disabled:shadow-none',
  secondary:
    'bg-[#f2f3fe] text-[#4648D4] hover:bg-[#e4e6fd] active:scale-95 disabled:bg-neutral-100 disabled:text-neutral-400',
  outline:
    'border border-slate-200 bg-white text-slate-800 shadow-2xs hover:bg-slate-50 hover:border-slate-300 active:scale-95 disabled:text-neutral-400 disabled:shadow-none',
  ghost:
    'text-slate-700 hover:bg-slate-100 active:scale-95 disabled:text-neutral-400',
  danger:
    'bg-rose-600 text-white shadow-sm hover:bg-rose-700 active:scale-95 disabled:bg-neutral-200 disabled:shadow-none',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3.5 text-caption font-semibold gap-1.5 rounded-full',
  md: 'h-10 px-5 text-body-2 font-semibold gap-2 rounded-full',
  lg: 'h-11 px-6 text-body-1 font-semibold gap-2.5 rounded-full',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', isLoading, leadingIcon, trailingIcon, className, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex cursor-pointer items-center justify-center font-semibold transition-all duration-150 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4648D4] focus-visible:ring-offset-2',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
      {...props}
    >
      {isLoading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : leadingIcon}
      {children}
      {!isLoading && trailingIcon}
    </button>
  );
});
