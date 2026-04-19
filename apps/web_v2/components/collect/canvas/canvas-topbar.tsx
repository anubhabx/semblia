"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft as ArrowLeftIcon, FloppyDisk as SaveIcon, SidebarSimple as PanelRightIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { DeviceSizeToggle } from "./device-size-toggle";
import type { DeviceSize } from "@/components/collect/device-frame";
import { cn } from "@/lib/utils";

export function CanvasTopbar({
  slug,
  projectName,
  device,
  onDeviceChange,
  inspectorOpen,
  onToggleInspector,
  dirty,
  onSave,
}: {
  slug: string;
  projectName: string;
  device: DeviceSize;
  onDeviceChange: (v: DeviceSize) => void;
  inspectorOpen: boolean;
  onToggleInspector: () => void;
  dirty: boolean;
  onSave: () => void;
}) {
  return (
    <header className="flex shrink-0 items-center justify-between border-b border-border bg-background/90 px-4 py-2 backdrop-blur">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/projects/${slug}/collect`}>
            <ArrowLeftIcon />
            Editor
          </Link>
        </Button>
        <div className="hidden h-5 w-px bg-border sm:block" />
        <div className="hidden sm:block">
          <p className="text-xs font-semibold text-foreground">
            {projectName}
          </p>
          <p className="text-[10px] text-muted-foreground">Canvas preview</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <DeviceSizeToggle value={device} onChange={onDeviceChange} />
      </div>

      <div className="flex items-center gap-1.5">
        <span
          data-testid="canvas-dirty-badge"
          data-dirty={dirty ? "true" : "false"}
          className={cn(
            "hidden text-[10px] sm:inline",
            dirty ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"
          )}
        >
          {dirty ? "Unsaved" : "Saved"}
        </span>
        <Button
          variant="default"
          size="sm"
          onClick={onSave}
          disabled={!dirty}
          data-testid="btn-canvas-save"
        >
          <SaveIcon />
          Save
        </Button>
        <Button
          variant={inspectorOpen ? "secondary" : "outline"}
          size="sm"
          onClick={onToggleInspector}
          data-testid="btn-toggle-inspector"
          aria-pressed={inspectorOpen}
        >
          <PanelRightIcon />
          Inspector
        </Button>
      </div>
    </header>
  );
}
