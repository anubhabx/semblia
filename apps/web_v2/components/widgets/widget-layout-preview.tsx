"use client";

/**
 * WidgetLayoutPreview — a clean, themed mini-mockup of the widget per layout
 * type (carousel / grid / masonry / list / wall). Not a live render: a static,
 * cheap miniature with real testimonial-card structure (avatar, star rating,
 * quote lines) tinted by the widget's accent + theme, so the gallery card reads
 * as a small version of the actual widget instead of a wire sketch.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import type { WidgetListEntry } from "@/lib/widgets/widget-types";

type Layout = WidgetListEntry["layout"];
type Theme = WidgetListEntry["theme"];

interface WidgetLayoutPreviewProps {
  layout: Layout;
  kind?: WidgetListEntry["kind"];
  accent?: string;
  theme?: Theme;
  inactive?: boolean;
  className?: string;
}

interface Palette {
  accent: string;
  page: string;
  surface: string;
  text: string;
  sub: string;
  line: string;
}

function palette(accent: string, dark: boolean): Palette {
  return dark
    ? {
        accent,
        page: "#0c0c0e",
        surface: "#161619",
        text: "#e7e7ea",
        sub: "#8b8b93",
        line: "#2a2a30",
      }
    : {
        accent,
        page: "#f4f4f5",
        surface: "#ffffff",
        text: "#1f1f23",
        sub: "#9a9aa3",
        line: "#ececef",
      };
}

const STAR_PATH =
  "M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.8 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z";

function Stars({ color, size = 4 }: { color: string; size?: number }) {
  return (
    <div className="flex gap-[1px]" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={color}
        >
          <path d={STAR_PATH} />
        </svg>
      ))}
    </div>
  );
}

function Lines({ p, widths }: { p: Palette; widths: Array<number | string> }) {
  return (
    <div className="mt-1 space-y-[2px]" aria-hidden>
      {widths.map((w, i) => (
        <div
          key={i}
          className="h-[2px] rounded-full opacity-40"
          style={{
            background: p.sub,
            width: typeof w === "number" ? `${w}%` : w,
          }}
        />
      ))}
    </div>
  );
}

function MiniCard({
  p,
  lines = [100, 78],
  pad = "p-1.5",
  stars = true,
}: {
  p: Palette;
  lines?: number[];
  pad?: string;
  stars?: boolean;
}) {
  return (
    <div
      className={cn("rounded-[3px] border", pad)}
      style={{ background: p.surface, borderColor: p.line }}
    >
      <div className="mb-1 flex items-center gap-1">
        <span
          className="size-2.5 shrink-0 rounded-full"
          style={{ background: p.accent, opacity: 0.55 }}
          aria-hidden
        />
        <span
          className="h-[2px] w-5 rounded-full"
          style={{ background: p.text, opacity: 0.55 }}
          aria-hidden
        />
      </div>
      {stars && <Stars color={p.accent} />}
      <Lines p={p} widths={lines} />
    </div>
  );
}

/* ─── Per-layout miniatures ───────────────────────────────────────────────── */

function Carousel({ p }: { p: Palette }) {
  return (
    <div
      className="flex h-full w-full flex-col justify-center gap-1.5 px-3"
      style={{ background: p.page }}
    >
      <div className="flex gap-1.5">
        <div className="w-[44%] shrink-0">
          <MiniCard p={p} lines={[100, 85, 60]} />
        </div>
        <div className="w-[44%] shrink-0">
          <MiniCard p={p} lines={[100, 70]} />
        </div>
        <div className="w-[44%] shrink-0">
          <MiniCard p={p} lines={[100, 80]} />
        </div>
      </div>
      <div className="flex justify-center gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-[3px] rounded-full"
            style={{
              background: i === 0 ? p.accent : p.sub,
              opacity: i === 0 ? 0.9 : 0.35,
            }}
            aria-hidden
          />
        ))}
      </div>
    </div>
  );
}

function Grid({ p }: { p: Palette }) {
  return (
    <div
      className="grid h-full w-full grid-cols-3 content-center gap-1.5 p-3"
      style={{ background: p.page }}
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <MiniCard key={i} p={p} lines={[100, 70]} pad="p-1" />
      ))}
    </div>
  );
}

function Masonry({ p }: { p: Palette }) {
  return (
    <div
      className="grid h-full w-full grid-cols-2 content-center gap-1.5 p-3"
      style={{ background: p.page }}
    >
      <div className="space-y-1.5">
        <MiniCard p={p} lines={[100, 85, 60]} />
        <MiniCard p={p} lines={[100]} stars={false} />
      </div>
      <div className="space-y-1.5">
        <MiniCard p={p} lines={[100, 70]} />
        <MiniCard p={p} lines={[100, 85, 70]} />
      </div>
    </div>
  );
}

function ListLayout({ p }: { p: Palette }) {
  return (
    <div
      className="flex h-full w-full flex-col justify-center gap-1.5 px-4"
      style={{ background: p.page }}
    >
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-1.5 rounded-[3px] border p-1.5"
          style={{ background: p.surface, borderColor: p.line }}
        >
          <span
            className="size-3 shrink-0 rounded-full"
            style={{ background: p.accent, opacity: 0.55 }}
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <Stars color={p.accent} />
            <Lines p={p} widths={[88, 60]} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Wall({ p }: { p: Palette }) {
  return (
    <div className="flex h-full w-full flex-col" style={{ background: p.page }}>
      <div className="flex flex-col items-center gap-0.5 pt-2.5">
        <div
          className="h-[3px] w-16 rounded-full"
          style={{ background: p.text, opacity: 0.7 }}
          aria-hidden
        />
        <div
          className="h-[2px] w-10 rounded-full"
          style={{ background: p.sub, opacity: 0.5 }}
          aria-hidden
        />
      </div>
      <div className="grid flex-1 grid-cols-4 content-center gap-1 px-2.5">
        {Array.from({ length: 8 }).map((_, i) => (
          <MiniCard key={i} p={p} lines={[100]} pad="p-1" stars={i % 2 === 0} />
        ))}
      </div>
    </div>
  );
}

const LAYOUTS: Record<Layout, (args: { p: Palette }) => React.ReactElement> = {
  carousel: Carousel,
  grid: Grid,
  masonry: Masonry,
  list: ListLayout,
  wall: Wall,
};

export const WidgetLayoutPreview = React.memo(function WidgetLayoutPreview({
  layout,
  accent = "#6366f1",
  theme = "light",
  inactive = false,
  className,
}: WidgetLayoutPreviewProps) {
  const p = palette(accent, theme === "dark");
  const Preview = LAYOUTS[layout] ?? Grid;

  return (
    <div
      className={cn(
        "h-full w-full overflow-hidden transition-opacity",
        inactive && "opacity-50 grayscale",
        className,
      )}
      role="img"
      aria-label={`${layout} widget layout preview`}
    >
      <Preview p={p} />
    </div>
  );
});
