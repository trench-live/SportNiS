import { Skeleton } from "@/components/ui";

export function FeedCardSkeleton() {
  return (
    <div className="rounded-card border border-line bg-surface p-4 shadow-soft">
      <div className="flex gap-4">
        <Skeleton className="hidden size-24 shrink-0 rounded-[10px] sm:block" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Skeleton className="h-5 w-20 rounded-badge" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>
    </div>
  );
}
