"use client";

import { CircleNotch } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export interface RefreshingDataBadgeProps {
  show?: boolean;
  label?: string;
  className?: string;
}

export function RefreshingDataBadge({
  show,
  label = "Refreshing data",
  className,
}: RefreshingDataBadgeProps) {
  if (!show) return null;

  return (
    <span
      role="status"
      aria-live="polite"
      className={cn(
        "inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full border border-border/70 bg-background/95 px-2.5 text-[10px] font-medium text-muted-foreground shadow-sm",
        className,
      )}
    >
      <CircleNotch className="size-3 animate-spin text-brand" aria-hidden />
      {label}
    </span>
  );
}
