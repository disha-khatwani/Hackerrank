import { cn } from '@/utils/cn';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded-lg bg-neutral-100', className)}
      aria-hidden
    />
  );
}

export function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="Loading table data">
      {/* Header row */}
      <div className="flex gap-4 pb-1">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1 opacity-60" />
        ))}
      </div>
      {/* Data rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              className={cn('h-5 flex-1', rowIndex >= 3 && 'opacity-60', rowIndex >= 4 && 'opacity-30')}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
