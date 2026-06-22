"use client";

import * as React from "react";
import {
  ArrowLeftIcon,
  ArrowSquareOutIcon,
  CloudCheckIcon,
  CloudArrowUpIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InlineName } from "@/components/studio/inline-name";
import { StudioHelp } from "@/components/studio/studio-help";
import type { StatusMeta } from "@/lib/forms/intents";

interface FormStudioTopbarProps {
  name: string;
  onRename: (next: string) => void;
  status: StatusMeta;
  dirty: boolean;
  saving: boolean;
  publishing: boolean;
  hostedUrl: string | null;
  onClose: () => void;
  onSave: () => void;
  onPublish: () => void;
  hasPublished: boolean;
}

export function FormStudioTopbar({
  name,
  onRename,
  status,
  dirty,
  saving,
  publishing,
  hostedUrl,
  onClose,
  onSave,
  onPublish,
  hasPublished,
}: FormStudioTopbarProps) {
  return (
    <header className="flex h-13 shrink-0 items-center gap-3 border-b border-border bg-background px-3 py-2.5">
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 text-xs text-muted-foreground"
        onClick={onClose}
      >
        <ArrowLeftIcon className="size-3.5" weight="bold" aria-hidden />
        Forms
      </Button>

      <div className="flex min-w-0 flex-1 items-center gap-2">
        <div className="min-w-0 max-w-xs">
          <InlineName
            value={name}
            muted={false}
            dirty={false}
            onCommit={onRename}
          />
        </div>
        <Badge
          variant="outline"
          className={cn(
            "shrink-0 text-[10px] font-medium",
            status.tone === "live" &&
              "border-transparent bg-success/10 text-success",
            status.tone === "closed" &&
              "border-warning/30 bg-warning/5 text-warning",
            (status.tone === "draft" || status.tone === "archived") &&
              "text-muted-foreground",
          )}
        >
          {status.label}
        </Badge>
        <SaveState dirty={dirty} saving={saving} />
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <StudioHelp
          shortcuts={[
            { keys: ["⌘", "S"], label: "Save draft" },
            { keys: ["←", "→"], label: "Switch section" },
          ]}
          tip="Edits autosave as you type — the preview updates live."
        />
        {hostedUrl && (
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs text-muted-foreground"
          >
            <a href={`https://${hostedUrl}`} target="_blank" rel="noreferrer">
              <ArrowSquareOutIcon className="size-3.5" aria-hidden />
              View
            </a>
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={onSave}
          disabled={!dirty || saving}
        >
          {saving ? "Saving…" : "Save draft"}
        </Button>
        <Button
          size="sm"
          className="gap-1.5 text-xs"
          onClick={onPublish}
          disabled={publishing}
        >
          <CloudArrowUpIcon className="size-3.5" weight="bold" aria-hidden />
          {publishing ? "Publishing…" : hasPublished ? "Republish" : "Publish"}
        </Button>
      </div>
    </header>
  );
}

function SaveState({ dirty, saving }: { dirty: boolean; saving: boolean }) {
  if (saving) {
    return (
      <span className="hidden items-center gap-1 text-[11px] text-muted-foreground sm:flex">
        <CloudArrowUpIcon className="size-3 animate-pulse" aria-hidden />
        Saving…
      </span>
    );
  }
  if (dirty) {
    return (
      <span className="hidden items-center gap-1 text-[11px] text-muted-foreground sm:flex">
        Unsaved changes
      </span>
    );
  }
  return (
    <span className="hidden items-center gap-1 text-[11px] text-muted-foreground/70 sm:flex">
      <CloudCheckIcon className="size-3" aria-hidden />
      Saved
    </span>
  );
}
