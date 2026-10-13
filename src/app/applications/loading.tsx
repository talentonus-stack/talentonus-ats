export default function ApplicationsLoading() {
  return (
    <div className="animate-pulse max-w-full mx-auto h-full flex flex-col">
      {/* Page Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4 pb-5 border-b border-border shrink-0">
        <div>
          <div className="h-8 bg-primary-lighter rounded-md w-48 mb-2"></div>
          <div className="h-4 bg-primary-lighter rounded-md w-72"></div>
        </div>
        <div className="h-10 bg-primary-lighter rounded-lg w-36"></div>
      </div>

      {/* Kanban Board Skeleton */}
      <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
        {[1, 2, 3, 4, 5, 6].map((col) => (
          <div key={col} className="w-80 shrink-0 flex flex-col h-full bg-primary-lighter rounded-xl border border-border">
            {/* Column Header */}
            <div className="p-3 border-b border-border flex items-center justify-between">
              <div className="h-5 bg-primary rounded w-24"></div>
              <div className="h-5 bg-primary rounded-full w-8"></div>
            </div>

            {/* Column Body */}
            <div className="p-3 space-y-3 flex-1">
              {[1, 2].map((card) => (
                <div key={card} className="bg-primary rounded-lg border border-border p-3 h-24">
                  <div className="h-4 bg-primary-lighter rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-primary-lighter rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
