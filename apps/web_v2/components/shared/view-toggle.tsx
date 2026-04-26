"use client";

/**
 * ViewToggle — compact list/grid view switcher.
 *
 * Used in page toolbars alongside SearchField and FilterPills to let users
 * switch between row-list and card-grid layouts. State is owned externally
 * (paired with useViewMode hook for persistence).
 */

import * as React from "react";
import { Rows as RowsIcon, SquaresFour as GridIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export type ViewMode = "list" | "grid";

export interface ViewToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
  size?: "sm" | "default";
  className?: string;
}

export function ViewToggle({ value, onChange, size = "sm", className }: ViewToggleProps) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => {
        if (v === "list" || v === "grid") onChange(v);
      }}
      variant="outline"
      size={size}
      className={cn("gap-0 rounded-lg border border-border/70 bg-muted/40 p-0.5", className)}
    >
      <ToggleGroupItem
        value="list"
        aria-label="List view"
        className="rounded-md data-[state=on]:bg-background data-[state=on]:shadow-sm"
      >
        <RowsIcon className="size-3.5" weight="bold" aria-hidden />
      </ToggleGroupItem>
      <ToggleGroupItem
        value="grid"
        aria-label="Grid view"
        className="rounded-md data-[state=on]:bg-background data-[state=on]:shadow-sm"
      >
        <GridIcon className="size-3.5" weight="bold" aria-hidden />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
