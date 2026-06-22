"use client";

/**
 * FormStatusBadge — the canonical Live / Draft / Closed / Archived chip shared
 * by the form row and the form card so the two list views read identically.
 */

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { formStatusMeta, type FormStatusTone } from "@/lib/forms/intents";
import type { V2FormStatus } from "@workspace/types";

const TONE_BADGE: Record<
  FormStatusTone,
  { variant: "secondary" | "outline"; className: string }
> = {
  live: {
    variant: "secondary",
    className:
      "bg-success/10 text-success border-transparent dark:bg-success/15",
  },
  draft: { variant: "outline", className: "text-muted-foreground" },
  closed: {
    variant: "outline",
    className: "text-warning border-warning/30 bg-warning/5",
  },
  archived: { variant: "outline", className: "text-muted-foreground/70" },
};

export function FormStatusBadge({
  status,
  open,
  className,
}: {
  status: V2FormStatus;
  open: boolean;
  className?: string;
}) {
  const meta = formStatusMeta(status, open);
  const badge = TONE_BADGE[meta.tone];
  return (
    <Badge
      variant={badge.variant}
      className={cn("text-[10px] font-medium", badge.className, className)}
    >
      {meta.label}
    </Badge>
  );
}
