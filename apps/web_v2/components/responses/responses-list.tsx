"use client";

/**
 * ResponsesList — the moderation inbox (the "Manage" step of the Collect →
 * Manage → Display pipeline). Review incoming testimonials, approve the good
 * ones, and feature them so they flow into widgets. Composed from the shared
 * list primitives (PageHeader / PageBody / ItemRow) so it reads as native.
 */

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PageHeader, PageBody, RefreshingDataBadge } from "@/components/shared";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useLiveQueryState } from "@/hooks/use-live-query-state";
import type {
  V2ProjectDTO,
  V2FormResponsePublishStatus,
} from "@workspace/types";
import {
  useResponses,
  useUpdateResponseStatus,
  useUpdateResponsePublish,
  useDeleteResponse,
} from "@/hooks/api";
import { ResponseRow } from "./response-row";

type Filter = "all" | "pending" | "approved" | "featured";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "featured", label: "Featured" },
];

function paramsFor(filter: Filter) {
  switch (filter) {
    case "pending":
      return { reviewStatus: "PENDING" };
    case "approved":
      return { reviewStatus: "APPROVED" };
    case "featured":
      return { publishStatus: "PUBLISHED" };
    default:
      return {};
  }
}

export function ResponsesList({ project }: { project: V2ProjectDTO }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const raw = (searchParams.get("status") ?? "all") as Filter;
  const filter: Filter = FILTERS.some((f) => f.id === raw) ? raw : "all";

  const setFilter = (next: Filter) => {
    const sp = new URLSearchParams(searchParams.toString());
    if (next === "all") sp.delete("status");
    else sp.set("status", next);
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const listQuery = useResponses(project.slug, {
    ...paramsFor(filter),
    sort: "newest",
    pageSize: 30,
  });
  const { isWaitingForLiveData, isBackgroundRefreshing } =
    useLiveQueryState(listQuery);

  const statusMutation = useUpdateResponseStatus(project.slug);
  const publishMutation = useUpdateResponsePublish(project.slug);
  const deleteMutation = useDeleteResponse(project.slug);
  const busy =
    statusMutation.isPending ||
    publishMutation.isPending ||
    deleteMutation.isPending;

  const items = listQuery.data?.items ?? [];
  const loading = isWaitingForLiveData;

  const handleStatus = (responseId: string, status: string, label: string) => {
    statusMutation.mutate(
      { responseId, status },
      {
        onSuccess: () => toast.success(label),
        onError: () => toast.error("Couldn't update. Try again."),
      },
    );
  };
  const handlePublish = (
    responseId: string,
    status: V2FormResponsePublishStatus,
  ) => {
    publishMutation.mutate(
      { responseId, status },
      {
        onSuccess: () =>
          toast.success(status === "PUBLISHED" ? "Featured" : "Unpublished"),
        onError: () => toast.error("Couldn't update. Try again."),
      },
    );
  };
  const handleDelete = (responseId: string) => {
    deleteMutation.mutate(responseId, {
      onSuccess: () => toast.success("Response deleted"),
      onError: () => toast.error("Couldn't delete. Try again."),
    });
  };

  const showToolbar = !loading;

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Responses"
        actions={
          showToolbar ? (
            <RefreshingDataBadge show={isBackgroundRefreshing} />
          ) : undefined
        }
        toolbar={
          showToolbar ? (
            <div
              role="tablist"
              aria-label="Filter responses"
              className="flex items-center gap-1"
            >
              {FILTERS.map((f) => {
                const on = filter === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    onClick={() => setFilter(f.id)}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                      on
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          ) : undefined
        }
      />

      <PageBody padding="bare" className="overflow-y-auto">
        {loading ? (
          <ListSkeleton />
        ) : items.length === 0 ? (
          <ResponsesEmpty filter={filter} slug={project.slug} />
        ) : (
          <div
            className="divide-y divide-border"
            role="list"
            aria-label="Responses"
          >
            {items.map((r) => (
              <ResponseRow
                key={r.id}
                response={r}
                busy={busy}
                onApprove={() => handleStatus(r.id, "APPROVED", "Approved")}
                onReject={() => handleStatus(r.id, "REJECTED", "Rejected")}
                onTogglePublish={(next) => handlePublish(r.id, next)}
                onDelete={() => handleDelete(r.id)}
              />
            ))}
          </div>
        )}
      </PageBody>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-4 sm:px-6">
          <Skeleton className="size-9 shrink-0 rounded-full animate-shimmer" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-32 animate-shimmer" />
            <Skeleton className="h-2.5 w-3/4 animate-shimmer" />
          </div>
          <Skeleton className="h-5 w-16 shrink-0 rounded-full animate-shimmer" />
        </div>
      ))}
    </div>
  );
}

function ResponsesEmpty({ filter, slug }: { filter: Filter; slug: string }) {
  if (filter !== "all") {
    return (
      <div className="flex flex-col items-center justify-center gap-2 px-6 py-20 text-center">
        <p className="text-sm font-medium text-foreground">
          No {filter} responses
        </p>
        <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
          Nothing matches this filter yet.
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
      <span className="flex size-10 items-center justify-center rounded-xl bg-brand/12 text-brand">
        <svg viewBox="0 0 20 20" className="size-5" fill="none" aria-hidden>
          <path
            d="M3 5.5A1.5 1.5 0 0 1 4.5 4h11A1.5 1.5 0 0 1 17 5.5v6A1.5 1.5 0 0 1 15.5 13H8l-3.5 3v-3H4.5A1.5 1.5 0 0 1 3 11.5z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <h2 className="text-base font-semibold tracking-tight text-foreground">
        No responses yet
      </h2>
      <p className="mx-auto max-w-sm text-xs leading-relaxed text-muted-foreground">
        Responses are testimonials people submit through your Forms. Review them
        here, approve the good ones, and feature them to show up in your
        Widgets.
      </p>
      <Button asChild size="sm" className="mt-1 text-xs">
        <a href={`/projects/${slug}/forms`}>Share a form to collect</a>
      </Button>
    </div>
  );
}
