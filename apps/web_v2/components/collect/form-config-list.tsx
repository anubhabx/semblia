"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useStudioStore, isStudioDirty } from "@/lib/collect/studio-store";
import type { FormConfigEntry } from "@/lib/collect/studio-types";
import { ActionButton } from "@/components/ui/action-button";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PlusIcon,
  PencilIcon,
  CopyIcon,
  TrashIcon,
  PauseIcon,
  PlayIcon
} from "@phosphor-icons/react";

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function normalizeEntryMetrics(entry: FormConfigEntry): FormConfigEntry {
  return {
    ...entry,
    submissions: Number.isFinite(entry.submissions) ? entry.submissions : 0,
    views: Number.isFinite(entry.views) ? entry.views : 0,
    responseRate: Number.isFinite(entry.responseRate) ? entry.responseRate : 0,
    avgRating: Number.isFinite(entry.avgRating) ? entry.avgRating : 0,
    lastSubmissionAt:
      typeof entry.lastSubmissionAt === "number" &&
      Number.isFinite(entry.lastSubmissionAt)
        ? entry.lastSubmissionAt
        : null
  };
}

/* ─── Skeleton loader ─────────────────────────────────────────────────────── */

function FormItemSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start gap-4">
        <Skeleton className="size-10 shrink-0 rounded-lg animate-shimmer" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-36 animate-shimmer" />
          <Skeleton className="h-3 w-52 animate-shimmer" />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        <Skeleton className="h-16 rounded-lg animate-shimmer" />
        <Skeleton className="h-16 rounded-lg animate-shimmer" />
        <Skeleton className="h-16 rounded-lg animate-shimmer" />
      </div>
      <div className="mt-3 flex items-center gap-1">
        <Skeleton className="h-7 w-14 rounded-md animate-shimmer" />
        <Skeleton className="h-7 w-20 rounded-md animate-shimmer" />
      </div>
    </div>
  );
}

/* ─── Mini ring chart for response rate ───────────────────────────────────── */

function RateRing({ rate, size = 40 }: { rate: number; size?: number }) {
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(Math.max(rate, 0), 100);
  const offset = c - (pct / 100) * c;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={3} className="text-border" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={3}
        strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
        className="text-brand transition-[stroke-dashoffset] duration-500" />
    </svg>
  );
}

/* ─── Metric stat card ────────────────────────────────────────────────────── */

function MetricCard({ value, label, children }: { value: string; label: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2.5">
      {children}
      <div>
        <p className="text-sm font-semibold tabular-nums text-foreground leading-none">{value}</p>
        <p className="mt-1 text-[10px] text-muted-foreground leading-none">{label}</p>
      </div>
    </div>
  );
}

/* ─── Mini bar ────────────────────────────────────────────────────────────── */

function MiniBar({ fill, className }: { fill: number; className?: string }) {
  return (
    <div className={cn("h-5 w-1 shrink-0 rounded-full bg-border overflow-hidden flex flex-col justify-end", className)}>
      <div className="rounded-full bg-current transition-[height] duration-500" style={{ height: `${Math.min(Math.max(fill, 5), 100)}%` }} />
    </div>
  );
}

/* ─── Form item ───────────────────────────────────────────────────────────── */

