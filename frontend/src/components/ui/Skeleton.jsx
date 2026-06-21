export function Skeleton({ className = '' }) {
  return <div className={`bg-surface-raised rounded animate-pulse ${className}`} />;
}

/* ---- Job card (used on /jobs, saved, company pages, related) ---- */
export function JobCardSkeleton() {
  return (
    <div className="bg-surface rounded-xl border border-border shadow-card p-5">
      <div className="flex items-start gap-3 mb-3">
        <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <Skeleton className="h-5 w-16 rounded-full shrink-0" />
      </div>
      <div className="flex gap-1.5 mb-4">
        <Skeleton className="h-5 w-14 rounded" />
        <Skeleton className="h-5 w-16 rounded" />
        <Skeleton className="h-5 w-12 rounded" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

export function JobListSkeleton({ count = 6, grid = false }) {
  return (
    <div className={grid ? 'grid grid-cols-1 sm:grid-cols-2 gap-3' : 'flex flex-col gap-3'}>
      {Array.from({ length: count }).map((_, i) => (
        <JobCardSkeleton key={i} />
      ))}
    </div>
  );
}

/* ---- Company card (used on /companies) ---- */
export function CompanyCardSkeleton() {
  return (
    <div className="bg-surface rounded-xl border border-border shadow-card p-5 h-full">
      <div className="flex items-start gap-3">
        <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-full mt-1" />
          <Skeleton className="h-3 w-5/6" />
        </div>
      </div>
    </div>
  );
}

export function CompanyListSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <CompanyCardSkeleton key={i} />
      ))}
    </div>
  );
}

/* ---- Full job / company detail header ---- */
export function DetailSkeleton() {
  return (
    <div className="max-w-3xl">
      <Skeleton className="h-4 w-24 mb-6" />
      <div className="bg-surface border border-border rounded-xl p-5 sm:p-8">
        <div className="flex items-start gap-4 mb-6">
          <Skeleton className="w-14 h-14 rounded-xl shrink-0" />
          <div className="flex-1 flex flex-col gap-2">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-7 w-2/3" />
          </div>
        </div>
        <div className="flex gap-3 pb-6 border-b border-border">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-28 rounded-full" />
        </div>
        <div className="py-6 flex flex-col gap-2.5">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>
    </div>
  );
}

/* ---- Generic row (employer jobs, applicants, applications) ---- */
export function RowSkeleton() {
  return (
    <div className="bg-surface rounded-xl border border-border p-5">
      <div className="flex items-start gap-3">
        <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-40" />
        </div>
        <Skeleton className="h-7 w-20 rounded-full shrink-0" />
      </div>
    </div>
  );
}

export function RowListSkeleton({ count = 4 }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <RowSkeleton key={i} />
      ))}
    </div>
  );
}
