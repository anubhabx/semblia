"use client";

/**
 * Color section — accent picker. Just one dial that matters most.
 * Changing accent does NOT switch theme; it only updates `tokens.accent`.
 */

import * as React from "react";
import { useWidgetStudioStore } from "@/lib/widgets/widget-studio-store";
import { SectionCollapsible, StudioColorInput } from "./studio-primitives";

const QUICK_PALETTE = [
  "#0f172a",
  "#1d4ed8",
  "#10b981",
  "#f59e0b",
  "#f43f5e",
  "#a855f7",
  "#ea580c",
  "#0ea5e9",
];

export function ColorSection({ widgetId }: { widgetId: string }) {
  const draft = useWidgetStudioStore((s) => s.snapshots[widgetId]?.draft);
  const setToken = useWidgetStudioStore((s) => s.setToken);
  if (!draft) return null;

  return (
    <SectionCollapsible title="Color">
      <StudioColorInput
        label="Accent"
        value={draft.tokens.accent}
        onChange={(v) => setToken(widgetId, "accent", v)}
      />

      <div className="mb-3.5">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Quick palette
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_PALETTE.map((c) => {
            const selected =
              draft.tokens.accent.toLowerCase() === c.toLowerCase();
            return (
              <button
                key={c}
                type="button"
                onClick={() => setToken(widgetId, "accent", c)}
                aria-pressed={selected}
                aria-label={`Set accent to ${c}`}
                className="size-7 rounded-full border border-foreground/10 transition-[transform,box-shadow] duration-150 hover:scale-105 active:scale-95"
                style={{
                  background: c,
                  outline: selected ? "2px solid var(--foreground)" : undefined,
                  outlineOffset: 2,
                }}
              />
            );
          })}
        </div>
      </div>
    </SectionCollapsible>
  );
}
