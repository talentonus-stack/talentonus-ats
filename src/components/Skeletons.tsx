import React from "react"

export function PageHeaderSkeleton() {
  return (
    <div className="mb-8 animate-pulse">
      <div className="h-8 bg-primary-lighter rounded w-1/4 mb-2"></div>
      <div className="h-4 bg-primary-lighter rounded w-1/3"></div>
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-primary-lighter shadow-lg animate-pulse">
      <div className="w-full h-12 bg-primary-lighter/50 border-b border-border"></div>
      <div className="divide-y divide-border bg-primary-lighter">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex px-6 py-4 items-center gap-6">
            <div className="h-4 bg-primary rounded w-1/4"></div>
            <div className="h-4 bg-primary rounded w-1/6"></div>
            <div className="h-4 bg-primary rounded w-1/5"></div>
            <div className="h-4 bg-primary rounded w-1/12 ml-auto"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-primary-lighter p-6 rounded-2xl border border-border shadow-lg">
          <div className="h-4 bg-primary rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-primary rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-primary rounded w-1/4"></div>
        </div>
      ))}
    </div>
  )
}

export function DetailsSkeleton() {
  return (
    <div className="max-w-5xl mx-auto animate-pulse">
      <PageHeaderSkeleton />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-primary-lighter h-64 rounded-xl border border-border"></div>
        <div className="bg-primary-lighter h-64 rounded-xl border border-border"></div>
        <div className="bg-primary-lighter h-48 rounded-xl border border-border md:col-span-2"></div>
      </div>
    </div>
  )
}
