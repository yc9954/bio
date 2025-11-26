import { Skeleton } from "./ui/skeleton";

export function ResultCardSkeleton() {
  return (
    <div className="border border-[#E5E7EB] rounded-lg bg-white p-4">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-12" />
          </div>
          <Skeleton className="h-5 w-full mb-1" />
          <Skeleton className="h-5 w-3/4" />
        </div>
      </div>
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-5/6 mb-3" />
      <div className="mb-4 flex items-center gap-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
}

export function SearchResultsLoading() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <ResultCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function SidebarLoading() {
  return (
    <div className="p-4 space-y-4">
      <Skeleton className="h-6 w-32" />
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-lg border border-[#E5E7EB] p-3">
            <Skeleton className="h-4 w-16 mb-2" />
            <Skeleton className="h-3 w-full mb-1" />
            <Skeleton className="h-3 w-5/6" />
          </div>
        ))}
      </div>
    </div>
  );
}
