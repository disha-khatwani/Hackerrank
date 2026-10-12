import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-14 text-center" role="alert">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-error-light text-error ring-1 ring-error/20">
        <AlertTriangle className="size-6" aria-hidden />
      </div>
      <div className="space-y-1.5">
        <p className="text-h4 font-semibold text-text-primary">Something went wrong</p>
        <p className="text-body-2 text-text-secondary max-w-xs leading-relaxed">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
