/** Skeleton placeholder mirroring the results layout while analysis runs. */

function Bar({ className = '' }: { className?: string }) {
  return <div className={`skeleton animate-shimmer rounded-md ${className}`} />;
}

export function LoadingState() {
  return (
    <div className="space-y-5" aria-hidden="true">
      {/* Summary card skeleton */}
      <div className="card space-y-4 p-6">
        <Bar className="h-5 w-40" />
        <Bar className="h-4 w-full" />
        <Bar className="h-4 w-11/12" />
        <Bar className="h-4 w-4/5" />
      </div>

      {/* Risk cards skeleton */}
      <div className="space-y-3">
        <Bar className="h-4 w-28" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="card space-y-3 p-5">
            <div className="flex items-center gap-3">
              <Bar className="h-5 w-16 rounded-full" />
              <Bar className="h-4 w-48" />
            </div>
            <Bar className="h-3.5 w-full" />
            <Bar className="h-3.5 w-3/4" />
          </div>
        ))}
      </div>

      {/* Two-column grid skeleton */}
      <div className="grid gap-5 lg:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="card space-y-3 p-5">
            <Bar className="h-4 w-24" />
            <Bar className="h-3.5 w-full" />
            <Bar className="h-3.5 w-5/6" />
            <Bar className="h-3.5 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
