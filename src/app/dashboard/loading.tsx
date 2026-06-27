import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Toggle */}
      <Skeleton className="h-9 w-36 self-end rounded-lg" />

      {/* Total card */}
      <div className="rounded-xl border p-6 flex flex-col gap-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-3 w-24" />
      </div>

      {/* Category card */}
      <div className="rounded-xl border p-6 flex flex-col gap-4">
        <Skeleton className="h-4 w-24" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-1.5 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}