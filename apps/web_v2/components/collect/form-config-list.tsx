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
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
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
    <div className="border-b border-border px-6 py-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-36 animate-shimmer" />
          <Skeleton className="h-3 w-52 animate-shimmer" />
        </div>
        <div className="flex items-center gap-6">
          <div className="space-y-1.5 text-right">
            <Skeleton className="ml-auto h-4 w-8 animate-shimmer" />
            <Skeleton className="ml-auto h-2.5 w-12 animate-shimmer" />
          </div>
          <div className="space-y-1.5 text-right">
            <Skeleton className="ml-auto h-4 w-8 animate-shimmer" />
            <Skeleton className="ml-auto h-2.5 w-16 animate-shimmer" />
          </div>
          <div className="space-y-1.5 text-right">
            <Skeleton className="ml-auto h-4 w-10 animate-shimmer" />
            <Skeleton className="ml-auto h-2.5 w-16 animate-shimmer" />
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1">
        <Skeleton className="h-6 w-14 rounded-md animate-shimmer" />
        <Skeleton className="h-6 w-20 rounded-md animate-shimmer" />
        <Skeleton className="h-6 w-14 rounded-md animate-shimmer" />
      </div>
    </div>
  );
}

/* ─── Metric column ───────────────────────────────────────────────────────── */

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-left md:text-right">
      <p className="text-sm font-medium tabular-nums text-foreground">
        {value}
      </p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

/* ─── Form item ───────────────────────────────────────────────────────────── */

const FormItem = React.memo(function FormItem({
  entry,
  hasDirtyDraft,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleActive
}: {
  entry: FormConfigEntry;
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
        "border-b border-border px-6 py-5",
        entry.isActive && "brand-strip"
      )}
    >
      {/* Top section: identity + metrics */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        {/* Left: name, description, status */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-[13px] font-medium text-foreground">
              {entry.name}
            </h3>
            {entry.isActive && (
              <span
                className="size-1.5 shrink-0 rounded-full bg-brand"
                title="Live"
              />
            )}
            {hasDirtyDraft && (
              <span
                className="size-1.5 shrink-0 rounded-full bg-muted-foreground/40"
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

        {/* Right: metrics */}
        <div className="flex shrink-0 items-center gap-6">
          <Metric value={fmtNum(entry.views)} label="unique visits" />
          <Metric value={fmtNum(entry.submissions)} label="submissions" />
          <Metric
            value={`${entry.responseRate.toFixed(1)}%`}
            label="response rate"
          />
        </div>
      </div>

      {/* Actions — always visible */}
      <div className="mt-3 flex flex-wrap items-center gap-1">
        <Button
          variant="ghost"
          size="xs"
          className="gap-1 text-muted-foreground hover:text-foreground"
          onClick={onEdit}
        >
          <PencilIcon className="size-3" aria-hidden="true" />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="xs"
          className="gap-1 text-muted-foreground hover:text-foreground"
          onClick={onDuplicate}
        >
          <CopyIcon className="size-3" aria-hidden="true" />
          Duplicate
        </Button>
        <Button
          variant="ghost"
          size="xs"
          className="gap-1 text-muted-foreground hover:text-foreground"
          onClick={onToggleActive}
        >
          {entry.isActive ? (
            <PauseIcon className="size-3" aria-hidden="true" />
          ) : (
            <PlayIcon className="size-3" aria-hidden="true" />
          )}
          {entry.isActive ? "Pause" : "Activate"}
        </Button>
        <Button
          variant="ghost"
          size="xs"
          className="gap-1 text-destructive/70 hover:text-destructive"
          onClick={() => setDeleteOpen(true)}
        >
          <TrashIcon className="size-3" aria-hidden="true" />
          Delete
        </Button>
      </div>

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

  const activeForms = normalizedForms.filter((f) => f.isActive).length;

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
          <div role="list" aria-label="Form configurations">
            {normalizedForms.map((entry) => (
              <div key={entry.id} role="listitem">
                <FormItem
                  entry={entry}
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
        )}
      </div>
    </div>
  );
}
