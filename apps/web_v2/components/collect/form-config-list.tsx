"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useStudioStore, isStudioDirty } from "@/lib/collect/studio-store";
import type { FormConfigEntry } from "@/lib/collect/studio-types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PlusIcon,
  PencilIcon,
  CopyIcon,
  TrashIcon,
  ToggleLeftIcon,
  ToggleRightIcon,
  DotsThreeVerticalIcon,
  EyeIcon,
  StarIcon,
  TrendUpIcon,
  RadioIcon,
  UsersIcon,
} from "@phosphor-icons/react";

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toLocaleString();
}

function timeAgo(ts: number | null): string {
  if (!ts) return "Never";
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

/* ─── Weight bar (A/B traffic indicator) ──────────────────────────────────── */

function WeightBar({ weight, isActive }: { weight: number; isActive: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-1.5 rounded-full bg-muted"
        style={{ width: 48 }}
        role="meter"
        aria-valuenow={weight}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`A/B traffic weight: ${weight}%`}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all",
            isActive ? "bg-primary" : "bg-muted-foreground/30",
          )}
          style={{ width: `${weight}%` }}
        />
      </div>
      <span className="text-[10px] tabular-nums text-muted-foreground">
        {weight}%
      </span>
    </div>
  );
}

/* ─── Stat tile (summary metrics) ─────────────────────────────────────────── */

