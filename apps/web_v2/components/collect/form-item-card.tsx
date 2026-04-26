"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { fmtNum } from "@/lib/format";
import type { FormConfigEntry } from "@/lib/collect/studio-types";
import {
  PencilIcon,
  CopyIcon,
  TrashIcon,
  PauseIcon,
  PlayIcon,
} from "@phosphor-icons/react";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ItemCard, ItemActionRow, type ItemAction } from "@/components/shared";
import { InlineName } from "./inline-name";
import { FormCardPreview } from "./form-card-preview";

/* ─── Skeleton ────────────────────────────────────────────────────────────── */

export function FormItemCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <Skeleton className="aspect-[16/10] w-full animate-shimmer" />
      <div className="space-y-2 px-4 pb-3 pt-3">
        <Skeleton className="h-3.5 w-32 animate-shimmer" />
        <Skeleton className="h-2.5 w-44 animate-shimmer" />
        <Skeleton className="mt-2 h-7 w-full animate-shimmer" />
      </div>
    </div>
  );
}

/* ─── Form card ───────────────────────────────────────────────────────────── */

export const FormItemCard = React.memo(function FormItemCard({
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
      iconOnly: true,
      pinned: true,
      onSelect: () => setDeleteOpen(true),
    },
  ];

  return (
    <>
      <ItemCard
        accentColor={entry.isActive ? "var(--brand)" : null}
        inactive={inactive}
        preview={
          <div className="relative block aspect-[16/10] overflow-hidden">
            <FormCardPreview inactive={inactive} className="absolute inset-0" />
            {/* Status chip overlay */}
            <div className="absolute left-2 top-2">
              <span
                className={cn(
                  "inline-flex items-center rounded-md px-1.5 py-0.5 font-mono text-[10px] font-medium",
                  "border backdrop-blur-md",
                  entry.isActive
                    ? "border-foreground/15 bg-background/85 text-foreground/80"
                    : "border-border/60 bg-muted/80 text-muted-foreground",
                )}
              >
                {entry.isActive ? "Active" : "Paused"}
              </span>
            </div>
            {entry.abWeight !== 100 && entry.isActive && (
              <div className="absolute right-2 top-2">
                <span className="inline-flex items-center rounded-md border border-foreground/10 bg-background/85 px-1.5 py-0.5 font-mono text-[10px] font-medium text-foreground/70 backdrop-blur-md">
                  {entry.abWeight}%
                </span>
              </div>
            )}
          </div>
        }
        footer={
          <div className="px-4 pb-3">
            <ItemActionRow
              actions={actions}
              collapseUnder={280}
              visibleWhenCollapsed={2}
              className="border-t border-border/60 pt-2"
            />
          </div>
        }
      >
        {/* Body: name + description + metrics */}
        <div className="flex flex-col gap-1 px-4 py-3">
          <InlineName
            value={entry.name}
            muted={inactive}
            dirty={hasDirtyDraft}
            onCommit={onRename}
          />
          {entry.description && (
            <p
              className={cn(
                "line-clamp-2 text-xs leading-relaxed",
                inactive ? "text-muted-foreground/50" : "text-muted-foreground",
              )}
            >
              {entry.description}
            </p>
          )}

          {/* Metric chips */}
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[10.5px] tabular-nums tracking-tight text-muted-foreground/80">
            <span>
              <span className="font-semibold text-foreground">
                {fmtNum(entry.views)}
              </span>{" "}
              views
            </span>
            <span className="text-border">·</span>
            <span>
              <span className="font-semibold text-foreground">
                {fmtNum(entry.submissions)}
              </span>{" "}
              submissions
            </span>
            <span className="text-border">·</span>
            <span>
              <span className="font-semibold text-foreground">
                {entry.responseRate.toFixed(1)}%
              </span>{" "}
              conv.
            </span>
          </div>
        </div>
      </ItemCard>

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
    </>
  );
});
