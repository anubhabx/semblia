import { Skeleton } from "@/components/ui/skeleton";

// ── Skeleton states ────────────────────────────────────────────────────────────

export function ProjectRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-6 py-4">
      <Skeleton className="size-9 shrink-0 rounded-lg animate-shimmer" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-36 animate-shimmer" />
        <Skeleton className="h-3 w-52 animate-shimmer" />
      </div>
      <div className="hidden items-center gap-5 sm:flex">
        <Skeleton className="h-3 w-12 animate-shimmer" />
        <Skeleton className="h-3 w-8 animate-shimmer" />
        <Skeleton className="h-3 w-8 animate-shimmer" />
        <Skeleton className="h-3 w-14 animate-shimmer" />
      </div>
    </div>
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start gap-3">
          <Skeleton className="size-10 shrink-0 rounded-lg animate-shimmer" />
          <div className="flex-1 space-y-2 pt-1">
            <Skeleton className="h-4 w-24 animate-shimmer" />
            <Skeleton className="h-3 w-40 animate-shimmer" />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 border-t border-border px-5 py-3">
        <Skeleton className="h-3 w-16 animate-shimmer" />
        <Skeleton className="h-3 w-12 animate-shimmer" />
        <Skeleton className="ml-auto h-3 w-10 animate-shimmer" />
      </div>
    </div>
  );
}