const FormItem = React.memo(function FormItem({
  entry,
  hasDirtyDraft,
  accentColor,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleActive
}: {
  entry: FormConfigEntry;
  hasDirtyDraft: boolean;
  accentColor?: string;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}) {
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const maxMetric = Math.max(entry.views, entry.submissions, 1);

  return (
    <div
      className={cn(
        "group relative rounded-xl border border-border bg-card transition-[border-color,box-shadow] duration-200",
        "hover:border-border/80 hover:shadow-sm",
      )}
    >
      {/* Accent stripe */}
      {accentColor && (
        <div
          className="absolute inset-y-0 left-0 w-[3px] rounded-l-xl"
          style={{ background: accentColor }}
        />
      )}

      <div className="p-5 pl-5">
        {/* Identity row */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-[13.5px] font-semibold tracking-tight text-foreground">
                {entry.name}
              </h3>
              {entry.isActive ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9.5px] font-semibold tracking-wide text-emerald-600 dark:text-emerald-400">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[9.5px] font-semibold tracking-wide text-muted-foreground">
                  PAUSED
                </span>
              )}
              {hasDirtyDraft && (
                <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-[9.5px] font-semibold tracking-wide text-amber-600 dark:text-amber-400">
                  DRAFT
                </span>
              )}
            </div>
            {entry.description && (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {entry.description}
              </p>
            )}
          </div>

          {/* Quick edit button — visible on hover */}
          <ActionButton
            tone="neutral"
            variant="outline"
            size="xs"
            className="gap-1.5 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={onEdit}
          >
            <PencilIcon className="size-3" aria-hidden="true" />
            Edit
          </ActionButton>
        </div>

        {/* Metrics row */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <MetricCard value={fmtNum(entry.views)} label="unique visits">
            <MiniBar fill={(entry.views / maxMetric) * 100} className="text-sky-500" />
          </MetricCard>
          <MetricCard value={fmtNum(entry.submissions)} label="submissions">
            <MiniBar fill={(entry.submissions / maxMetric) * 100} className="text-violet-500" />
          </MetricCard>
          <MetricCard value={`${entry.responseRate.toFixed(1)}%`} label="response rate">
            <RateRing rate={entry.responseRate} size={32} />
          </MetricCard>
        </div>

        {/* Actions */}
        <div className="mt-3 flex flex-wrap items-center gap-1">
          <ActionButton tone="neutral" variant="ghost" size="xs" className="gap-1" onClick={onDuplicate}>
            <CopyIcon className="size-3" aria-hidden="true" />
            Duplicate
          </ActionButton>
          <ActionButton
            tone={entry.isActive ? "warning" : "success"}
            variant="ghost"
            size="xs"
            className="gap-1"
            onClick={onToggleActive}
          >
            {entry.isActive ? (
              <PauseIcon className="size-3" aria-hidden="true" />
            ) : (
              <PlayIcon className="size-3" aria-hidden="true" />
            )}
            {entry.isActive ? "Pause" : "Activate"}
          </ActionButton>
          <div className="flex-1" />
          <ActionButton
            tone="danger"
            variant="ghost"
            size="xs"
            className="gap-1 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={() => setDeleteOpen(true)}
          >
            <TrashIcon className="size-3" aria-hidden="true" />
            Delete
          </ActionButton>
        </div>
      </div>

      <ConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        intent="danger"
        title={<>Delete &ldquo;{entry.name}&rdquo;?</>}
        description={
          <>
            This permanently removes this form configuration and its draft.
            This action cannot be undone.
          </>
        }
        cancelLabel="Keep form"
        confirmLabel="Delete form"
        onConfirm={onDelete}
      />
    </div>
  );
});

/* ─── Empty state ─────────────────────────────────────────────────────────── */

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
      <p className="text-sm font-medium text-foreground">No forms yet</p>
      <p className="max-w-[300px] text-xs leading-relaxed text-muted-foreground">
        Create your first testimonial collection form. You can run multiple
        variants for A/B testing.
      </p>
      <Button size="sm" className="mt-1 gap-1.5 text-xs" onClick={onCreate}>
        <PlusIcon className="size-3.5" aria-hidden="true" />
        Create form
      </Button>
    </div>
  );
}

const EMPTY_FORMS: FormConfigEntry[] = [];

/* ─── Main form config list ───────────────────────────────────────────────── */

