export function CardSkeleton() {
  return (
    <div className="card p-4 space-y-3">
      <div className="skeleton h-4 w-24" />
      <div className="skeleton h-8 w-16" />
      <div className="skeleton h-3 w-32" />
    </div>
  );
}

export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="card p-3 flex gap-4">
          <div className="skeleton h-4 w-32" />
          <div className="skeleton h-4 w-24" />
          <div className="skeleton h-4 w-20" />
          <div className="skeleton h-4 flex-1" />
          <div className="skeleton h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="card p-4">
      <div className="skeleton h-5 w-40 mb-4" />
      <div className="skeleton h-48 w-full" />
    </div>
  );
}

