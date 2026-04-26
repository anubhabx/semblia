"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { fmtNum, fmtRelative, fmtExpiry } from "@/lib/format";
import type { MockApiKey } from "@/lib/mock-data";
import {
  ArrowSquareOutIcon,
  ArrowsClockwiseIcon,
  ProhibitIcon,
  KeyIcon,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/ui/copy-button";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { ItemRow, ItemCard, ItemActionRow, type ItemAction } from "@/components/shared";

/* ─── Shared helpers ─────────────────────────────────────────────────────── */

function KeyTypeBadge({ type }: { type: MockApiKey["type"] }) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "shrink-0 font-mono text-[10px] font-semibold tracking-widest",
        type === "publishable"
          ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
          : "bg-slate-500/10 text-slate-700 dark:text-slate-300",
      )}
    >
      {type === "publishable" ? "PK" : "SK"}
    </Badge>
  );
}

function StatusBadge({ isActive, expiresAt }: { isActive: boolean; expiresAt: Date | null }) {
  const expired = expiresAt != null && expiresAt.getTime() < Date.now();
  if (!isActive) return <Badge variant="outline" className="text-[10px] opacity-60">Revoked</Badge>;
  if (expired) return <Badge variant="outline" className="text-[10px] text-destructive">Expired</Badge>;
  return <Badge variant="secondary" className="text-[10px] text-emerald-600 dark:text-emerald-400">Active</Badge>;
}

function MaskedKey({ prefix, lastFour }: { prefix: string; lastFour: string }) {
  const masked = `${prefix}••••${lastFour}`;
  return (
    <span className="flex items-center gap-1">
      <span className="font-mono text-[11px] text-muted-foreground">{masked}</span>
      <CopyButton value={prefix} label="Copy prefix" />
    </span>
  );
}

function UsageBar({ count, limit }: { count: number; limit: number | null }) {
  if (!limit) return null;
  const pct = Math.min(100, Math.round((count / limit) * 100));
  return (
    <div className="flex items-center gap-1.5">
      <div className="h-1 w-16 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", pct >= 90 ? "bg-destructive" : "bg-brand")}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-mono text-[10px] tabular-nums text-muted-foreground">{pct}%</span>
    </div>
  );
}

/* ─── Row skeleton ────────────────────────────────────────────────────────── */

export function ApiKeyListItemSkeleton() {
  return (
    <ItemRow
      accentColor={null}
      padding="comfortable"
      leading={<Skeleton className="size-6 rounded animate-shimmer" />}
      title={<Skeleton className="h-3.5 w-32 animate-shimmer" />}
      subtitle={<Skeleton className="h-3 w-48 animate-shimmer" />}
      metrics={
        <div className="flex gap-2">
          <Skeleton className="h-3 w-16 animate-shimmer" />
          <Skeleton className="h-3 w-20 animate-shimmer" />
        </div>
      }
      trailing={<Skeleton className="h-5 w-14 rounded-full animate-shimmer" />}
    />
  );
}

/* ─── Card skeleton ───────────────────────────────────────────────────────── */

export function ApiKeyCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <Skeleton className="h-[48px] w-full animate-shimmer" />
      <div className="space-y-2 px-4 pb-3 pt-3">
        <Skeleton className="h-3.5 w-28 animate-shimmer" />
        <Skeleton className="h-3 w-40 animate-shimmer" />
        <Skeleton className="mt-2 h-7 w-full animate-shimmer" />
      </div>
    </div>
  );
}

/* ─── Shared action builder ───────────────────────────────────────────────── */

interface ApiKeyActions {
  slug: string;
  keyId: string;
  onRevoke: () => void;
  onRotate: () => void;
}

function useKeyActions({ slug, keyId, onRevoke, onRotate }: ApiKeyActions): ItemAction[] {
  const router = useRouter();
  return [
    {
      id: "view",
      label: "View details",
      icon: ArrowSquareOutIcon,
      pinned: true,
      onSelect: () => router.push(`/projects/${slug}/api-keys/${keyId}`),
    },
    {
      id: "rotate",
      label: "Rotate",
      icon: ArrowsClockwiseIcon,
      tone: "warning",
      onSelect: onRotate,
    },
    {
      id: "revoke",
      label: "Revoke",
      icon: ProhibitIcon,
      tone: "danger",
      pinned: true,
      onSelect: onRevoke,
    },
  ];
}

/* ─── Row variant ─────────────────────────────────────────────────────────── */

