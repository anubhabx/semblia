"use client";

import * as React from "react";
import {
  MagnifyingGlass as SearchIcon,
  X as XIcon,
  Funnel as FilterIcon,
  CaretDown as ChevronDownIcon,
  Check as CheckIcon,
} from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import {
  apiGetTestimonials,
  apiApproveTestimonial,
  apiRejectTestimonial,
  type PaginatedResponse,
} from "@/lib/api";
import { type MockTestimonial, type ModerationStatus } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { buildPageNumbers } from "@/lib/pagination";
import { TestimonialRow } from "./testimonial-row";
import { TestimonialSkeleton } from "./testimonial-skeleton";
import { TestimonialEmptyState } from "./testimonial-empty-state";
import { BulkToolbar } from "./bulk-toolbar";

// ── Types ───────────────────────────────────────────────────────────────────

type StatusFilter = ModerationStatus | "ALL";
type SortOption = "newest" | "oldest" | "rating_desc" | "rating_asc";

// ── Config ──────────────────────────────────────────────────────────────────

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "PENDING", label: "Pending" },
  { key: "FLAGGED", label: "Flagged" },
  { key: "APPROVED", label: "Approved" },
  { key: "REJECTED", label: "Rejected" },
];

const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: "newest", label: "Newest first" },
  { key: "oldest", label: "Oldest first" },
  { key: "rating_desc", label: "Rating: high to low" },
  { key: "rating_asc", label: "Rating: low to high" },
];

// ── Main component ──────────────────────────────────────────────────────────

interface Props {
  projectId: string;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  onInlineApprove?: (id: string) => void;
  onInlineReject?: (id: string) => void;
  onItemsChange?: (ids: string[]) => void;
}

