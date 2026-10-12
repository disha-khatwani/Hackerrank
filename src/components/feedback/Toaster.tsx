import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import { useToastStore, type ToastVariant } from '@/store/toastStore';
import { cn } from '@/utils/cn';

const VARIANT_CONFIG: Record<ToastVariant, { icon: typeof CheckCircle2; classes: string; iconClass: string }> = {
  success: {
    icon: CheckCircle2,
    classes: 'border-success/20 bg-surface',
    iconClass: 'text-success',
  },
  error: {
    icon: AlertCircle,
    classes: 'border-error/20 bg-surface',
    iconClass: 'text-error',
  },
  warning: {
    icon: TriangleAlert,
    classes: 'border-orange/20 bg-surface',
    iconClass: 'text-brown',
  },
  info: {
    icon: Info,
    classes: 'border-primary/20 bg-surface',
    iconClass: 'text-primary',
  },
};

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed bottom-5 right-5 z-50 flex w-full max-w-sm flex-col gap-2"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((t) => {
        const config = VARIANT_CONFIG[t.variant];
        const Icon = config.icon;
        return (
          <div
            key={t.id}
            role="status"
            className={cn(
              'pointer-events-auto flex items-start gap-3 rounded-xl border shadow-popover p-4',
              config.classes,
            )}
          >
            <Icon className={cn('mt-0.5 size-4 shrink-0', config.iconClass)} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-body-2 font-semibold text-text-primary">{t.title}</p>
              {t.description && (
                <p className="mt-0.5 text-caption text-text-secondary leading-relaxed">{t.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="flex size-6 shrink-0 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-surface-muted hover:text-text-primary"
              aria-label="Dismiss notification"
            >
              <X className="size-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
