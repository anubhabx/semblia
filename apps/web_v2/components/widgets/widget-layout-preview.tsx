"use client";

/**
 * WidgetLayoutPreview — static SVG thumbnail per widget layout type.
 *
 * Replaces the live WidgetCardMiniPreview in the gallery cards with
 * fast, zero-dependency, theme-adaptive illustrations. Each layout
 * (grid, carousel, masonry, list, wall) gets a distinct geometric
 * representation that communicates the layout pattern at a glance.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import type { WidgetListEntry } from "@/lib/widgets/widget-types";

type Layout = WidgetListEntry["layout"];
type Kind = WidgetListEntry["kind"];

interface WidgetLayoutPreviewProps {
  layout: Layout;
  kind?: Kind;
  inactive?: boolean;
  className?: string;
}

/* ─── Card primitive helpers ─────────────────────────────────────── */

function Card({
  x,
  y,
  w,
  h,
  r = 3,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  r?: number;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={r}
        fill="var(--card)"
        stroke="var(--border)"
        strokeWidth="0.75"
      />
      {/* Avatar placeholder */}
      <circle
        cx={x + 8}
        cy={y + 8}
        r={4}
        fill="var(--muted-foreground)"
        opacity="0.25"
      />
      {/* Text lines */}
      <rect
        x={x + 15}
        y={y + 4.5}
        width={w - 20}
        height={3}
        rx={1.5}
        fill="var(--foreground)"
        opacity="0.45"
      />
      <rect
        x={x + 15}
        y={y + 10}
        width={(w - 20) * 0.65}
        height={2.5}
        rx={1.25}
        fill="var(--muted-foreground)"
        opacity="0.28"
      />
    </g>
  );
}

function Row({ x, y, w }: { x: number; y: number; w: number }) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={12}
        rx={2}
        fill="var(--card)"
        stroke="var(--border)"
        strokeWidth="0.6"
      />
      <circle
        cx={x + 6}
        cy={y + 6}
        r={3.5}
        fill="var(--muted-foreground)"
        opacity="0.22"
      />
      <rect
        x={x + 13}
        y={y + 3.5}
        width={w * 0.38}
        height={2.5}
        rx={1.25}
        fill="var(--foreground)"
        opacity="0.5"
      />
      <rect
        x={x + 13}
        y={y + 8}
        width={w * 0.25}
        height={2}
        rx={1}
        fill="var(--muted-foreground)"
        opacity="0.25"
      />
    </g>
  );
}

/* ─── Layout illustrations ───────────────────────────────────────── */

function GridPreview() {
  const cols = 3;
  const rows = 2;
  const cw = 44;
  const ch = 38;
  const gap = 5;
  const ox = (160 - cols * cw - (cols - 1) * gap) / 2;
  const oy = (100 - rows * ch - (rows - 1) * gap) / 2;

  return (
    <>
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: cols }).map((_, c) => (
          <Card
            key={`${r}-${c}`}
            x={ox + c * (cw + gap)}
            y={oy + r * (ch + gap)}
            w={cw}
            h={ch}
          />
        )),
      )}
    </>
  );
}

function CarouselPreview() {
  const cards = [
    { x: 4, w: 56, h: 72 },
    { x: 64, w: 56, h: 72 },
    { x: 124, w: 56, h: 72 },
  ];
  const oy = (100 - 72) / 2;

  return (
    <>
      {cards.map((c, i) => (
        <Card key={i} x={c.x} y={oy} w={c.w} h={c.h} r={4} />
      ))}
      {/* Nav dots */}
      {[0, 1, 2].map((i) => (
        <circle
          key={i}
          cx={72 + i * 8}
          cy={94}
          r={2}
          fill="var(--muted-foreground)"
          opacity={i === 1 ? 0.55 : 0.22}
        />
      ))}
    </>
  );
}

function MasonryPreview() {
  // Two columns, staggered heights
  const col1 = [
    { y: 4, h: 30 },
    { y: 38, h: 40 },
    { y: 82, h: 14 },
  ];
  const col2 = [
    { y: 4, h: 44 },
    { y: 52, h: 24 },
    { y: 80, h: 16 },
  ];
  const cw = 70;
  const gap = 6;
  const ox = (160 - 2 * cw - gap) / 2;

  return (
    <>
      {col1.map((item, i) => (
        <Card key={`l${i}`} x={ox} y={item.y} w={cw} h={item.h} r={3} />
      ))}
      {col2.map((item, i) => (
        <Card
          key={`r${i}`}
          x={ox + cw + gap}
          y={item.y}
          w={cw}
          h={item.h}
          r={3}
        />
      ))}
    </>
  );
}

function ListPreview() {
  const rows = [10, 26, 42, 58];
  const w = 148;
  const ox = (160 - w) / 2;

  return (
    <>
      {rows.map((y, i) => (
        <Row key={i} x={ox} y={y} w={w} />
      ))}
    </>
  );
}

function WallPreview() {
  // 4×3 dense tile grid
  const cols = 4;
  const rows = 3;
  const cw = 34;
  const ch = 28;
  const gap = 4;
  const ox = (160 - cols * cw - (cols - 1) * gap) / 2;
  const oy = (100 - rows * ch - (rows - 1) * gap) / 2;

  return (
    <>
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: cols }).map((_, c) => (
          <g key={`${r}-${c}`}>
            <rect
              x={ox + c * (cw + gap)}
              y={oy + r * (ch + gap)}
              width={cw}
              height={ch}
              rx={3}
              fill="var(--card)"
              stroke="var(--border)"
              strokeWidth="0.6"
            />
            <circle
              cx={ox + c * (cw + gap) + cw / 2}
              cy={oy + r * (ch + gap) + 10}
              r={4.5}
              fill="var(--muted-foreground)"
              opacity="0.2"
            />
            <rect
              x={ox + c * (cw + gap) + 5}
              y={oy + r * (ch + gap) + 17}
              width={cw - 10}
              height={2.5}
              rx={1.25}
              fill="var(--muted-foreground)"
              opacity="0.28"
            />
          </g>
        )),
      )}
    </>
  );
}

const LAYOUT_PREVIEWS: Record<Layout, React.FC> = {
  grid: GridPreview,
  carousel: CarouselPreview,
  masonry: MasonryPreview,
  list: ListPreview,
  wall: WallPreview,
};

/* ─── Export ─────────────────────────────────────────────────────── */

export const WidgetLayoutPreview = React.memo(function WidgetLayoutPreview({
  layout,
  inactive = false,
  className,
}: WidgetLayoutPreviewProps) {
  const Preview = LAYOUT_PREVIEWS[layout] ?? GridPreview;

  return (
    <div
      className={cn(
        "h-full w-full overflow-hidden bg-muted/30",
        inactive && "opacity-50",
        className,
      )}
      aria-hidden
    >
      <svg
        viewBox="0 0 160 100"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <Preview />
      </svg>
    </div>
  );
});