export const ApiKeyRow = React.memo(function ApiKeyRow({
  entry,
  slug,
  onRevoke,
  onRotate,
}: {
  entry: MockApiKey;
  slug: string;
  onRevoke: () => void;
  onRotate: () => void;
}) {
  const [revokeOpen, setRevokeOpen] = React.useState(false);
  const [rotateOpen, setRotateOpen] = React.useState(false);
  const inactive = !entry.isActive;

  const actions = useKeyActions({
    slug,
    keyId: entry.id,
    onRevoke: () => setRevokeOpen(true),
    onRotate: () => setRotateOpen(true),
  });

  const expiryLabel = entry.expiresAt ? fmtExpiry(entry.expiresAt) : null;

  return (
    <>
      <ItemRow
        accentColor={entry.isActive ? (entry.type === "publishable" ? "var(--chart-4)" : "var(--chart-2)") : null}
        inactive={inactive}
        padding="comfortable"
        leading={
          <div className={cn("flex size-7 shrink-0 items-center justify-center rounded-md bg-muted", inactive && "opacity-50")}>
            <KeyIcon className="size-3.5 text-muted-foreground" weight="bold" />
          </div>
        }
        title={
          <div className="flex items-center gap-2 min-w-0">
            <KeyTypeBadge type={entry.type} />
            <span className={cn("truncate text-sm font-medium", inactive && "text-muted-foreground")}>{entry.name}</span>
          </div>
        }
        subtitle={<MaskedKey prefix={entry.keyPrefix} lastFour={entry.lastFourPlaintext} />}
        metrics={
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] tabular-nums text-muted-foreground">
            <span>
              <span className="font-semibold text-foreground">{fmtNum(entry.usageCount)}</span>
              {entry.usageLimit ? ` / ${fmtNum(entry.usageLimit)}` : ""}{" "}calls
            </span>
            <span className="text-border">·</span>
            <span>{entry.rateLimit}/min</span>
            {entry.lastUsedAt && (
              <>
                <span className="text-border">·</span>
                <span>{fmtRelative(entry.lastUsedAt)}</span>
              </>
            )}
            {expiryLabel && (
              <>
                <span className="text-border">·</span>
                <span className={cn(expiryLabel === "Expired" && "text-destructive")}>{expiryLabel}</span>
              </>
            )}
          </div>
        }
        trailing={<StatusBadge isActive={entry.isActive} expiresAt={entry.expiresAt} />}
        actions={<ItemActionRow actions={actions} collapseUnder={480} visibleWhenCollapsed={2} />}
      />

      <ConfirmationDialog
        open={revokeOpen}
        onOpenChange={setRevokeOpen}
        intent="danger"
        title={<>Revoke &ldquo;{entry.name}&rdquo;?</>}
        description="This key stops working immediately. You can't undo it."
        cancelLabel="Keep key"
        confirmLabel="Revoke key"
        onConfirm={onRevoke}
      />
      <ConfirmationDialog
        open={rotateOpen}
        onOpenChange={setRotateOpen}
        intent="warning"
        title={<>Rotate &ldquo;{entry.name}&rdquo;?</>}
        description="Rotating creates a new key and revokes this one in 24 hours. Update your servers before then."
        cancelLabel="Cancel"
        confirmLabel="Rotate key"
        onConfirm={onRotate}
      />
    </>
  );
});

/* ─── Card variant ────────────────────────────────────────────────────────── */

export const ApiKeyCard = React.memo(function ApiKeyCard({
  entry,
  slug,
  onRevoke,
  onRotate,
}: {
  entry: MockApiKey;
  slug: string;
  onRevoke: () => void;
  onRotate: () => void;
}) {
  const [revokeOpen, setRevokeOpen] = React.useState(false);
  const [rotateOpen, setRotateOpen] = React.useState(false);
  const inactive = !entry.isActive;
  const accentColor = entry.isActive
    ? entry.type === "publishable"
      ? "var(--chart-4)"
      : "var(--chart-2)"
    : null;

  const actions = useKeyActions({
    slug,
    keyId: entry.id,
    onRevoke: () => setRevokeOpen(true),
    onRotate: () => setRotateOpen(true),
  });

  return (
    <>
      <ItemCard
        accentColor={accentColor}
        inactive={inactive}
        preview={
          <div
            className="flex items-center gap-3 px-4 py-3"
            style={{
              background: accentColor ? `linear-gradient(135deg, ${accentColor}12 0%, transparent 80%)` : undefined,
              borderBottom: `1px solid ${accentColor ?? "var(--border)"}18`,
            }}
          >
            <KeyTypeBadge type={entry.type} />
            <StatusBadge isActive={entry.isActive} expiresAt={entry.expiresAt} />
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
        <div className="flex flex-col gap-1 px-4 py-3">
          <span className={cn("truncate text-sm font-medium", inactive && "text-muted-foreground")}>{entry.name}</span>
          <MaskedKey prefix={entry.keyPrefix} lastFour={entry.lastFourPlaintext} />

          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[10.5px] tabular-nums text-muted-foreground/80">
            <span>
              <span className="font-semibold text-foreground">{fmtNum(entry.usageCount)}</span>
              {entry.usageLimit ? ` / ${fmtNum(entry.usageLimit)}` : ""}{" "}calls
            </span>
            <span className="text-border">·</span>
            <span>{entry.rateLimit}/min</span>
          </div>
          <UsageBar count={entry.usageCount} limit={entry.usageLimit} />
          {entry.lastUsedAt && (
            <p className="text-[10px] text-muted-foreground/60">{fmtRelative(entry.lastUsedAt)}</p>
          )}
        </div>
      </ItemCard>

      <ConfirmationDialog
        open={revokeOpen}
        onOpenChange={setRevokeOpen}
        intent="danger"
        title={<>Revoke &ldquo;{entry.name}&rdquo;?</>}
        description="This key stops working immediately. You can't undo it."
        cancelLabel="Keep key"
        confirmLabel="Revoke key"
        onConfirm={onRevoke}
      />
      <ConfirmationDialog
        open={rotateOpen}
        onOpenChange={setRotateOpen}
        intent="warning"
        title={<>Rotate &ldquo;{entry.name}&rdquo;?</>}
        description="Rotating creates a new key and revokes this one in 24 hours. Update your servers before then."
        cancelLabel="Cancel"
        confirmLabel="Rotate key"
        onConfirm={onRotate}
      />
    </>
  );
});
