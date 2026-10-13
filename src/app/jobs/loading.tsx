export default function JobsLoading() {
  return (
    <div className="animate-pulse max-w-7xl mx-auto">
      {/* Page Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4 pb-5 border-b border-border">
        <div>
          <div className="h-8 bg-primary-lighter rounded-md w-48 mb-2"></div>
          <div className="h-4 bg-primary-lighter rounded-md w-72"></div>
        </div>
        <div className="h-10 bg-primary-lighter rounded-lg w-36"></div>
      </div>

      {/* Filters Skeleton */}
      <div className="mb-8 rounded-2xl bg-primary-lighter border border-border p-5 h-24"></div>

      {/* Grid Skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-2xl border border-border bg-primary-lighter p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="h-6 bg-primary rounded w-3/4"></div>
              <div className="h-6 bg-primary rounded-full w-16"></div>
            </div>
            <div className="space-y-3 mb-6">
              <div className="h-4 bg-primary rounded w-1/2"></div>
              <div className="h-4 bg-primary rounded w-2/3"></div>
            </div>
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
              <div className="h-4 bg-primary rounded w-1/3"></div>
              <div className="h-4 bg-primary rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
