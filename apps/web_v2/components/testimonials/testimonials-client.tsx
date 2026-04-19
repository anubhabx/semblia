"use client";

import * as React from "react";
import {
  MagnifyingGlass as SearchIcon,
  X as XIcon,
  CheckCircle as CheckCircle2Icon,
  XCircle as XCircleIcon,
  ShieldCheck as ShieldCheckIcon,
  Funnel as FilterIcon,
  CaretDown as ChevronDownIcon,
  CaretRight as ChevronRightIcon,
  ChatText as MessageSquareTextIcon,
  Check as CheckIcon,
} from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  timeAgo,
  type MockTestimonial,
  type ModerationStatus,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Stars, StatusPill } from "@/components/testimonials/shared";

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

// ── Sub-components ─────────────────────────────────────────────────────────────

function TestimonialSkeleton() {
  return (
    <div className="flex items-start gap-3 px-5 py-3.5">
      <Skeleton className="mt-0.5 size-7 shrink-0 rounded-full animate-shimmer" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-24 animate-shimmer" />
          <Skeleton className="h-2.5 w-16 animate-shimmer" />
        </div>
        <Skeleton className="h-3 w-full max-w-[260px] animate-shimmer" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-3.5 w-12 rounded-full animate-shimmer" />
        </div>
      </div>
    </div>
  );
}

// ── Testimonial row (with inline actions on hover) ────────────────────────

interface TestimonialRowProps {
  t: MockTestimonial;
  index: number;
  isSelected?: boolean;
  isBulkSelected?: boolean;
  bulkMode?: boolean;
  onSelect?: (id: string) => void;
  onBulkToggle?: (id: string) => void;
  onInlineApprove?: (id: string) => void;
  onInlineReject?: (id: string) => void;
}

function TestimonialRow({
  t,
  index,
  isSelected,
  isBulkSelected,
  bulkMode,
  onSelect,
  onBulkToggle,
  onInlineApprove,
  onInlineReject,
}: TestimonialRowProps) {
  const isActionable =
    t.moderationStatus === "PENDING" || t.moderationStatus === "FLAGGED";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => {
        if (bulkMode) {
          onBulkToggle?.(t.id);
        } else {
          onSelect?.(t.id);
        }
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (bulkMode) onBulkToggle?.(t.id);
          else onSelect?.(t.id);
        }
      }}
      className={cn(
        "group relative flex items-start gap-3 px-5 py-3.5 cursor-pointer transition-colors duration-150",
        isSelected
          ? "bg-muted/60"
          : isBulkSelected
            ? "bg-brand/[0.04]"
            : "hover:bg-muted/30"
      )}
      aria-selected={isSelected}
    >
      {/* Checkbox / avatar */}
      {bulkMode ? (
        <span
          className={cn(
            "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-150",
            isBulkSelected
              ? "border-brand bg-brand text-brand-foreground"
              : "border-border bg-background text-transparent hover:border-muted-foreground/40"
          )}
        >
          <CheckIcon className="size-3.5" />
        </span>
      ) : (
        <span
          className={cn(
            "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold select-none transition-colors duration-150",
            isSelected
              ? "bg-foreground text-background"
              : "bg-muted text-muted-foreground"
          )}
        >
          {t.authorName[0].toUpperCase()}
        </span>
      )}

      <div className="min-w-0 flex-1">
        {/* Name + role + time */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-foreground truncate">
            {t.authorName}
          </span>
          {t.isOAuthVerified && (
            <ShieldCheckIcon className="size-3 shrink-0 text-success" />
          )}
          {(t.authorRole || t.authorCompany) && (
            <span className="hidden sm:inline text-[11px] text-muted-foreground truncate">
              {[t.authorRole, t.authorCompany].filter(Boolean).join(" at ")}
            </span>
          )}
          <span className="ml-auto shrink-0 text-[10px] tabular-nums text-muted-foreground">
            {timeAgo(t.createdAt)}
          </span>
        </div>

        {/* Content preview */}
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
          {t.content}
        </p>

        {/* Compact meta */}
        <div className="mt-1.5 flex items-center gap-2">
          <Stars rating={t.rating} />
          <StatusPill status={t.moderationStatus} />
        </div>
      </div>

      {/* Inline actions — appear on hover, only for actionable items */}
      {!bulkMode && isActionable && (onInlineApprove || onInlineReject) && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden items-center gap-1 opacity-0 transition-opacity duration-150 group-hover:flex group-hover:opacity-100">
          {onInlineApprove && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onInlineApprove(t.id);
              }}
              className="flex size-7 items-center justify-center rounded-md bg-muted text-muted-foreground ring-1 ring-border transition-all duration-150 hover:bg-success/10 hover:text-success hover:ring-success/30 active:scale-[0.93]"
              aria-label={`Approve ${t.authorName}`}
              title="Approve"
            >
              <CheckCircle2Icon className="size-3.5" />
            </button>
          )}
          {onInlineReject && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onInlineReject(t.id);
              }}
              className="flex size-7 items-center justify-center rounded-md bg-muted text-muted-foreground ring-1 ring-border transition-all duration-150 hover:bg-destructive/8 hover:text-destructive hover:ring-destructive/30 active:scale-[0.93]"
              aria-label={`Reject ${t.authorName}`}
              title="Reject"
            >
              <XCircleIcon className="size-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Mobile chevron */}
      {!bulkMode && (
        <ChevronRightIcon className="mt-2 size-3.5 shrink-0 text-muted-foreground/40 lg:hidden" />
      )}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ filter }: { filter: StatusFilter }) {
  const messages: Record<StatusFilter, { title: string; desc: string }> = {
    ALL: {
      title: "No testimonials yet",
      desc: "Share your collection link to start gathering testimonials.",
    },
    PENDING: {
      title: "Nothing pending",
      desc: "All testimonials have been reviewed.",
    },
    FLAGGED: {
      title: "No flagged items",
      desc: "Auto-moderation has not flagged anything recently.",
    },
    APPROVED: {
      title: "No approved testimonials",
      desc: "Approve testimonials to publish them to your widgets.",
    },
    REJECTED: {
      title: "No rejected testimonials",
      desc: "Rejected testimonials will appear here.",
    },
  };

  const { title, desc } = messages[filter];

  return (
    <div className="flex flex-col items-center py-20 px-6 text-center animate-fade-up">
      <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-muted">
        <MessageSquareTextIcon className="size-4 text-muted-foreground" />
      </div>
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 max-w-[240px] text-xs leading-relaxed text-muted-foreground">
        {desc}
      </p>
    </div>
  );
}

