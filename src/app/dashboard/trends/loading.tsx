import { Skeleton } from '@/components/ui/skeleton'

export default function TrendsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="rounded-xl border p-6">
        <Skeleton className="h-4 w-48 mb-6" />
        <Skeleton className="h-[250px] w-full" />
      </div>
      <div className="rounded-xl border p-6 flex flex-col gap-4">
        <Skeleton className="h-4 w-48" />
        {[...Array(4)].map((_, i) => (
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