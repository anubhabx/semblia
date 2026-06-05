"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { fmtRelative } from "@/lib/format";
import type { V2ActorType, V2ProjectActionAuditDTO } from "@workspace/types";
import {
  UserIcon,
  KeyIcon,
  RobotIcon,
  GearSixIcon,
  type Icon as PhosphorIcon,
} from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton";
import { ItemRow } from "@/components/shared";

/* ─── Actor presentation ──────────────────────────────────────────────────── */

const ACTOR_CONFIG: Record<
  V2ActorType,
  { label: string; icon: PhosphorIcon; className: string }
> = {
  user: {
    label: "User",
    icon: UserIcon,
    className: "border-brand/30 bg-brand-muted text-brand-foreground",
  },
  api_key: {
    label: "API key",
    icon: KeyIcon,
    className: "border-border bg-muted/60 text-muted-foreground",
  },
  agent_key: {
    label: "Agent",
    icon: RobotIcon,
    className: "border-border bg-muted/60 text-muted-foreground",
  },
  system: {
    label: "System",
    icon: GearSixIcon,
    className: "border-border bg-muted/40 text-muted-foreground",
  },
};

function ActorChip({ actorType }: { actorType: V2ActorType }) {
  const cfg = ACTOR_CONFIG[actorType] ?? ACTOR_CONFIG.system;
  return (
    <span
      className={cn(
        "shrink-0 rounded-md border px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em]",
        cfg.className,
      )}
    >
      {cfg.label}
    </span>
  );
}

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

export function humanizeAuditAction(action: string): string {
  return action
    .toLowerCase()
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function humanizeTargetType(targetType: string): string {
  return targetType
    .toLowerCase()
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ─── Row skeleton ────────────────────────────────────────────────────────── */

export function AuditEventRowSkeleton() {
  return (
    <ItemRow
      accentColor={null}
      padding="default"
      leading={<Skeleton className="size-8 rounded-lg animate-shimmer" />}
      title={<Skeleton className="h-3.5 w-40 animate-shimmer" />}
      subtitle={<Skeleton className="h-3 w-28 animate-shimmer" />}
      trailing={<Skeleton className="h-5 w-14 rounded-md animate-shimmer" />}
    />
  );
}

/* ─── Row ─────────────────────────────────────────────────────────────────── */

export const AuditEventRow = React.memo(function AuditEventRow({
  event,
}: {
  event: V2ProjectActionAuditDTO;
}) {
  const cfg = ACTOR_CONFIG[event.actorType] ?? ACTOR_CONFIG.system;
  const Icon = cfg.icon;

  const createdLabel = fmtRelative(new Date(event.createdAt));
  const target =
    event.targetType != null ? humanizeTargetType(event.targetType) : null;

  return (
    <ItemRow
      accentColor={null}
      padding="default"
      leading={
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-muted/30">
          <Icon
            className="size-4 text-muted-foreground"
            weight="regular"
            aria-hidden
          />
        </div>
      }
      title={
        <span className="truncate text-[13px] font-medium text-foreground">
          {humanizeAuditAction(event.action)}
        </span>
      }
      subtitle={
        <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
          {target && (
            <>
              <span>
                {target}
                {event.targetId && (
                  <span className="ml-1 font-mono text-[11px] text-muted-foreground/80">
                    {event.targetId.slice(0, 12)}
                  </span>
                )}
              </span>
              <span aria-hidden>·</span>
            </>
          )}
          <span>{createdLabel}</span>
          {event.actorId && (
            <>
              <span aria-hidden>·</span>
              <span className="font-mono text-[11px] text-muted-foreground/80">
                {event.actorId.slice(0, 12)}
              </span>
            </>
          )}
        </span>
      }
      trailing={<ActorChip actorType={event.actorType} />}
    />
  );
});
