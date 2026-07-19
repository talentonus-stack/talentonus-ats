import { PageHeaderSkeleton, CardSkeleton, TableSkeleton } from "@/components/Skeletons"

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      <PageHeaderSkeleton />
      <CardSkeleton count={4} />
      <div className="mt-8">
        <div className="h-6 bg-primary-lighter rounded w-1/6 mb-4 animate-pulse"></div>
        <TableSkeleton rows={5} />
      </div>
    </div>
  )
}