// ── Bulk actions toolbar ────────────────────────────────────────────────────

function BulkToolbar({
  count,
  onApproveAll,
  onRejectAll,
  onCancel,
}: {
  count: number;
  onApproveAll: () => void;
  onRejectAll: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex items-center gap-2 border-b border-brand/20 bg-brand/[0.04] px-6 py-2 animate-fade-up">
      <span className="text-xs font-semibold tabular-nums text-foreground">
        {count} selected
      </span>
      <div className="ml-auto flex items-center gap-1.5">
        <Button
          size="xs"
          variant="outline"
          className="gap-1 hover:bg-success/8 hover:text-success hover:border-success/30 active:scale-[0.97]"
          onClick={onApproveAll}
        >
          <CheckCircle2Icon className="size-3" />
          Approve
        </Button>
        <Button
          size="xs"
          variant="outline"
          className="gap-1 hover:bg-destructive/6 hover:text-destructive hover:border-destructive/30 active:scale-[0.97]"
          onClick={onRejectAll}
        >
          <XCircleIcon className="size-3" />
          Reject
        </Button>
        <Button size="xs" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────

interface Props {
  projectId: string;
  projectSlug: string;
  totalCount?: number;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  onInlineApprove?: (id: string) => void;
  onInlineReject?: (id: string) => void;
  onItemsChange?: (ids: string[]) => void;
}

export function TestimonialsClient({
  projectId,
  projectSlug,
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

  const items = result?.items ?? [];

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
          <EmptyState filter={status} />
        ) : (
          <div className="divide-y divide-border/60 list-content-enter">
            {items.map((t, i) => (
              <TestimonialRow
                key={t.id}
                t={t}
                index={i}
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

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildPageNumbers(
  current: number,
  total: number
): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "ellipsis")[] = [1];

  if (current > 3) pages.push("ellipsis");

  for (
    let i = Math.max(2, current - 1);
    i <= Math.min(total - 1, current + 1);
    i++
  ) {
    pages.push(i);
  }

  if (current < total - 2) pages.push("ellipsis");
  pages.push(total);

  return pages;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = React.useState(value);

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
}
