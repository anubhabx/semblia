"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight as ArrowRightIcon,
  CheckCircle as CheckCircleIcon,
  Clock as ClockIcon,
  Plus as PlusIcon,
  XCircle as XCircleIcon,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import type { V2ProjectOwnershipTransferDTO } from "@workspace/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  PageHeader,
  PageBody,
  FilterPills,
  RefreshingDataBadge,
  SearchField,
  ViewToggle,
} from "@/components/shared";
import {
  useAcceptProjectTransfer,
  useDeclineProjectTransfer,
  useMyProjectTransfers,
} from "@/hooks/api";
import { useProjects, type ProjectFilter } from "@/hooks/use-projects";
import { PROJECT_TYPE_LABELS } from "@/lib/format";

import { ProjectRowSkeleton, ProjectCardSkeleton } from "./project-skeletons";
import { ProjectRow } from "./project-row";
import { ProjectCard } from "./project-card";
import { EmptySearch, EmptyProjects } from "./project-empty-states";

function transferUserName(user: V2ProjectOwnershipTransferDTO["fromUser"]) {
  return (
    [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email
  );
}

function transferExpiry(value: string) {
  const expires = new Date(value).getTime();
  if (!Number.isFinite(expires)) return "expires soon";
  const diffMs = expires - Date.now();
  if (diffMs <= 0) return "expired";
  const hours = Math.ceil(diffMs / (1000 * 60 * 60));
  if (hours < 24) return `expires in ${hours}h`;
  return `expires in ${Math.ceil(hours / 24)}d`;
}

function IncomingTransfers({
  transfers,
  onReview,
}: {
  transfers: V2ProjectOwnershipTransferDTO[];
  onReview: (transfer: V2ProjectOwnershipTransferDTO) => void;
}) {
  if (transfers.length === 0) return null;

  return (
    <div className="px-4 pt-4 sm:px-6">
      <div className="overflow-hidden rounded-lg border border-warning/30 bg-warning/[0.06]">
        <div className="divide-y divide-warning/20">
          {transfers.map((transfer) => (
            <div
              key={transfer.id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <ClockIcon className="size-4 text-warning" aria-hidden />
                  Ownership request
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {transferUserName(transfer.fromUser)} wants you to own{" "}
                  <span className="font-medium text-foreground">
                    {transfer.projectName}
                  </span>{" "}
                  · {transferExpiry(transfer.expiresAt)}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onReview(transfer)}
                className="gap-1.5 self-start sm:self-auto"
              >
                Review
                <ArrowRightIcon className="size-3.5" aria-hidden />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function IncomingTransferDialog({
  transfer,
  open,
  onOpenChange,
  onAccept,
  onDecline,
  pending,
}: {
  transfer: V2ProjectOwnershipTransferDTO | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
  onDecline: () => void;
  pending: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Review ownership transfer</DialogTitle>
          <DialogDescription>
            Accepting makes you the primary owner. The current owner stays as an
            admin, and billing remains on their account.
          </DialogDescription>
        </DialogHeader>

        {transfer && (
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-sm font-medium text-foreground">
              {transfer.projectName}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Requested by {transferUserName(transfer.fromUser)} ·{" "}
              {transferExpiry(transfer.expiresAt)}
            </p>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onDecline}
            disabled={pending}
            className="gap-1.5"
          >
            <XCircleIcon className="size-3.5" aria-hidden />
            Decline
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onAccept}
            disabled={pending}
            className="gap-1.5"
          >
            <CheckCircleIcon className="size-3.5" aria-hidden />
            Accept ownership
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main client component ─────────────────────────────────────────────────────

export function ProjectsClient() {
  const {
    projects,
    filtered,
    loading,
    refreshing,
    view,
    setView,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    typeCounts,
  } = useProjects();
  const incomingTransfers = useMyProjectTransfers({ freshOnMount: true });
  const acceptTransfer = useAcceptProjectTransfer();
  const declineTransfer = useDeclineProjectTransfer();
  const [reviewTransfer, setReviewTransfer] =
    React.useState<V2ProjectOwnershipTransferDTO | null>(null);
  const transfers = incomingTransfers.data ?? [];
  const transferPending = acceptTransfer.isPending || declineTransfer.isPending;

  // Build filter pill options from data
  const filterOptions: { id: ProjectFilter; label: string; count: number }[] = [
    { id: "all", label: "All", count: typeCounts.get("all") ?? 0 },
    ...([...typeCounts.entries()] as [ProjectFilter, number][])
      .filter(([k]) => k !== "all")
      .map(([k, count]) => ({
        id: k,
        label: PROJECT_TYPE_LABELS[k as keyof typeof PROJECT_TYPE_LABELS] ?? k,
        count,
      })),
  ];

  // Toolbar (filter pills + search + view toggle) is earned by content, not
  // granted by default: at small workspaces (1-5 projects) there is nothing to
  // filter, search, or switch view of, so the controls are noise.
  const showToolbar = !loading && projects.length >= 6;

  async function handleAcceptTransfer() {
    if (!reviewTransfer) return;
    try {
      await acceptTransfer.mutateAsync(reviewTransfer.id);
      toast.success("Ownership accepted");
      setReviewTransfer(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to accept ownership";
      toast.error(message);
    }
  }

  async function handleDeclineTransfer() {
    if (!reviewTransfer) return;
    try {
      await declineTransfer.mutateAsync(reviewTransfer.id);
      toast.success("Ownership transfer declined");
      setReviewTransfer(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to decline transfer";
      toast.error(message);
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Projects"
        actions={
          <Button size="sm" className="gap-1.5 shrink-0" asChild>
            <Link href="/projects/new">
              <PlusIcon className="size-3.5" />
              New project
            </Link>
          </Button>
        }
        toolbar={
          showToolbar ? (
            <>
              <FilterPills<ProjectFilter>
                aria-label="Filter projects by type"
                options={filterOptions}
                value={typeFilter}
                onChange={setTypeFilter}
              />
              <div className="ml-auto flex items-center gap-3">
                <RefreshingDataBadge show={refreshing} />
                <SearchField
                  value={search}
                  onChange={setSearch}
                  placeholder="Search projects…"
                  ariaLabel="Search projects"
                />
                <ViewToggle value={view} onChange={setView} />
              </div>
            </>
          ) : undefined
        }
      />

      {/* ── Content ── */}
      <PageBody padding="bare" className="flex-1 overflow-y-auto">
        <IncomingTransfers transfers={transfers} onReview={setReviewTransfer} />
        {loading ? (
          view === "list" ? (
            <div className="divide-y divide-border">
              {[0, 1, 2].map((i) => (
                <ProjectRowSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid auto-rows-fr grid-cols-1 gap-3 px-4 py-5 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <ProjectCardSkeleton key={i} />
              ))}
            </div>
          )
        ) : filtered.length === 0 && search ? (
          <EmptySearch query={search} onClear={() => setSearch("")} />
        ) : projects.length === 0 ? (
          <EmptyProjects />
        ) : view === "list" ? (
          <div className="divide-y divide-border">
            {filtered.map((project, i) => (
              <ProjectRow key={project.id} project={project} index={i} />
            ))}
          </div>
        ) : (
          <div className="grid auto-rows-fr grid-cols-1 gap-3 px-4 py-5 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
            {filtered.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </div>
        )}
        <IncomingTransferDialog
          transfer={reviewTransfer}
          open={reviewTransfer !== null}
          onOpenChange={(open) => {
            if (!open) setReviewTransfer(null);
          }}
          onAccept={handleAcceptTransfer}
          onDecline={handleDeclineTransfer}
          pending={transferPending}
        />
      </PageBody>
    </div>
  );
}
