/**
 * Loading placeholders. Every admin screen reads from a remote Postgres, so a
 * navigation used to sit on the previous page with no sign it had registered.
 * These hold the shape of what's coming rather than spinning.
 */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-warm-line/50 motion-safe:animate-pulse ${className}`}
      aria-hidden
    />
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="border border-warm-line bg-warm-white">
      <div className="border-b border-warm-line px-4 py-4 sm:px-6">
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="divide-y divide-warm-line/70">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3.5 sm:px-6">
            <Skeleton className="h-3.5 w-1/4" />
            <Skeleton className="h-3.5 w-1/6" />
            <Skeleton className="ml-auto h-3.5 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="border-b border-warm-line px-4 py-5 sm:px-6">
      <Skeleton className="h-7 w-48" />
      <Skeleton className="mt-2.5 h-3.5 w-80 max-w-full" />
    </div>
  );
}
