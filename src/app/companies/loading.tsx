import { PageHeaderSkeleton, TableSkeleton } from "@/components/Skeletons"

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="flex justify-between mb-8 items-center">
        <div className="w-1/2"><PageHeaderSkeleton /></div>
        <div className="w-32 h-10 bg-primary-lighter rounded-lg animate-pulse"></div>
      </div>
      <TableSkeleton rows={7} />
    </div>
  )
}
