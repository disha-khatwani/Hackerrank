import type { LucideIcon } from 'lucide-react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { cn } from '@/utils/cn';

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  icon?: LucideIcon;
  trend?: { value: string; direction: 'up' | 'down'; isPositive: boolean };
  tone?: 'neutral' | 'primary' | 'ai';
}) {
  const iconTheme =
    tone === 'primary'
      ? 'bg-[#f2f3fe] text-[#4648D4]'
      : tone === 'ai'
        ? 'bg-emerald-50 text-emerald-600'
        : 'bg-slate-100 text-slate-600';

  return (
    <div className="group rounded-[24px] border border-slate-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">{value}</p>
        </div>
        {Icon && (
          <span className={cn('flex size-11 shrink-0 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-105', iconTheme)}>
            <Icon className="size-5" aria-hidden />
          </span>
        )}
      </div>

      {trend && (
        <div className="mt-4 flex items-center gap-2 pt-2 border-t border-slate-100">
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold',
              trend.isPositive
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-rose-50 text-rose-700',
            )}
          >
            {trend.direction === 'up' ? (
              <ArrowUpRight className="size-3" />
            ) : (
              <ArrowDownRight className="size-3" />
            )}
            {trend.value}
          </span>
          <span className="text-[11px] text-slate-400 font-medium">vs last month</span>
        </div>
      )}
    </div>
  );
}
