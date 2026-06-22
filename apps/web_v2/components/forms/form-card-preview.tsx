"use client";

/**
 * FormCardPreview — a clean, themed mini-mockup of a form per intent
 * (testimonial / review / product feedback / customer story / custom). Not a
 * live render: a static, cheap miniature with real form structure (title,
 * the intent's signature field, a submit button) tinted by the intent accent,
 * so the gallery card reads as a small version of the actual hosted form
 * instead of a generic placeholder.
 *
 * Forms are previewed in their own light surface (most hosted forms are light),
 * independent of the app theme — the same convention the widget previews use.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import type { V2FormIntent } from "@workspace/types";

const ACCENT: Record<V2FormIntent, string> = {
  TESTIMONIAL: "#f59e0b",
  REVIEW: "#eab308",
  PRODUCT_FEEDBACK: "#0ea5e9",
  CUSTOMER_STORY: "#8b5cf6",
  CUSTOM: "#64748b",
};

const PAGE = "#f3f4f6";
const SURFACE = "#ffffff";
const INK = "#1f2937";
const SUB = "#cbd5e1";
const LINE = "#e5e7eb";

const STAR_PATH =
  "M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.8 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z";

function Stars({ color }: { color: string }) {
  return (
    <div className="flex gap-[2px]" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="10" height="10" viewBox="0 0 24 24" fill={color}>
          <path d={STAR_PATH} />
        </svg>
      ))}
    </div>
  );
}

/** A faux text line. */
function Line({ w, strong = false }: { w: string; strong?: boolean }) {
  return (
    <div
      className="h-[3px] rounded-full"
      style={{
        width: w,
        background: strong ? INK : SUB,
        opacity: strong ? 0.8 : 0.7,
      }}
      aria-hidden
    />
  );
}

/** A faux input/textarea box. */
function FieldBox({ h = 14 }: { h?: number }) {
  return (
    <div
      className="rounded-[3px] border"
      style={{ height: h, borderColor: LINE, background: "#fbfbfc" }}
      aria-hidden
    />
  );
}

/** The intent's signature field cluster. */
function IntentBody({
  intent,
  accent,
}: {
  intent: V2FormIntent;
  accent: string;
}) {
  switch (intent) {
    case "TESTIMONIAL":
      return (
        <div className="space-y-2">
          <Stars color={accent} />
          <FieldBox h={26} />
          <FieldBox h={12} />
        </div>
      );
    case "REVIEW":
      return (
        <div className="space-y-2">
          <Stars color={accent} />
          <FieldBox h={18} />
          <FieldBox h={12} />
        </div>
      );
    case "PRODUCT_FEEDBACK":
      return (
        <div className="space-y-2">
          <div className="flex gap-1" aria-hidden>
            {["38%", "30%", "26%"].map((w, i) => (
              <div
                key={i}
                className="h-[10px] rounded-full border"
                style={{
                  width: w,
                  borderColor: i === 0 ? accent : LINE,
                  background: i === 0 ? `${accent}1a` : "#fbfbfc",
                }}
              />
            ))}
          </div>
          <FieldBox h={22} />
        </div>
      );
    case "CUSTOMER_STORY":
      return (
        <div className="space-y-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-1">
              <Line w={["28%", "24%", "30%"][i]} />
              <FieldBox h={11} />
            </div>
          ))}
        </div>
      );
    case "CUSTOM":
    default:
      return (
        <div className="space-y-2">
          <FieldBox h={12} />
          <FieldBox h={22} />
        </div>
      );
  }
}

export const FormCardPreview = React.memo(function FormCardPreview({
  intent,
  inactive = false,
  className,
}: {
  intent: V2FormIntent;
  inactive?: boolean;
  className?: string;
}) {
  const accent = ACCENT[intent] ?? ACCENT.CUSTOM;

  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center overflow-hidden p-4 transition-opacity",
        inactive && "opacity-50 grayscale",
        className,
      )}
      style={{ background: PAGE }}
      role="img"
      aria-label={`${intent.toLowerCase()} form preview`}
    >
      {/* Hosted-form card */}
      <div
        className="w-[78%] max-w-[230px] rounded-md border p-3 shadow-sm"
        style={{ background: SURFACE, borderColor: LINE }}
      >
        {/* Header */}
        <div className="mb-2.5 space-y-1.5">
          <Line w="62%" strong />
          <Line w="82%" />
        </div>
        <IntentBody intent={intent} accent={accent} />
        {/* Submit button */}
        <div
          className="mt-2.5 h-[12px] w-[44%] rounded-full"
          style={{ background: accent, opacity: 0.9 }}
          aria-hidden
        />
      </div>
    </div>
  );
});
