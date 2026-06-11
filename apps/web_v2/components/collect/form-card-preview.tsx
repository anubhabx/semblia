"use client";

/**
 * FormCardPreview — static SVG thumbnail keyed off the form's v4 layout
 * preset. The gallery stays fast and non-dynamic while each card still hints
 * at which hand-designed layout the form uses. Pre-v4 configs (preset null)
 * get a neutral placeholder until they are migrated.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import type { FormLayoutPreset } from "@/lib/collect/forms-list";

interface FormCardPreviewProps {
  preset?: FormLayoutPreset | null;
  inactive?: boolean;
  className?: string;
}

function Field({
  x,
  y,
  w,
  h = 9,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
}) {
  return (
    <>
      <rect
        x={x}
        y={y - 6}
        width={Math.max(28, w * 0.32)}
        height={3}
        rx={1.5}
        fill="var(--muted-foreground)"
        opacity="0.35"
      />
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={Math.min(4, h / 2)}
        fill="var(--background)"
        stroke="var(--border)"
        strokeWidth="0.8"
      />
    </>
  );
}

function ButtonBar({ x, y, w = 54 }: { x: number; y: number; w?: number }) {
  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={11}
      rx={5.5}
      fill="var(--primary)"
      opacity="0.88"
    />
  );
}

function CardPreview() {
  return (
    <>
      <rect
        x={50}
        y={12}
        width={100}
        height={101}
        rx={6}
        fill="var(--card)"
        stroke="var(--border)"
        strokeWidth="0.8"
      />
      <Field x={62} y={34} w={76} />
      <Field x={62} y={56} w={76} />
      <Field x={62} y={78} w={76} />
      <ButtonBar x={62} y={94} w={76} />
    </>
  );
}

function InlinePreview() {
  return (
    <>
      <Field x={40} y={32} w={120} />
      <Field x={40} y={56} w={120} />
      <Field x={40} y={80} w={120} />
      <ButtonBar x={40} y={98} w={64} />
    </>
  );
}

function SplitPreview() {
  return (
    <>
      <rect
        x={16}
        y={12}
        width={76}
        height={101}
        rx={6}
        fill="var(--primary)"
        opacity="0.22"
      />
      <circle cx={54} cy={48} r={10} fill="var(--primary)" opacity="0.5" />
      <rect
        x={36}
        y={68}
        width={36}
        height={4}
        rx={2}
        fill="var(--primary)"
        opacity="0.45"
      />
      <Field x={108} y={34} w={70} />
      <Field x={108} y={58} w={70} />
      <ButtonBar x={108} y={78} w={70} />
    </>
  );
}

function ConversationalPreview() {
  return (
    <>
      <rect
        x={44}
        y={28}
        width={56}
        height={5}
        rx={2.5}
        fill="var(--muted-foreground)"
        opacity="0.4"
      />
      <Field x={44} y={52} w={112} h={14} />
      <ButtonBar x={44} y={84} w={48} />
      <rect
        x={44}
        y={104}
        width={32}
        height={3}
        rx={1.5}
        fill="var(--muted-foreground)"
        opacity="0.25"
      />
    </>
  );
}

function LegacyPreview() {
  return (
    <>
      <rect
        x={50}
        y={12}
        width={100}
        height={101}
        rx={6}
        fill="none"
        stroke="var(--border)"
        strokeWidth="1"
        strokeDasharray="4 4"
      />
      <rect
        x={70}
        y={56}
        width={60}
        height={5}
        rx={2.5}
        fill="var(--muted-foreground)"
        opacity="0.3"
      />
    </>
  );
}

const PRESET_PREVIEW: Record<FormLayoutPreset, () => React.ReactElement> = {
  card: CardPreview,
  inline: InlinePreview,
  split: SplitPreview,
  conversational: ConversationalPreview,
};

export function FormCardPreview({
  preset,
  inactive,
  className,
}: FormCardPreviewProps) {
  const Preview = preset ? PRESET_PREVIEW[preset] : LegacyPreview;
  return (
    <svg
      viewBox="0 0 200 125"
      role="img"
      aria-label={
        preset ? `${preset} layout preview` : "Legacy form layout preview"
      }
      className={cn(
        "h-full w-full bg-muted/40 transition-opacity",
        inactive && "opacity-50 grayscale",
        className,
      )}
      preserveAspectRatio="xMidYMid slice"
    >
      <Preview />
    </svg>
  );
}
