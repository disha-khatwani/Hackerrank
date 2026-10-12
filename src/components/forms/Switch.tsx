import { cn } from '@/utils/cn';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  id?: string;
}

export function Switch({ checked, onChange, label, description, disabled, id }: SwitchProps) {
  return (
    <label htmlFor={id} className={cn('flex items-start justify-between gap-4', disabled && 'opacity-60')}>
      {(label || description) && (
        <span className="min-w-0">
          {label && <span className="block text-body-2 font-medium text-text-primary">{label}</span>}
          {description && <span className="block text-caption text-text-secondary">{description}</span>}
        </span>
      )}
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring',
          checked ? 'bg-primary' : 'bg-neutral-300',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-[22px]' : 'translate-x-0.5',
          )}
        />
      </button>
    </label>
  );
}
