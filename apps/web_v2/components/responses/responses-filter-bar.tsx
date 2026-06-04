"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Funnel as FilterIcon,
  CaretDown as ChevronDownIcon,
  Export as ExportIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PageToolbar,
  RefreshingDataBadge,
  SearchField,
} from "@/components/shared";
import { useCreateCsvExport } from "@/hooks/api";
import type { V2ModerationStatus } from "@workspace/types";

// ── Compact result summary the filter bar needs from its consumer ─────────────
export interface FilterBarResultSummary {
  total: number;
}

// ── Types ────────────────────────────────────────────────────────────────────

export type StatusFilter = V2ModerationStatus | "ALL";
export type SortOption = "newest" | "oldest" | "rating_desc" | "rating_asc";

// ── Config ───────────────────────────────────────────────────────────────────

export const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "PENDING", label: "Pending" },
  { key: "FLAGGED", label: "Flagged" },
  { key: "APPROVED", label: "Approved" },
  { key: "REJECTED", label: "Rejected" },
];

export const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: "newest", label: "Newest first" },
  { key: "oldest", label: "Oldest first" },
  { key: "rating_desc", label: "Rating: high to low" },
  { key: "rating_asc", label: "Rating: low to high" },
];

// ── Props ────────────────────────────────────────────────────────────────────

interface FilterBarProps {
  slug: string;
  sort: SortOption;
  setSort: (s: SortOption) => void;
  search: string;
  setSearch: (s: string) => void;
  result: FilterBarResultSummary | null;
  refreshing?: boolean;
}

// ── Component ────────────────────────────────────────────────────────────────

export function ResponsesFilterBar({
  slug,
  sort,
  setSort,
  search,
  setSearch,
  result,
  refreshing,
}: FilterBarProps) {
  const router = useRouter();
  const createExport = useCreateCsvExport(slug);
  const sortLabel = SORT_OPTIONS.find((o) => o.key === sort)?.label ?? "Sort";

  function handleExport() {
    createExport.mutate(undefined, {
      onSuccess: () => {
        toast.success("Export queued", {
          description: "Your CSV will be ready on the Exports page shortly.",
          action: {
            label: "View exports",
            onClick: () => router.push(`/projects/${slug}/developers/exports`),
          },
        });
      },
      onError: () => {
        toast.error("Could not start export. Please try again.");
      },
    });
  }

  return (
    <PageToolbar
      stickyTop="0"
      leading={
        <>
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Search responses…"
            ariaLabel="Search responses"
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="xs"
                className="gap-1.5 text-muted-foreground"
              >
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
        </>
      }
      trailing={
        <>
          <RefreshingDataBadge show={refreshing} />
          {result && (
            <span className="text-[11px] tabular-nums text-muted-foreground">
              {result.total} {result.total === 1 ? "result" : "results"}
            </span>
          )}
          <Button
            variant="outline"
            size="xs"
            className="gap-1.5"
            onClick={handleExport}
            disabled={createExport.isPending}
          >
            {createExport.isPending ? (
              <Spinner className="size-3" />
            ) : (
              <ExportIcon
                className="size-3 shrink-0"
                weight="bold"
                aria-hidden
              />
            )}
            Export CSV
          </Button>
        </>
      }
    />
  );
}
