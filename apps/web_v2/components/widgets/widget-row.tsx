"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  PencilSimple as PencilIcon,
  Copy as CopyIcon,
  Trash as TrashIcon,
  ArrowUpRight as ArrowUpRightIcon,
  Pause as PauseIcon,
  Play as PlayIcon,
  Sun as SunIcon,
  MoonStars as MoonIcon,
  CircleHalf as AutoIcon,
  type Icon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { fmtNum } from "@/lib/format";
import { timeAgo } from "@/lib/format";
import type { WidgetListEntry } from "@/lib/widgets/widget-types";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Badge } from "@/components/ui/badge";
import { InlineName } from "@/components/studio/inline-name";
import { ItemRow, ItemActionRow, type ItemAction } from "@/components/shared";
import { WidgetLayoutPreview } from "./widget-layout-preview";

const LAYOUT_LABEL: Record<WidgetListEntry["layout"], string> = {
  carousel: "Carousel",
  grid: "Grid",
  masonry: "Masonry",
  list: "List",
  wall: "Wall",
};

/**
 * Theme presentation, keyed defensively by string. Widget data crosses an API
 * boundary where `theme` can drift out of the expected union (a null column, a
 * newly added server value). Looking up through this map with a fallback means
 * an unexpected value renders as "System" instead of crashing the row — e.g.
 * the old `entry.theme.charAt(0)` threw on `undefined`.
 */
const THEME_META: Record<string, { icon: Icon; label: string }> = {
  light: { icon: SunIcon, label: "Light" },
  dark: { icon: MoonIcon, label: "Dark" },
  system: { icon: AutoIcon, label: "System" },
};
const THEME_FALLBACK = THEME_META.system;

function layoutLabel(layout: WidgetListEntry["layout"]): string {
  return LAYOUT_LABEL[layout] ?? "Custom";
}

interface WidgetRowProps {
  slug: string;
  entry: WidgetListEntry;
  wallSlug: string | null;
  hasDirtyDraft: boolean;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
  onRename: (next: string) => void;
}

export const WidgetRow = React.memo(function WidgetRow({
  slug,
  entry,
  wallSlug,
  hasDirtyDraft,
  onDuplicate,
  onDelete,
  onToggleActive,
  onRename,
}: WidgetRowProps) {
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const isWall = entry.kind === "wall";
  const editHref = `/projects/${slug}/widgets/${entry.id}`;
  const wallUrl = isWall && wallSlug ? `semblia.com/wall/${wallSlug}` : null;

  const handleCopyShare = React.useCallback(async () => {
    if (isWall && !wallUrl) {
      toast.info("Open this wall in the studio to set its URL.");
      return;
    }
    try {
      const text = isWall
        ? `https://${wallUrl}`
        : `<script type="module" src="https://widgets.semblia.com/embed.js" async></script>
<semblia-widget project="${slug}" widget="${entry.id}"></semblia-widget>`;
      await navigator.clipboard.writeText(text);
      toast.success(isWall ? "Wall URL copied" : "Embed snippet copied");
    } catch {
      toast.error("Couldn't copy. Try again.");
    }
  }, [isWall, wallUrl, entry.id, slug]);

  const actions: ItemAction[] = [
    {
      id: "edit",
      label: "Edit",
      icon: PencilIcon,
      href: editHref,
      pinned: true,
    },
    {
      id: "share",
      label: isWall ? "Open" : "Snippet",
      icon: isWall ? ArrowUpRightIcon : CopyIcon,
      onSelect: handleCopyShare,
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

  const themeMeta = THEME_META[entry.theme] ?? THEME_FALLBACK;
  const ThemeIcon = themeMeta.icon;
  const themeLabel = themeMeta.label;

  return (
    <>
      <ItemRow
        inactive={!entry.isActive}
        aria-label={`${entry.name} (${layoutLabel(entry.layout)})`}
        padding="default"
        leading={
          /* Mini preview of the widget's layout */
          <div
            className={cn(
              "relative h-9 w-[3.5rem] shrink-0 overflow-hidden rounded-md border border-border bg-muted",
              !entry.isActive && "opacity-60",
            )}
          >
            <WidgetLayoutPreview
              layout={entry.layout}
              kind={entry.kind}
              accent={entry.accent}
              theme={entry.theme}
              className="absolute inset-0"
            />
          </div>
        }
        title={
          <InlineName
            value={entry.name}
            muted={!entry.isActive}
            dirty={hasDirtyDraft}
            onCommit={onRename}
          />
        }
        subtitle={
          <div className="mt-0.5 flex flex-wrap items-baseline gap-1.5">
            <span className="inline-flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
              <ThemeIcon className="size-2.5" weight="bold" aria-hidden />
              {themeLabel}
            </span>
            <span className="text-border">·</span>
            <span className="font-mono text-[10px] text-muted-foreground">
              {layoutLabel(entry.layout)}
            </span>
          </div>
        }
        metrics={
          <div className="font-mono text-[11px] tabular-nums tracking-tight text-muted-foreground">
            {entry.metrics.totalLoads > 0 ? (
              <>
                <span className="font-semibold text-foreground">
                  {fmtNum(entry.metrics.totalLoads)}
                </span>{" "}
                {entry.metrics.totalLoads === 1 ? "load" : "loads"}
              </>
            ) : (
              "No loads yet"
            )}
          </div>
        }
        trailing={
          <div className="flex items-baseline gap-2">
            <Badge
              variant={entry.isActive ? "secondary" : "outline"}
              className={cn(
                "text-[10px] font-medium",
                !entry.isActive && "opacity-50",
              )}
            >
              {entry.isActive ? "Active" : "Paused"}
            </Badge>
            <span className="hidden text-xs tabular-nums text-muted-foreground sm:block">
              {entry.metrics.lastLoadAt
                ? timeAgo(new Date(entry.metrics.lastLoadAt))
                : "—"}
            </span>
          </div>
        }
        actions={
          <ItemActionRow
            actions={actions}
            collapseUnder={380}
            visibleWhenCollapsed={2}
          />
        }
      />

      <ConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        intent="danger"
        title={<>Delete &ldquo;{entry.name}&rdquo;?</>}
        description={
          <>
            Embeds using its id will stop rendering. This action cannot be
            undone.
          </>
        }
        cancelLabel="Keep widget"
        confirmLabel="Delete widget"
        onConfirm={onDelete}
      />
    </>
  );
});