function StatTile({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/60 px-4 py-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
        <Icon className="size-3.5 text-muted-foreground" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-semibold tabular-nums tracking-tight text-foreground">
          {value}
        </p>
        <p className="text-[10px] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

/* ─── Skeleton loader ─────────────────────────────────────────────────────── */

function FormCardSkeleton() {
  return (
    <div className="rounded-xl ring-1 ring-foreground/[0.06] p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-28 animate-shimmer" />
            <Skeleton className="h-4 w-12 rounded-full animate-shimmer" />
          </div>
          <Skeleton className="h-3 w-48 animate-shimmer" />
        </div>
        <Skeleton className="h-3 w-16 animate-shimmer" />
      </div>
      <div className="flex items-center gap-4 pt-1">
        <Skeleton className="h-3 w-16 animate-shimmer" />
        <Skeleton className="h-3 w-14 animate-shimmer" />
        <Skeleton className="h-3 w-18 animate-shimmer" />
        <Skeleton className="h-3 w-12 animate-shimmer" />
      </div>
      <div className="flex items-center gap-2 pt-1">
        <Skeleton className="h-7 w-16 rounded-md animate-shimmer" />
        <Skeleton className="h-7 w-7 rounded-md animate-shimmer" />
      </div>
    </div>
  );
}

/* ─── Form card ───────────────────────────────────────────────────────────── */

const FormCard = React.memo(function FormCard({
  entry,
  index,
  hasDirtyDraft,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleActive,
}: {
  entry: FormConfigEntry;
  index: number;
  hasDirtyDraft: boolean;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}) {
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  return (
    <div
      className={cn(
        "group tactile relative rounded-xl ring-1 transition-all duration-200 animate-fade-up",
        entry.isActive
          ? "ring-emerald-500/20 hover:ring-emerald-500/30"
          : "ring-foreground/[0.06] hover:ring-foreground/[0.14]",
      )}
      style={{
        animationDelay: `${index * 60}ms`,
        animationFillMode: "both",
      }}
    >
      {/* Active indicator stripe */}
      {entry.isActive && (
        <div className="absolute inset-x-0 top-0 h-px rounded-t-xl bg-emerald-500/40" />
      )}

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-sm font-semibold text-foreground">
                {entry.name}
              </h3>
              {entry.isActive ? (
                <span className="shrink-0 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                  Active
                </span>
              ) : (
                <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  Inactive
                </span>
              )}
              {hasDirtyDraft && (
                <span
                  className="size-1.5 shrink-0 rounded-full bg-amber-500"
                  title="Unsaved changes"
                />
              )}
            </div>
            {entry.description && (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {entry.description}
              </p>
            )}
          </div>

          <WeightBar weight={entry.abWeight} isActive={entry.isActive} />
        </div>

        {/* Inline metrics */}
        <div className="mt-3 flex items-center gap-4 border-t border-border/60 pt-3">
          <span
            className="flex items-center gap-1.5 text-xs tabular-nums text-muted-foreground"
            title={`${entry.submissions} submissions`}
          >
            <UsersIcon className="size-3 shrink-0" aria-hidden="true" />
            {fmtNum(entry.submissions)}
          </span>
          <span
            className="flex items-center gap-1.5 text-xs tabular-nums text-muted-foreground"
            title={`${entry.views} views`}
          >
            <EyeIcon className="size-3 shrink-0" aria-hidden="true" />
            {fmtNum(entry.views)}
          </span>
          <span
            className="flex items-center gap-1.5 text-xs tabular-nums text-muted-foreground"
            title={`${entry.responseRate}% response rate`}
          >
            <TrendUpIcon className="size-3 shrink-0" aria-hidden="true" />
            {entry.responseRate.toFixed(1)}%
          </span>
          {entry.avgRating > 0 && (
            <span
              className="flex items-center gap-1 text-xs tabular-nums text-muted-foreground"
              title={`${entry.avgRating.toFixed(1)} avg rating`}
            >
              <StarIcon
                className="size-3 shrink-0 text-amber-500"
                weight="fill"
                aria-hidden="true"
              />
              {entry.avgRating.toFixed(1)}
            </span>
          )}

          <span className="ml-auto text-[10px] text-muted-foreground">
            {entry.lastSubmissionAt
              ? `Last ${timeAgo(entry.lastSubmissionAt)}`
              : "No submissions"}
          </span>
        </div>

        {/* Actions */}
        <div className="mt-3 flex items-center gap-1.5">
          <Button
            variant="default"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={onEdit}
          >
            <PencilIcon className="size-3" aria-hidden="true" />
            Edit
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="size-7 p-0"
                aria-label="More actions"
              >
                <DotsThreeVerticalIcon className="size-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
              <DropdownMenuItem onClick={onToggleActive}>
                {entry.isActive ? (
                  <ToggleRightIcon className="mr-2 size-3.5" aria-hidden="true" />
                ) : (
                  <ToggleLeftIcon className="mr-2 size-3.5" aria-hidden="true" />
                )}
                {entry.isActive ? "Deactivate" : "Activate"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicate}>
                <CopyIcon className="mr-2 size-3.5" aria-hidden="true" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setDeleteOpen(true)}
              >
                <TrashIcon className="mr-2 size-3.5" aria-hidden="true" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Delete &ldquo;{entry.name}&rdquo;?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove this form configuration and its
                  draft. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
});

/* ─── Empty state ─────────────────────────────────────────────────────────── */

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border/70 px-6 py-20 text-center animate-fade-up">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <RadioIcon className="size-5 text-muted-foreground" aria-hidden="true" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-foreground">
          No collection forms yet
        </h3>
        <p className="mt-1 max-w-[340px] text-xs leading-relaxed text-muted-foreground">
          Create your first testimonial collection form. You can run multiple
          variants simultaneously for A/B testing.
        </p>
      </div>
      <Button size="sm" className="gap-1.5" onClick={onCreate}>
        <PlusIcon className="size-3.5" aria-hidden="true" />
        Create first form
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
    [slug, router],
  );

  const handleDuplicate = React.useCallback(
    (formId: string) => {
      duplicateForm(slug, formId);
    },
    [slug, duplicateForm],
  );

  const handleDelete = React.useCallback(
    (formId: string) => {
      deleteForm(slug, formId);
    },
    [slug, deleteForm],
  );

  const handleToggleActive = React.useCallback(
    (formId: string, isActive: boolean) => {
      updateFormEntry(slug, formId, { isActive: !isActive });
    },
    [slug, updateFormEntry],
  );

  // Aggregate metrics
  const totalSubmissions = forms.reduce((s, f) => s + f.submissions, 0);
  const totalViews = forms.reduce((s, f) => s + f.views, 0);
  const avgResponseRate =
    forms.length > 0
      ? forms.reduce((s, f) => s + f.responseRate, 0) / forms.length
      : 0;
  const activeForms = forms.filter((f) => f.isActive).length;

  // A/B weight summary
  const totalActiveWeight = forms
    .filter((f) => f.isActive)
    .reduce((sum, f) => sum + f.abWeight, 0);

  return (
    <div className="flex flex-1 flex-col">
      {/* ── Page header ── */}
      <div className="flex items-center justify-between gap-4 border-b border-border px-6 h-14 shrink-0">
        <div className="min-w-0 flex-1">
          <h1 className="text-sm font-semibold tracking-tight text-foreground">
            Collection Forms
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              {forms.length} form{forms.length !== 1 ? "s" : ""}
              {activeForms > 0 && (
                <>
                  {" \u00b7 "}
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    {activeForms} active
                  </span>
                </>
              )}
            </span>
          </h1>
        </div>
        {forms.length > 0 && (
          <Button size="sm" className="gap-1.5 text-xs" onClick={handleCreate}>
            <PlusIcon className="size-3.5" aria-hidden="true" />
            New form
          </Button>
        )}
      </div>

      {/* ── Content ── */}
      <div className="flex-1 px-6 py-6">
        {/* Loading skeleton */}
        {!hydrated ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-[72px] rounded-lg animate-shimmer" />
              ))}
            </div>
            <div className="space-y-3">
              <FormCardSkeleton />
              <FormCardSkeleton />
            </div>
          </div>
        ) : forms.length === 0 ? (
          <EmptyState onCreate={handleCreate} />
        ) : (
          <div className="space-y-5">
            {/* Summary stats */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatTile
                label="Total Submissions"
                value={fmtNum(totalSubmissions)}
                icon={UsersIcon}
              />
              <StatTile
                label="Total Views"
                value={fmtNum(totalViews)}
                icon={EyeIcon}
              />
              <StatTile
                label="Avg Response Rate"
                value={`${avgResponseRate.toFixed(1)}%`}
                icon={TrendUpIcon}
              />
              <StatTile
                label="Active Forms"
                value={String(activeForms)}
                icon={RadioIcon}
              />
            </div>

            {/* A/B weight warning */}
            {forms.length > 1 &&
              totalActiveWeight !== 100 &&
              totalActiveWeight > 0 && (
                <div
                  className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-800/30 dark:bg-amber-900/10 dark:text-amber-300"
                  role="alert"
                >
                  Active form weights total{" "}
                  <strong>{totalActiveWeight}%</strong> — they should sum to
                  100% for proper A/B traffic splitting.
                </div>
              )}

            {/* Form list */}
            <div
              className="flex flex-col gap-3"
              role="list"
              aria-label="Form configurations"
            >
              {forms.map((entry, i) => (
                <div key={entry.id} role="listitem">
                  <FormCard
                    entry={entry}
                    index={i}
                    hasDirtyDraft={isStudioDirty(snapshots[entry.id])}
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
          </div>
        )}
      </div>
    </div>
  );
}
