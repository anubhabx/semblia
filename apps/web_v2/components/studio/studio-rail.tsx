"use client";

/**
 * StudioRail — the vertical section navigator shared by every Semblia Studio.
 *
 * One instrument, one nav. This replaces the Form Studio's horizontal tab strip
 * AND the Widget Studio's horizontal section nav with a single editor-grade rail
 * (the Linear/Framer pattern): a slim left column of icon-over-label sections,
 * keyboard-navigable (roving tabindex + Up/Down arrows), with the brand accent
 * marking the active section — colour *and* shape, never colour alone.
 *
 * Desktop only. On mobile the shell drives section state from a bottom tab bar.
 */

import * as React from "react";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export interface StudioSection<Id extends string = string> {
  id: Id;
  label: string;
  icon: PhosphorIcon;
}

export function StudioRail<Id extends string>({
  sections,
  active,
  onChange,
  ariaLabel = "Studio sections",
}: {
  sections: ReadonlyArray<StudioSection<Id>>;
  active: Id;
  onChange: (id: Id) => void;
  ariaLabel?: string;
}) {
  const tabRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

  const onKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const dir = e.key === "ArrowDown" ? 1 : -1;
    const next = (idx + dir + sections.length) % sections.length;
    onChange(sections[next].id);
    tabRefs.current[next]?.focus();
  };

  return (
    <nav
      role="tablist"
      aria-orientation="vertical"
      aria-label={ariaLabel}
      className="flex w-[72px] shrink-0 flex-col gap-1 border-r border-border bg-sidebar px-2 py-3"
    >
      {sections.map((s, idx) => {
        const Icon = s.icon;
        const on = active === s.id;
        return (
          <button
            key={s.id}
            ref={(el) => {
              tabRefs.current[idx] = el;
            }}
            type="button"
            role="tab"
            id={`studio-rail-${s.id}`}
            aria-selected={on}
            aria-controls="studio-inspector-panel"
            tabIndex={on ? 0 : -1}
            onClick={() => onChange(s.id)}
            onKeyDown={(e) => onKeyDown(e, idx)}
            className={cn(
              "group relative flex flex-col items-center gap-1.5 rounded-lg px-1 py-2.5",
              "text-[10.5px] font-medium transition-colors duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/55",
              on
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
            )}
          >
            {/* Active accent — brand bar on the leading edge (shape + colour). */}
            <span
              aria-hidden
              className={cn(
                "absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-brand transition-opacity duration-150",
                on ? "opacity-100" : "opacity-0",
              )}
            />
            <Icon
              className="size-[18px]"
              weight={on ? "fill" : "regular"}
              aria-hidden
            />
            <span className="leading-none">{s.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