export function TestimonialsClient({
  projectId,
  selectedId,
  onSelect,
  onInlineApprove,
  onInlineReject,
  onItemsChange,
}: Props) {
  const [status, setStatus] = React.useState<StatusFilter>("ALL");
  const [sort, setSort] = React.useState<SortOption>("newest");
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);

  const [loading, setLoading] = React.useState(true);
  const [result, setResult] = React.useState<PaginatedResponse<MockTestimonial> | null>(null);

  // Bulk selection
  const [bulkSelected, setBulkSelected] = React.useState<Set<string>>(new Set());
  const bulkMode = bulkSelected.size > 0;

  const debouncedSearch = useDebounce(search, 300);

  React.useEffect(() => {
    setPage(1);
  }, [status, sort, debouncedSearch]);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);

    apiGetTestimonials(projectId, {
      status,
      sort,
      search: debouncedSearch,
      page,
      pageSize: 8,
    }).then((data) => {
      if (!cancelled) {
        setResult(data);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [projectId, status, sort, debouncedSearch, page]);

  const items = React.useMemo(() => result?.items ?? [], [result]);

  // Report visible item IDs for keyboard navigation
  React.useEffect(() => {
    onItemsChange?.(items.map((t) => t.id));
  }, [items, onItemsChange]);

  const sortLabel =
    SORT_OPTIONS.find((o) => o.key === sort)?.label ?? "Sort";

  // Bulk toggle
  const handleBulkToggle = React.useCallback((id: string) => {
    setBulkSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Bulk actions
  const handleBulkApprove = React.useCallback(() => {
    bulkSelected.forEach((id) => {
      apiApproveTestimonial(id);
      onInlineApprove?.(id);
    });
    setBulkSelected(new Set());
  }, [bulkSelected, onInlineApprove]);

  const handleBulkReject = React.useCallback(() => {
    bulkSelected.forEach((id) => {
      apiRejectTestimonial(id);
      onInlineReject?.(id);
    });
    setBulkSelected(new Set());
  }, [bulkSelected, onInlineReject]);

  const handleBulkCancel = React.useCallback(() => {
    setBulkSelected(new Set());
  }, []);

  // Select-all for current page
  const handleSelectAll = React.useCallback(() => {
    const actionable = items.filter(
      (t) => t.moderationStatus === "PENDING" || t.moderationStatus === "FLAGGED"
    );
    const allSelected = actionable.every((t) => bulkSelected.has(t.id));
    if (allSelected) {
      setBulkSelected(new Set());
    } else {
      setBulkSelected(new Set(actionable.map((t) => t.id)));
    }
  }, [items, bulkSelected]);

  const hasActionable = items.some(
    (t) => t.moderationStatus === "PENDING" || t.moderationStatus === "FLAGGED"
  );

  return (
    <div className="flex flex-1 flex-col">
      {/* ── Filter + search bar — sits below the sticky page header (h-14 = 56px) ── */}
      <div className="sticky top-14 z-10 border-b border-border bg-background/95 backdrop-blur-sm">
        {/* Status tabs */}
        <div className="flex items-center gap-0 overflow-x-auto px-6" style={{ scrollbarWidth: 'none' }}>
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatus(tab.key)}
              className={cn(
                "shrink-0 border-b-2 px-3 py-3 text-xs font-medium transition-colors duration-150",
                status === tab.key
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
              aria-current={status === tab.key ? "page" : undefined}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search + sort row */}
        <div className="flex items-center gap-3 border-t border-border px-6 py-2.5">
          <div className="relative flex-1 max-w-xs">
            <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search testimonials…"
              className="h-7 pl-8 text-xs"
              aria-label="Search testimonials"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <XIcon className="size-3" />
              </button>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="xs" className="gap-1.5 text-muted-foreground">
                <FilterIcon className="size-3 shrink-0" />
                {sortLabel}
                <ChevronDownIcon className="size-3 shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {SORT_OPTIONS.map((o) => (
                <DropdownMenuItem
                  key={o.key}
                  onSelect={() => setSort(o.key)}
                  className="gap-2 text-xs"
                >
                  {o.label}
                  {sort === o.key && (
                    <span className="ml-auto size-1.5 shrink-0 rounded-full bg-brand" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {hasActionable && !bulkMode && (
            <Button
              variant="ghost"
              size="xs"
              className="gap-1 text-muted-foreground"
              onClick={handleSelectAll}
            >
              <CheckIcon className="size-3" />
              Select
            </Button>
          )}

          {result && (
            <span className="ml-auto text-xs text-muted-foreground tabular-nums">
              {result.total} {result.total === 1 ? "result" : "results"}
            </span>
          )}
        </div>
      </div>

      {/* ── Bulk actions bar ── */}
      {bulkMode && (
        <BulkToolbar
          count={bulkSelected.size}
          onApproveAll={handleBulkApprove}
          onRejectAll={handleBulkReject}
          onCancel={handleBulkCancel}
        />
      )}

      {/* ── List ── */}
      <main className="flex-1">
        {loading ? (
          <div className="divide-y divide-border/60">
            {[0, 1, 2, 3, 4].map((i) => (
              <TestimonialSkeleton key={i} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <TestimonialEmptyState filter={status} />
        ) : (
          <div className="divide-y divide-border/60 list-content-enter">
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
      </main>

      {/* ── Pagination ── */}
      {result && result.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          <span className="text-xs text-muted-foreground">
            Page {result.page} of {result.totalPages}
          </span>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  aria-disabled={!result.hasPrev}
                  className={cn(!result.hasPrev && "pointer-events-none opacity-40")}
                />
              </PaginationItem>

              {buildPageNumbers(result.page, result.totalPages).map((item, i) =>
                item === "ellipsis" ? (
                  <PaginationItem key={`ellipsis-${i}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={item}>
                    <PaginationLink
                      isActive={item === result.page}
                      onClick={() => setPage(item)}
                    >
                      {item}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setPage((p) => Math.min(result.totalPages, p + 1))
                  }
                  aria-disabled={!result.hasNext}
                  className={cn(!result.hasNext && "pointer-events-none opacity-40")}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}

