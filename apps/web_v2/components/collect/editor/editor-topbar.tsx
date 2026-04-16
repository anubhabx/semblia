"use client";

import * as React from "react";
import { ExternalLinkIcon, RotateCcwIcon, SaveIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function formatRelative(ts: number, now: number): string {
  const delta = Math.max(0, Math.floor((now - ts) / 1000));
  if (delta < 5) return "just now";
  if (delta < 60) return `${delta}s ago`;
  const m = Math.floor(delta / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function EditorTopbar({
  projectName,
  savedAt,
  dirty,
  onSave,
  onReset,
  onOpenPreview,
}: {
  projectName: string;
  savedAt: number;
  dirty: boolean;
  onSave: () => void;
  onReset: () => void;
  onOpenPreview: () => void;
}) {
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 15_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <header className="flex shrink-0 items-center justify-between border-b border-border bg-background px-5 py-3">
      <div>
        <h1 className="text-sm font-semibold tracking-tight text-foreground">
          Collect · {projectName}
        </h1>
        <p
          data-testid="saved-indicator"
          data-dirty={dirty ? "true" : "false"}
          className={cn(
            "mt-0.5 text-[10px]",
            dirty ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"
          )}
        >
          {dirty ? "Unsaved changes" : `Saved ${formatRelative(savedAt, now)}`}
        </p>
      </div>
      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          disabled={!dirty}
          data-testid="btn-reset"
        >
          <RotateCcwIcon />
          Reset
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenPreview}
          data-testid="btn-open-preview"
        >
          <ExternalLinkIcon />
          Open canvas
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={onSave}
          disabled={!dirty}
          data-testid="btn-save"
        >
          <SaveIcon />
          Save
        </Button>
      </div>
    </header>
  );
}
