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
        <div key={i} className="card min-w-0 p-3 md:flex md:items-center md:gap-4">
          <div className="space-y-2 md:hidden">
            <div className="flex justify-between gap-3">
              <div className="skeleton h-5 w-20" />
              <div className="skeleton h-5 w-24" />
            </div>
            <div className="skeleton h-3 w-28" />
            <div className="skeleton h-4 w-4/5" />
            <div className="skeleton h-3 w-2/3" />
          </div>
          <div className="hidden w-full items-center gap-4 md:flex">
            <div className="skeleton h-4 w-32" />
            <div className="skeleton h-4 w-24" />
            <div className="skeleton h-4 w-20" />
            <div className="skeleton h-4 flex-1" />
            <div className="skeleton h-4 w-16" />
          </div>
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
