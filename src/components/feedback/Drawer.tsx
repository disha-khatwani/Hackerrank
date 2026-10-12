import { X } from 'lucide-react';
import { type ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/utils/cn';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES = { sm: 'max-w-sm', md: 'max-w-xl', lg: 'max-w-3xl' };

export function Drawer({ open, onClose, title, description, children, footer, size = 'md' }: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        tabIndex={-1}
        className={cn(
          'relative flex h-full w-full flex-col bg-surface shadow-modal focus:outline-none',
          SIZE_CLASSES[size],
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
          <div>
            <h2 id="drawer-title" className="text-h4 font-semibold text-text-primary">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-body-2 text-text-secondary leading-relaxed">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-7 shrink-0 items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-surface-muted hover:text-text-primary"
            aria-label="Close panel"
          >
            <X className="size-4" />
          </button>
        </div>
        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {/* Footer */}
        {footer && (
          <div className="flex justify-end gap-2 border-t border-border px-6 py-4">{footer}</div>
        )}
      </div>
    </div>,
    document.body,
  );
}
