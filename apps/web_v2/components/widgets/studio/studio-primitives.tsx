"use client";

/**
 * Local primitives for the widget studio. Mostly thin re-exports of the
 * collect studio primitives — kept as a separate file so the widget studio
 * doesn't import from `components/collect/studio/*` directly (cleaner module
 * boundary and easier to diverge later).
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export {
  Row,
  StudioTextInput,
  StudioNumberInput,
  StudioColorInput,
  StudioSelect,
  Pills,
} from "@/components/widgets/studio/studio-input-primitives";

/**
 * Slim section header — used inside the widget controls accordion.
 *
 * Note: The collect studio uses `SectionCollapsible` from its own primitives.
 * We define a copy here so the markup is local to the widget studio.
 */
export function SectionCollapsible({
  title,
  children,
  defaultOpen = true,
  tag,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  tag?: string;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className="border-t border-border/60 px-5 py-4">
      <Button
        variant="ghost"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex h-auto w-full items-center justify-between p-0 text-[12.5px] font-semibold tracking-tight text-foreground hover:bg-transparent",
          "transition-[margin-bottom] duration-200",
          open ? "mb-3" : "mb-0",
        )}
      >
        <span className="flex items-center gap-2">
          {title}
          {tag && (
            <Badge
              variant="default"
              className="rounded-sm px-1.5 py-px font-mono text-[9px] font-semibold tracking-wider"
            >
              {tag}
            </Badge>
          )}
        </span>
        <span
          className={cn(
            "font-mono text-[10px] text-muted-foreground transition-transform duration-150",
            open && "rotate-90",
          )}
          aria-hidden
        >
          ▸
        </span>
      </Button>
      {open && <div>{children}</div>}
    </div>
  );
}

/**
 * Visual swatch button — used by card-style and other "show me" pickers.
 */
export function SwatchButton({
  selected,
  onClick,
  label,
  preview,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  preview: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "group flex flex-col items-stretch gap-1.5 rounded-lg border p-2 text-left",
        "transition-[border-color,background,transform] duration-150",
        selected
          ? "border-foreground bg-card"
          : "border-border bg-transparent hover:border-muted-foreground/40 hover:bg-card",
        "active:scale-[0.97]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
      )}
    >
      <div className="aspect-[5/3] w-full overflow-hidden rounded bg-muted/40">
        {preview}
      </div>
      <span className="text-center text-[11px] font-medium text-foreground">
        {label}
      </span>
    </button>
  );
}
