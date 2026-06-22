"use client";

/**
 * FormRow — a single form in the list. Forms have no visual thumbnail yet
 * (static previews land in a later phase), so the row leads with the intent
 * glyph and reads name → intent/slug → publish state → status, with the usual
 * shared action row (Edit, Copy link, Open/Close, Delete).
 */

import * as React from "react";
import { toast } from "sonner";
import {
  PencilSimpleIcon,
  LinkSimpleIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/format";
import type { V2FormSummaryDTO } from "@workspace/types";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { InlineName } from "@/components/studio/inline-name";
import { ItemRow, ItemActionRow, type ItemAction } from "@/components/shared";
import { intentMeta } from "@/lib/forms/intents";
import { FormStatusBadge } from "./form-status-badge";

const HOSTED_BASE = "forms.semblia.com/f";

interface FormRowProps {
  slug: string;
  form: V2FormSummaryDTO;
  onDelete: () => void;
  onToggleOpen: () => void;
  onRename: (next: string) => void;
}

export const FormRow = React.memo(function FormRow({
  slug,
  form,
  onDelete,
  onToggleOpen,
  onRename,
}: FormRowProps) {
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const meta = intentMeta(form.intent);
  const Icon = meta.icon;
  const isPublished =
    form.status === "PUBLISHED" && form.currentVersion != null;
  const hostedUrl = form.slug ? `${HOSTED_BASE}/${form.slug}` : null;
  const editHref = `/projects/${slug}/forms/${form.id}`;
  const inactive = form.status === "ARCHIVED" || !form.open;

  const handleCopyLink = React.useCallback(async () => {
    if (!hostedUrl) {
      toast.info("Publish this form to get a shareable link.");
      return;
    }
    try {
      await navigator.clipboard.writeText(`https://${hostedUrl}`);
      toast.success("Form link copied");
    } catch {
      toast.error("Couldn't copy. Try again.");
    }
  }, [hostedUrl]);

  const actions: ItemAction[] = [
    {
      id: "edit",
      label: "Edit",
      icon: PencilSimpleIcon,
      href: editHref,
      pinned: true,
    },
    {
      id: "link",
      label: "Copy link",
      icon: LinkSimpleIcon,
      onSelect: handleCopyLink,
      pinned: true,
    },
    {
      id: "toggle",
      label: form.open ? "Close" : "Open",
      icon: form.open ? EyeSlashIcon : EyeIcon,
      tone: form.open ? "warning" : "success",
      onSelect: onToggleOpen,
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

  return (
    <>
      <ItemRow
        inactive={inactive}
        aria-label={`${form.name} (${meta.label})`}
        padding="default"
        leading={
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg",
              meta.accent,
              inactive && "opacity-60",
            )}
          >
            <Icon className="size-4.5" weight="bold" aria-hidden />
          </span>
        }
        title={
          <InlineName
            value={form.name}
            muted={inactive}
            dirty={false}
            onCommit={onRename}
          />
        }
        subtitle={
          <div className="mt-0.5 flex flex-wrap items-baseline gap-1.5">
            <span className="font-mono text-[10px] text-muted-foreground">
              {meta.label}
            </span>
            {form.slug && (
              <>
                <span className="text-border">·</span>
                <span className="truncate font-mono text-[10px] text-muted-foreground/80">
                  /f/{form.slug}
                </span>
              </>
            )}
          </div>
        }
        metrics={
          <div className="flex items-baseline gap-1 font-mono text-[11px] tabular-nums tracking-tight text-muted-foreground/80">
            {isPublished ? (
              <>
                <span className="font-semibold text-foreground">
                  v{form.currentVersion}
                </span>
                <span>published</span>
              </>
            ) : (
              <span>Not published yet</span>
            )}
          </div>
        }
        trailing={
          <div className="flex items-baseline gap-2">
            <FormStatusBadge status={form.status} open={form.open} />
            <span className="hidden text-xs tabular-nums text-muted-foreground sm:block">
              {timeAgo(new Date(form.updatedAt))}
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
        title={<>Delete &ldquo;{form.name}&rdquo;?</>}
        description={
          <>
            This permanently removes the form and its draft. Published versions
            stop accepting responses. This action cannot be undone.
          </>
        }
        cancelLabel="Keep form"
        confirmLabel="Delete form"
        onConfirm={onDelete}
      />
    </>
  );
});
