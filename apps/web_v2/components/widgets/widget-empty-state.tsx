"use client";

/**
 * WidgetEmptyState — first-run state when a project has zero widgets.
 *
 * Two side-by-side option cards: Wall of Love (hosted page) vs Embed widget
 * (drop-in script). Each card is itself a CTA — no separate "Get started"
 * button — because the meaningful decision is which kind to make.
 */

import * as React from "react";
import {
  Globe as GlobeIcon,
  Code as CodeIcon,
  ArrowRight as ArrowRightIcon,
  type Icon as PhosphorIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface WidgetEmptyStateProps {
  onPick: (kind: "embed" | "wall") => void;
}

interface KindCardProps {
  kind: "embed" | "wall";
  title: string;
  pitch: string;
  bullets: string[];
  onPick: (kind: "embed" | "wall") => void;
  Icon: PhosphorIcon;
  accentClass: string;
}

function KindCard({
  kind,
  title,
  pitch,
  bullets,
  onPick,
  Icon,
  accentClass,
}: KindCardProps) {
  return (
    <button
      type="button"
      onClick={() => onPick(kind)}
      className={cn(
        "group relative flex flex-col items-stretch gap-4 rounded-2xl border p-6 text-left",
        "border-border bg-card transition-[border-color,transform,box-shadow] duration-200 ease-out",
        "hover:-translate-y-px hover:border-foreground/20 hover:shadow-[0_8px_28px_-12px_rgba(0,0,0,0.12)]",
        "active:translate-y-0 active:shadow-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "flex size-9 items-center justify-center rounded-lg",
            accentClass,
          )}
        >
          <Icon className="size-4" weight="bold" />
        </span>
        <ArrowRightIcon
          className={cn(
            "size-3.5 text-muted-foreground/50 transition-all duration-200",
            "group-hover:translate-x-0.5 group-hover:text-foreground",
          )}
          weight="bold"
        />
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        <p className="text-xs leading-relaxed text-muted-foreground">{pitch}</p>
      </div>

      <ul className="mt-auto space-y-1.5 text-[11px] text-muted-foreground/85">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-1.5">
            <span
              className="mt-1.5 size-[3px] shrink-0 rounded-full bg-foreground/40"
              aria-hidden
            />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </button>
  );
}

export function WidgetEmptyState({ onPick }: WidgetEmptyStateProps) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-14">
      <div className="mb-7 space-y-1.5 text-center">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          New widget
        </p>
        <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-[22px]">
          Showcase your social proof.
        </h2>
        <p className="mx-auto max-w-md text-xs leading-relaxed text-muted-foreground">
          Two flavors. Pick one to start. Both pull from the testimonials
          already approved on this project.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <KindCard
          kind="wall"
          title="Wall of Love"
          pitch="A standalone page hosted at tresta.io/wall/your-slug. No code, just a link to share."
          bullets={[
            "Public URL, indexable by search engines",
            "Hero title + subhead you control",
            "Full-page layout, mobile-friendly",
          ]}
          onPick={onPick}
          Icon={GlobeIcon}
          accentClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
        <KindCard
          kind="embed"
          title="Embed widget"
          pitch="Paste a single <script> on your site. Lives inside your page like it was always there."
          bullets={[
            "Carousel, grid, masonry, list, or wall layout",
            "Works in any framework (or vanilla HTML)",
            "Auto-updates when you tweak the design",
          ]}
          onPick={onPick}
          Icon={CodeIcon}
          accentClass="bg-foreground/10 text-foreground"
        />
      </div>

      <p className="mt-5 text-center text-[11px] text-muted-foreground/70">
        You can have as many widgets as you want. Both kinds live in the same
        project.
      </p>
    </div>
  );
}
