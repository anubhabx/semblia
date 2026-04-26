"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { fmtNum, fmtRelative } from "@/lib/format";
import type { MockApiKey } from "@/lib/mock-data";
import {
  ArrowSquareOutIcon,
  ArrowsClockwiseIcon,
  ProhibitIcon,
  KeyIcon,
} from "@phosphor-icons/react";
import { CopyButton } from "@/components/ui/copy-button";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import {
  ItemRow,
  ItemCard,
  ItemActionRow,
  type ItemAction,
} from "@/components/shared";

/* ─── Shared helpers ─────────────────────────────────────────────────────── */

/** Stable reference evaluated once at module load time — safe for purity rules */
const MODULE_NOW = Date.now();

function KeyTypeBadge({ type }: { type: MockApiKey["type"] }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded border px-1 py-0.5 font-mono text-[10px] font-semibold tracking-widest",
        type === "publishable"
          ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
          : "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400",
      )}
    >
      {type === "publishable" ? "PK" : "SK"}
    </span>
  );
}

function StatusChip({
  isActive,
  isExpired,
}: {
  isActive: boolean;
  isExpired: boolean;
}) {
  if (!isActive)
    return (
      <span className="rounded-sm bg-destructive/10 px-1 py-0.5 font-mono text-[10px] font-medium text-destructive/70">
        revoked
      </span>
    );
  if (isExpired)
    return (
      <span className="rounded-sm bg-amber-500/10 px-1 py-0.5 font-mono text-[10px] font-medium text-amber-600 dark:text-amber-400">
        expired
      </span>
    );
  return null;
}

function MaskedKey({ prefix, lastFour }: { prefix: string; lastFour: string }) {
  const masked = `${prefix}••••${lastFour}`;
  return (
    <span className="flex items-center gap-1">
      <span className="font-mono text-[11px] text-muted-foreground">
        {masked}
      </span>
      <CopyButton value={prefix} label="Copy prefix" />
    </span>
  );
}

function UsageBar({ count, limit }: { count: number; limit: number | null }) {
  if (!limit) return null;
  const pct = Math.min(100, Math.round((count / limit) * 100));
  const fillClass =
    pct >= 95 ? "bg-destructive" : pct >= 80 ? "bg-amber-500" : "bg-primary/60";
  return (
    <div className="flex items-center gap-1.5">
      <div className="h-1 w-16 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", fillClass)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
        {pct}%
      </span>
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

function useKeyActions({
  slug,
  keyId,
  onRevoke,
  onRotate,
}: ApiKeyActions): ItemAction[] {
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
  const isExpired =
    entry.expiresAt != null && entry.expiresAt.getTime() < MODULE_NOW;

  const actions = useKeyActions({
    slug,
    keyId: entry.id,
    onRevoke: () => setRevokeOpen(true),
    onRotate: () => setRotateOpen(true),
  });

  const expiryLabel = isExpired ? "Expired" : null;

  return (
    <>
      <ItemRow
        accentColor={
          inactive
            ? null
            : entry.type === "publishable"
              ? "rgba(245,158,11,0.65)"
              : "rgba(14,165,233,0.65)"
        }
        inactive={inactive}
        padding="comfortable"
        leading={
          <div
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-md",
              entry.type === "publishable"
                ? "bg-amber-500/10"
                : "bg-sky-500/10",
              inactive && "opacity-40",
            )}
          >
            <KeyIcon
              className={cn(
                "size-3.5",
                entry.type === "publishable"
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-sky-600 dark:text-sky-400",
              )}
              weight="bold"
            />
          </div>
        }
        title={
          <div className="flex items-center gap-2 min-w-0">
            <KeyTypeBadge type={entry.type} />
            <span
              className={cn(
                "truncate text-sm font-medium",
                inactive && "text-muted-foreground",
              )}
            >
              {entry.name}
            </span>
          </div>
        }
        subtitle={
          <MaskedKey
            prefix={entry.keyPrefix}
            lastFour={entry.lastFourPlaintext}
          />
        }
        metrics={
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] tabular-nums text-muted-foreground">
            <span>
              <span className="font-semibold text-foreground">
                {fmtNum(entry.usageCount)}
              </span>
              {entry.usageLimit ? ` / ${fmtNum(entry.usageLimit)}` : ""} calls
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
                <StatusChip isActive={entry.isActive} isExpired={isExpired} />
              </>
            )}
            {!entry.isActive && !expiryLabel && (
              <StatusChip isActive={entry.isActive} isExpired={isExpired} />
            )}
          </div>
        }
        actions={
          <ItemActionRow
            actions={actions}
            collapseUnder={480}
            visibleWhenCollapsed={2}
          />
        }
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
  const isExpired =
    entry.expiresAt != null && entry.expiresAt.getTime() < MODULE_NOW;

  const actions = useKeyActions({
    slug,
    keyId: entry.id,
    onRevoke: () => setRevokeOpen(true),
    onRotate: () => setRotateOpen(true),
  });

  return (
    <>
      <ItemCard
        accentColor={
          inactive
            ? null
            : entry.type === "publishable"
              ? "rgba(245,158,11,0.65)"
              : "rgba(14,165,233,0.65)"
        }
        inactive={inactive}
        preview={
          <div
            className={cn(
              "flex items-center gap-2 border-b border-border px-4 py-3",
              entry.type === "publishable" ? "bg-amber-500/5" : "bg-sky-500/5",
            )}
          >
            <KeyTypeBadge type={entry.type} />
            <MaskedKey
              prefix={entry.keyPrefix}
              lastFour={entry.lastFourPlaintext}
            />
            {(!entry.isActive || isExpired) && (
              <div className="ml-auto">
                <StatusChip isActive={entry.isActive} isExpired={isExpired} />
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
        <div className="flex flex-col gap-1 px-4 py-3">
          <span
            className={cn(
              "truncate text-sm font-medium",
              inactive && "text-muted-foreground",
            )}
          >
            {entry.name}
          </span>

          <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[10.5px] tabular-nums text-muted-foreground/80">
            <span>
              <span className="font-semibold text-foreground">
                {fmtNum(entry.usageCount)}
              </span>
              {entry.usageLimit ? ` / ${fmtNum(entry.usageLimit)}` : ""} calls
            </span>
            <span className="text-border">·</span>
            <span>{entry.rateLimit}/min</span>
          </div>
          <UsageBar count={entry.usageCount} limit={entry.usageLimit} />
          {entry.lastUsedAt && (
            <p className="text-[10px] text-muted-foreground/60">
              {fmtRelative(entry.lastUsedAt)}
            </p>
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
