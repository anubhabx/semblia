"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { fmtNum } from "@/lib/format";
import type { FormConfigEntry } from "@/lib/collect/studio-types";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PencilIcon,
  CopyIcon,
  TrashIcon,
  PauseIcon,
  PlayIcon,
} from "@phosphor-icons/react";
import {
  ItemShell,
  ItemActionRow,
  type ItemAction,
} from "@/components/shared";
import { InlineName } from "./inline-name";

/* ─── Skeleton loader ─────────────────────────────────────────────────────── */

export function FormItemSkeleton() {
  return (
    <ItemShell shape="row" accentColor={null} className="flex-col py-5 pr-6 pl-6">
      <div className="flex w-full items-baseline justify-between gap-6">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-40 animate-shimmer" />
          <Skeleton className="h-3 w-56 animate-shimmer" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-3.5 w-20 animate-shimmer" />
          <Skeleton className="h-3.5 w-20 animate-shimmer" />
          <Skeleton className="h-3.5 w-10 animate-shimmer" />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1">
        <Skeleton className="h-6 w-14 rounded-md animate-shimmer" />
        <Skeleton className="h-6 w-20 rounded-md animate-shimmer" />
        <Skeleton className="h-6 w-14 rounded-md animate-shimmer" />
      </div>
    </ItemShell>
  );
}

/* ─── Inline metric ──────────────────────────────────────────────────────── */

function MetricRow({
  views,
  submissions,
  rate,
  muted,
}: {
  views: number;
  submissions: number;
  rate: number;
  muted?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-baseline gap-1 font-mono text-[11.5px] tracking-tight",
        muted && "opacity-50",
      )}
    >
      <span className="font-semibold tabular-nums text-foreground">
        {fmtNum(views)}
      </span>
      <span className="text-muted-foreground/60">visits</span>
      <span className="px-1 text-border">&middot;</span>
      <span className="font-semibold tabular-nums text-foreground">
        {fmtNum(submissions)}
      </span>
      <span className="text-muted-foreground/60">submissions</span>
      <span className="px-1 text-border">&middot;</span>
      <span className="font-semibold tabular-nums text-foreground">
        {rate.toFixed(1)}%
      </span>
      <span className="text-muted-foreground/60">conversion</span>
    </div>
  );
}

/* ─── Form item ───────────────────────────────────────────────────────────── */

export const FormItem = React.memo(function FormItem({
  entry,
  hasDirtyDraft,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleActive,
  onRename,
}: {
  entry: FormConfigEntry;
  hasDirtyDraft: boolean;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
  onRename: (name: string) => void;
}) {
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const inactive = !entry.isActive;

  const actions: ItemAction[] = [
    {
      id: "edit",
      label: "Edit",
      icon: PencilIcon,
      onSelect: onEdit,
      pinned: true,
    },
    {
      id: "duplicate",
      label: "Duplicate",
      icon: CopyIcon,
      onSelect: onDuplicate,
    },
    {
      id: "toggle",
      label: entry.isActive ? "Pause" : "Activate",
      icon: entry.isActive ? PauseIcon : PlayIcon,
      tone: entry.isActive ? "warning" : "success",
      onSelect: onToggleActive,
    },
    {
      id: "delete",
      label: "Delete",
      icon: TrashIcon,
      tone: "danger",
      pinned: true,
      onSelect: () => setDeleteOpen(true),
    },
  ];

  return (
    <ItemShell
      shape="row"
      accentColor={entry.isActive ? "var(--brand)" : null}
      inactive={inactive}
      className="flex-col py-5 pr-6 pl-6"
    >
      {/* Row 1: name + metrics */}
      <div className="flex w-full items-baseline justify-between gap-6">
        <div className="min-w-0 flex-1">
          <InlineName
            value={entry.name}
            muted={inactive}
            dirty={hasDirtyDraft}
            onCommit={onRename}
          />
          {entry.description && (
            <p
              className={cn(
                "mt-0.5 truncate text-xs",
                inactive ? "text-muted-foreground/50" : "text-muted-foreground",
              )}
            >
              {entry.description}
            </p>
          )}
        </div>

        <MetricRow
          views={entry.views}
          submissions={entry.submissions}
          rate={entry.responseRate}
          muted={inactive}
        />
      </div>

      {/* Row 2: actions — overflow-aware via ItemActionRow */}
      <ItemActionRow
        actions={actions}
        collapseUnder={420}
        visibleWhenCollapsed={1}
        className="mt-3"
      />

      <ConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        intent="danger"
        title={<>Delete &ldquo;{entry.name}&rdquo;?</>}
        description={
          <>
            This permanently removes this form configuration and its draft. This
            action cannot be undone.
          </>
        }
        cancelLabel="Keep form"
        confirmLabel="Delete form"
        onConfirm={onDelete}
      />
    </ItemShell>
  );
});
