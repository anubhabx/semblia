"use client";

import * as React from "react";
import {
  CaretLeft as ChevronLeftIcon,
  CaretRight as ChevronRightIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

import {
  useTestimonialsList,
  useApproveTestimonial,
  useRejectTestimonial,
} from "@/hooks/api";
import { useLiveQueryState } from "@/hooks/use-live-query-state";
import { PageBody } from "@/components/shared";
import { useDebounce } from "@/hooks/use-debounce";
import { TestimonialRow } from "./testimonial-row";
import { TestimonialSkeleton } from "./testimonial-skeleton";
import { TestimonialEmptyState } from "./testimonial-empty-state";
import { BulkToolbar } from "./bulk-toolbar";
import {
  TestimonialsFilterBar,
  type StatusFilter,
  type SortOption,
} from "./testimonials-filter-bar";
import { cn } from "@/lib/utils";

// ── Main component ───────────────────────────────────────────────────────────

interface Props {
  slug: string;
  /** Public hosted collection URL — used by the empty-state hero. */
  collectionUrl?: string;
  status: StatusFilter;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  onInlineApprove?: (id: string) => void;
  onInlineReject?: (id: string) => void;
  onItemsChange?: (ids: string[]) => void;
}

export function TestimonialsClient({
  slug,
  collectionUrl,
  status,
  selectedId,
  onSelect,
  onInlineApprove,
  onInlineReject,
  onItemsChange,
}: Props) {
  const [sort, setSort] = React.useState<SortOption>("newest");
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);

  const [bulkSelected, setBulkSelected] = React.useState<Set<string>>(
    new Set(),
  );
  const bulkMode = bulkSelected.size > 0;

  const debouncedSearch = useDebounce(search, 300);

  React.useEffect(() => {
    setPage(1);
  }, [status, sort, debouncedSearch]);

  const listQuery = useTestimonialsList(slug, {
    page,
    pageSize: 8,
    status,
    sort,
    search: debouncedSearch || undefined,
  });

  const { isWaitingForLiveData, isBackgroundRefreshing } =
    useLiveQueryState(listQuery);

  const items = React.useMemo(
    () => listQuery.data?.items ?? [],
    [listQuery.data],
  );

  const result = listQuery.data
    ? {
        total: listQuery.data.total,
        page: listQuery.data.page,
        totalPages: listQuery.data.totalPages,
        hasNext: listQuery.data.hasNext,
        hasPrev: listQuery.data.hasPrev,
      }
    : null;

  const loading = isWaitingForLiveData;
  const refreshing = isBackgroundRefreshing;

  React.useEffect(() => {
    onItemsChange?.(items.map((t) => t.id));
  }, [items, onItemsChange]);

  const approveMutation = useApproveTestimonial(slug);
  const rejectMutation = useRejectTestimonial(slug);

  const handleBulkToggle = React.useCallback((id: string) => {
    setBulkSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleBulkApprove = React.useCallback(() => {
    bulkSelected.forEach((id) => {
      approveMutation.mutate(id);
      onInlineApprove?.(id);
    });
    setBulkSelected(new Set());
  }, [bulkSelected, approveMutation, onInlineApprove]);

  const handleBulkReject = React.useCallback(() => {
    bulkSelected.forEach((id) => {
      rejectMutation.mutate(id);
      onInlineReject?.(id);
    });
    setBulkSelected(new Set());
  }, [bulkSelected, rejectMutation, onInlineReject]);

  const handleBulkCancel = React.useCallback(() => {
    setBulkSelected(new Set());
  }, []);

  const handleSelectAll = React.useCallback(() => {
    const actionable = items.filter(
      (t) =>
        t.moderationStatus === "PENDING" || t.moderationStatus === "FLAGGED",
    );
    const allSelected = actionable.every((t) => bulkSelected.has(t.id));
    if (allSelected) {
      setBulkSelected(new Set());
    } else {
      setBulkSelected(new Set(actionable.map((t) => t.id)));
    }
  }, [items, bulkSelected]);

  const hasActionable = items.some(
    (t) => t.moderationStatus === "PENDING" || t.moderationStatus === "FLAGGED",
  );

  return (
    <div className="flex flex-1 flex-col">
      <TestimonialsFilterBar
        sort={sort}
        setSort={setSort}
        search={search}
        setSearch={setSearch}
        result={result}
        hasActionable={hasActionable}
        bulkMode={bulkMode}
        refreshing={refreshing}
        onSelectAll={handleSelectAll}
      />

      {bulkMode && (
        <BulkToolbar
          count={bulkSelected.size}
          onApproveAll={handleBulkApprove}
          onRejectAll={handleBulkReject}
          onCancel={handleBulkCancel}
        />
      )}

      <PageBody
        padding="bare"
        className={cn(
          "flex-1",
          items.length === 0 && !loading && "flex flex-col",
        )}
      >
        {loading ? (
          <div className="divide-y divide-border">
            {[0, 1, 2, 3, 4].map((i) => (
              <TestimonialSkeleton key={i} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <TestimonialEmptyState
            filter={status}
            collectionUrl={collectionUrl}
            projectSlug={slug}
          />
        ) : (
          <div className="divide-y divide-border list-content-enter">
            {items.map((t) => (
              <TestimonialRow
                key={t.id}
                t={t}
                isSelected={selectedId === t.id}
                isBulkSelected={bulkSelected.has(t.id)}
                bulkMode={bulkMode}
                onSelect={onSelect}
                onBulkToggle={handleBulkToggle}
                onInlineApprove={onInlineApprove}
                onInlineReject={onInlineReject}
              />
            ))}
          </div>
        )}
      </PageBody>

      {result && result.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border px-4 py-2.5 sm:px-6">
          <span className="text-[11px] tabular-nums text-muted-foreground">
            Page {result.page} of {result.totalPages}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!result.hasPrev}
              aria-label="Previous page"
              className="size-7"
            >
              <ChevronLeftIcon className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setPage((p) => Math.min(result.totalPages, p + 1))}
              disabled={!result.hasNext}
              aria-label="Next page"
              className="size-7"
            >
              <ChevronRightIcon className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
