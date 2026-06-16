"use client";

/**
 * FormCardPreview — a clean, brand-themed mini-mockup of the form, keyed off its
 * v4 layout preset. Not a live render (that's expensive) and not a crude wire
 * sketch: a realistic miniature with brand color, a header, fields and a submit
 * button so the gallery card reads as a small version of the actual form.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import type { FormLayoutPreset } from "@/lib/collect/forms-list";

interface FormCardPreviewProps {
  preset?: FormLayoutPreset | null;
  brandColor?: string | null;
  appearance?: "light" | "dark";
  brandName?: string | null;
  inactive?: boolean;
  className?: string;
}

interface Palette {
  brand: string;
  page: string;
  surface: string;
  field: string;
  text: string;
  sub: string;
  line: string;
}

function palette(brandColor?: string | null, dark?: boolean): Palette {
  const brand = brandColor || "#4f46e5";
  return dark
    ? {
        brand,
        page: "#0b0b0d",
        surface: "#161619",
        field: "#1f1f23",
        text: "#e7e7ea",
        sub: "#8b8b93",
        line: "#2a2a30",
      }
    : {
        brand,
        page: "#f4f4f5",
        surface: "#ffffff",
        field: "#fafafa",
        text: "#1f1f23",
        sub: "#9a9aa3",
        line: "#e6e6ea",
      };
}

/* ─── Mini primitives ─────────────────────────────────────────────────────── */

function BrandRow({ p, name }: { p: Palette; name: string | null }) {
  return (
    <div className="mb-2 flex items-center gap-1">
      <span
        className="size-2 rounded-full"
        style={{ background: p.brand }}
        aria-hidden
      />
      <span
        className="text-[6px] font-semibold tracking-tight"
        style={{ color: p.text }}
      >
        {name || "Your brand"}
      </span>
    </div>
  );
}

function Title({ p, children }: { p: Palette; children: React.ReactNode }) {
  return (
    <div
      className="mb-2 text-[7.5px] font-semibold leading-tight tracking-tight"
      style={{ color: p.text }}
    >
      {children}
    </div>
  );
}

function Field({
  p,
  label = 7,
  full,
}: {
  p: Palette;
  label?: number;
  full?: boolean;
}) {
  return (
    <div className={cn("mb-1.5", full && "w-full")}>
      <div
        className="mb-1 h-[2px] rounded-full opacity-70"
        style={{ background: p.sub, width: label * 3 }}
        aria-hidden
      />
      <div
        className="h-2.5 rounded-[3px] border"
        style={{ background: p.field, borderColor: p.line }}
        aria-hidden
      />
    </div>
  );
}

function SubmitButton({ p, w = 46 }: { p: Palette; w?: number }) {
  return (
    <div
      className="mt-1.5 flex h-3 items-center justify-center rounded-[3px]"
      style={{ background: p.brand, width: w }}
      aria-hidden
    >
      <span className="h-[2px] w-4 rounded-full bg-white/85" />
    </div>
  );
}

/* ─── Per-preset miniatures ───────────────────────────────────────────────── */

function CardPreview({ p, name }: { p: Palette; name: string | null }) {
  return (
    <div
      className="flex h-full w-full items-center justify-center p-3"
      style={{ background: p.page }}
    >
      <div
        className="w-[72%] rounded-md border p-2.5"
        style={{
          background: p.surface,
          borderColor: p.line,
          boxShadow: "0 6px 16px -10px rgba(0,0,0,0.25)",
        }}
      >
        <BrandRow p={p} name={name} />
        <Title p={p}>How was your experience?</Title>
        <Field p={p} label={6} />
        <Field p={p} label={9} />
        <SubmitButton p={p} w={50} />
      </div>
    </div>
  );
}

function InlinePreview({ p, name }: { p: Palette; name: string | null }) {
  return (
    <div className="h-full w-full p-3.5" style={{ background: p.surface }}>
      <BrandRow p={p} name={name} />
      <Title p={p}>Share your feedback</Title>
      <Field p={p} label={6} full />
      <Field p={p} label={8} full />
      <Field p={p} label={5} full />
      <SubmitButton p={p} w={42} />
    </div>
  );
}

function SplitPreview({ p, name }: { p: Palette; name: string | null }) {
  return (
    <div className="flex h-full w-full">
      <div
        className="flex w-[40%] flex-col justify-center gap-1.5 p-2.5"
        style={{ background: p.brand }}
      >
        <span className="size-3 rounded-full bg-white/30" aria-hidden />
        <div className="h-[3px] w-10 rounded-full bg-white/55" aria-hidden />
        <div className="h-[2px] w-8 rounded-full bg-white/35" aria-hidden />
        <div className="h-[2px] w-9 rounded-full bg-white/35" aria-hidden />
      </div>
      <div className="flex-1 p-2.5" style={{ background: p.surface }}>
        <BrandRow p={p} name={name} />
        <Field p={p} label={6} full />
        <Field p={p} label={8} full />
        <SubmitButton p={p} w={40} />
      </div>
    </div>
  );
}

function ConversationalPreview({ p }: { p: Palette; name: string | null }) {
  return (
    <div
      className="flex h-full w-full flex-col justify-center px-5"
      style={{ background: p.surface }}
    >
      <div
        className="mb-1 text-[5px] font-semibold tracking-[0.2em]"
        style={{ color: p.brand }}
      >
        1 → 5
      </div>
      <div
        className="mb-2 text-[10px] font-semibold leading-tight tracking-tight"
        style={{ color: p.text }}
      >
        What did you think?
      </div>
      <div className="flex gap-1">
        {["Loved it", "Good", "Okay"].map((c) => (
          <span
            key={c}
            className="rounded-full border px-1.5 py-[2px] text-[5px] font-medium"
            style={{ borderColor: p.line, color: p.sub }}
          >
            {c}
          </span>
        ))}
      </div>
      <SubmitButton p={p} w={44} />
    </div>
  );
}

function LegacyPreview({ p }: { p: Palette }) {
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{ background: p.page }}
    >
      <div
        className="flex h-[64%] w-[70%] items-center justify-center rounded-md border border-dashed"
        style={{ borderColor: p.line }}
      >
        <div
          className="h-[3px] w-12 rounded-full opacity-50"
          style={{ background: p.sub }}
        />
      </div>
    </div>
  );
}

const PRESET_PREVIEW: Record<
  FormLayoutPreset,
  (args: { p: Palette; name: string | null }) => React.ReactElement
> = {
  card: CardPreview,
  inline: InlinePreview,
  split: SplitPreview,
  conversational: ConversationalPreview,
};

export function FormCardPreview({
  preset,
  brandColor,
  appearance = "light",
  brandName,
  inactive,
  className,
}: FormCardPreviewProps) {
  const p = palette(brandColor, appearance === "dark");
  const Preview = preset ? PRESET_PREVIEW[preset] : null;

  return (
    <div
      role="img"
      aria-label={preset ? `${preset} form layout preview` : "Form preview"}
      className={cn(
        "h-full w-full overflow-hidden transition-opacity",
        inactive && "opacity-50 grayscale",
        className,
      )}
    >
      {Preview ? (
        <Preview p={p} name={brandName ?? null} />
      ) : (
        <LegacyPreview p={p} />
      )}
    </div>
  );
}
