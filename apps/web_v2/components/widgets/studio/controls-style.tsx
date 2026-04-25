"use client";

/**
 * Style preset section — six preset cards.
 * Each card shows a small token swatch (bg + surface + ink + accent) plus
 * the preset's label and pitch. Clicking applies the entire token bundle.
 *
 * Also includes the Remix / Reset row.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  STYLE_PRESET_LIST,
  type StylePreset,
} from "@/lib/widgets/widget-presets";
import { useWidgetStudioStore } from "@/lib/widgets/widget-studio-store";
import { SectionCollapsible } from "./studio-primitives";

const PresetCard = React.memo(function PresetCard({
  preset,
  selected,
  onClick,
}: {
  preset: StylePreset;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "relative flex flex-col items-stretch gap-1.5 rounded-lg border p-2.5 text-left",
        "transition-[border-color,background,transform] duration-150",
        selected
          ? "border-foreground bg-card"
          : "border-border bg-transparent hover:border-muted-foreground/40 hover:bg-card",
        "active:scale-[0.97]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
      )}
    >
      <div className="flex gap-1">
        <span
          className="size-4 rounded-sm border border-foreground/8"
          style={{ background: preset.tokens.bg }}
        />
        <span
          className="size-4 rounded-sm border border-foreground/8"
          style={{ background: preset.tokens.surface }}
        />
        <span
          className="size-4 rounded-sm"
          style={{ background: preset.tokens.text }}
        />
        <span
          className="size-4 rounded-sm"
          style={{ background: preset.tokens.accent }}
        />
      </div>
      <div>
        <div className="text-[12px] font-semibold text-foreground tracking-tight">
          {preset.label}
        </div>
        <div className="mt-0.5 text-[10.5px] leading-snug text-muted-foreground">
          {preset.sub}
        </div>
      </div>
    </button>
  );
});

export function StyleSection({ widgetId }: { widgetId: string }) {
  const draft = useWidgetStudioStore((s) => s.snapshots[widgetId]?.draft);
  const applyStylePreset = useWidgetStudioStore((s) => s.applyStylePreset);
  const randomize = useWidgetStudioStore((s) => s.randomize);

  if (!draft) return null;

  return (
    <SectionCollapsible title="Style preset">
      <div className="grid grid-cols-2 gap-1.5">
        {STYLE_PRESET_LIST.map((p) => (
          <PresetCard
            key={p.id}
            preset={p}
            selected={draft.tokens.preset === p.id}
            onClick={() => applyStylePreset(widgetId, p.id)}
          />
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <Button
          variant="outline"
          size="xs"
          className="flex-1 gap-1 text-[11.5px] font-semibold"
          onClick={() => randomize(widgetId)}
        >
          ↻ Remix
        </Button>
      </div>
    </SectionCollapsible>
  );
}
