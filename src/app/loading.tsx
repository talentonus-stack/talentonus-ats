export default function AdminDashboardLoading() {
  return (
    <div className="animate-pulse max-w-full mx-auto space-y-8">
      {/* Page Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4 pb-5 border-b border-border">
        <div>
          <div className="h-8 bg-primary-lighter rounded-md w-64 mb-2"></div>
          <div className="h-4 bg-primary-lighter rounded-md w-96"></div>
        </div>
      </div>

      {/* Top Stats Row Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-primary-lighter rounded-2xl border border-border p-6 h-32"></div>
        ))}
      </div>

      {/* Middle Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-primary-lighter rounded-2xl border border-border p-6 h-80"></div>
        <div className="bg-primary-lighter rounded-2xl border border-border p-6 h-80"></div>
      </div>

      {/* Bottom Lists Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-primary-lighter rounded-2xl border border-border p-6 h-96"></div>
        <div className="bg-primary-lighter rounded-2xl border border-border p-6 h-96"></div>
      </div>
    </div>
  )
}
