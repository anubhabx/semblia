import { Skeleton } from "@/components/ui/skeleton";

// ── Skeleton states ────────────────────────────────────────────────────────────
// Shapes mirror ProjectRow (avatar / two lines / trailing date) and ProjectCard
// (avatar / title+description / stat footer) so loading doesn't reflow.

export function ProjectRowSkeleton() {
  return (
    <div className="flex items-center gap-4 border-b border-border px-6 py-4 last:border-b-0">
      <Skeleton className="size-9 shrink-0 rounded-lg animate-shimmer" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-36 animate-shimmer" />
        <Skeleton className="h-3 w-52 animate-shimmer" />
      </div>
      <Skeleton className="hidden h-3 w-14 animate-shimmer sm:block" />
    </div>
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex-1 px-5 pt-5 pb-4">
        <Skeleton className="size-10 rounded-lg animate-shimmer" />
        <Skeleton className="mt-3 h-4 w-28 animate-shimmer" />
        <Skeleton className="mt-2 h-3 w-44 animate-shimmer" />
      </div>
      <div className="flex items-center border-t border-border/70 px-5 py-3.5">
        <Skeleton className="h-3 w-24 animate-shimmer" />
        <Skeleton className="ml-auto h-3 w-12 animate-shimmer" />
      </div>
    </div>
  );
}
