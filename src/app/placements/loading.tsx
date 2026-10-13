export default function PlacementsLoading() {
  return (
    <div className="animate-pulse max-w-7xl mx-auto">
      {/* Page Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4 pb-5 border-b border-border">
        <div>
          <div className="h-8 bg-primary-lighter rounded-md w-48 mb-2"></div>
          <div className="h-4 bg-primary-lighter rounded-md w-72"></div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="overflow-hidden rounded-2xl border border-border bg-primary-lighter shadow-lg">
        <div className="bg-primary-lighter/50 h-12 border-b border-border"></div>
        <div className="divide-y divide-border/50">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div key={i} className="px-6 py-5 flex items-center justify-between">
              <div className="w-1/4">
                 <div className="h-5 bg-primary rounded w-3/4 mb-2"></div>
                 <div className="h-3 bg-primary rounded w-1/2"></div>
              </div>
              <div className="w-[15%] h-4 bg-primary rounded"></div>
              <div className="w-[15%] h-4 bg-primary rounded"></div>
              <div className="w-[10%] h-4 bg-primary rounded"></div>
              <div className="w-[10%] h-4 bg-primary rounded"></div>
              <div className="w-[10%] h-6 bg-primary rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