export function FormConfigList({ slug }: { slug: string }) {
  const router = useRouter();
  const forms = useStudioStore((s) => s.formsByProject[slug]) ?? EMPTY_FORMS;
  const snapshots = useStudioStore((s) => s.snapshots);
  const ensureProject = useStudioStore((s) => s.ensureProject);
  const createForm = useStudioStore((s) => s.createForm);
  const deleteForm = useStudioStore((s) => s.deleteForm);
  const duplicateForm = useStudioStore((s) => s.duplicateForm);
  const updateFormEntry = useStudioStore((s) => s.updateFormEntry);

  const [hydrated, setHydrated] = React.useState(false);
  const normalizedForms = React.useMemo(
    () => forms.map(normalizeEntryMetrics),
    [forms]
  );

  // Ensure at least one form exists
  React.useEffect(() => {
    if (forms.length === 0) {
      ensureProject(slug);
    }
    setHydrated(true);
  }, [slug, forms.length, ensureProject]);

  const handleCreate = React.useCallback(() => {
    const formId = createForm(slug);
    router.push(`/projects/${slug}/collect/${formId}`);
  }, [slug, createForm, router]);

  const handleEdit = React.useCallback(
    (formId: string) => {
      router.push(`/projects/${slug}/collect/${formId}`);
    },
    [slug, router]
  );

  const handleDuplicate = React.useCallback(
    (formId: string) => {
      duplicateForm(slug, formId);
    },
    [slug, duplicateForm]
  );

  const handleDelete = React.useCallback(
    (formId: string) => {
      deleteForm(slug, formId);
    },
    [slug, deleteForm]
  );

  const handleToggleActive = React.useCallback(
    (formId: string, isActive: boolean) => {
      updateFormEntry(slug, formId, { isActive: !isActive });
    },
    [slug, updateFormEntry]
  );

  // A/B weight summary
  const totalActiveWeight = normalizedForms
    .filter((f) => f.isActive)
    .reduce((sum, f) => sum + f.abWeight, 0);

  return (
    <div className="flex flex-1 flex-col">
      {/* ── Page header ── */}
      <div className="border-b border-border px-6 py-5 sm:py-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-base font-semibold tracking-tight text-foreground">
              Your Forms
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Collect testimonials and feedback from your customers.
            </p>
          </div>
          {normalizedForms.length > 0 && (
            <Button
              size="sm"
              className="shrink-0 gap-1.5 text-xs"
              onClick={handleCreate}
            >
              <PlusIcon className="size-3.5" aria-hidden="true" />
              Create new
            </Button>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto">
        {/* A/B weight warning */}
        {hydrated &&
          normalizedForms.length > 1 &&
          totalActiveWeight !== 100 &&
          totalActiveWeight > 0 && (
            <div
              className="mx-6 mt-4 rounded-md border border-border bg-muted/50 px-3 py-2 text-[11px] text-muted-foreground"
              role="alert"
            >
              Active form weights total{" "}
              <strong className="text-foreground">{totalActiveWeight}%</strong>{" "}
              — should sum to 100% for proper A/B splitting.
            </div>
          )}

        {!hydrated ? (
          <>
            <FormItemSkeleton />
            <FormItemSkeleton />
          </>
        ) : normalizedForms.length === 0 ? (
          <EmptyState onCreate={handleCreate} />
        ) : (
          <div role="list" aria-label="Form configurations" className="grid gap-3 p-6 sm:grid-cols-1 lg:grid-cols-2">
            {normalizedForms.map((entry) => (
              <div key={entry.id} role="listitem">
                <FormItem
                  entry={entry}
                  hasDirtyDraft={isStudioDirty(snapshots[entry.id])}
                  accentColor={snapshots[entry.id]?.draft?.tokens?.accent}
                  onEdit={() => handleEdit(entry.id)}
                  onDuplicate={() => handleDuplicate(entry.id)}
                  onDelete={() => handleDelete(entry.id)}
                  onToggleActive={() =>
                    handleToggleActive(entry.id, entry.isActive)
                  }
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
