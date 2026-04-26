"use client";

/**
 * FormCardPreview — static SVG thumbnail of a form, shown in the card gallery.
 * Purely decorative; gives a visual hint of "there's a form here" without any
 * dynamic rendering or data dependencies.
 */

import * as React from "react";
import { cn } from "@/lib/utils";

interface FormCardPreviewProps {
  inactive?: boolean;
  className?: string;
}

export function FormCardPreview({
  inactive = false,
  className,
}: FormCardPreviewProps) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center overflow-hidden bg-muted/30",
        inactive && "opacity-50",
        className,
      )}
      aria-hidden
    >
      <svg
        viewBox="0 0 200 120"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
        style={{ padding: "14px 20px" }}
      >
        {/* Page title */}
        <rect
          x="0"
          y="0"
          width="76"
          height="7"
          rx="3"
          fill="var(--foreground)"
          opacity="0.7"
        />
        <rect
          x="0"
          y="11"
          width="120"
          height="4"
          rx="2"
          fill="var(--muted-foreground)"
          opacity="0.25"
        />

        {/* Label + text input */}
        <rect
          x="0"
          y="24"
          width="52"
          height="4"
          rx="2"
          fill="var(--muted-foreground)"
          opacity="0.4"
        />
        <rect
          x="0"
          y="31"
          width="200"
          height="9"
          rx="3.5"
          fill="var(--muted)"
          stroke="var(--border)"
          strokeWidth="0.8"
        />

        {/* Label + text input 2 */}
        <rect
          x="0"
          y="46"
          width="64"
          height="4"
          rx="2"
          fill="var(--muted-foreground)"
          opacity="0.4"
        />
        <rect
          x="0"
          y="53"
          width="200"
          height="9"
          rx="3.5"
          fill="var(--muted)"
          stroke="var(--border)"
          strokeWidth="0.8"
        />

        {/* Rating label */}
        <rect
          x="0"
          y="68"
          width="44"
          height="4"
          rx="2"
          fill="var(--muted-foreground)"
          opacity="0.4"
        />

        {/* Star row (5 stars) */}
        {[0, 1, 2, 3, 4].map((i) => (
          <text
            key={i}
            x={i * 14}
            y="85"
            fontSize="11"
            fill="var(--chart-4)"
            opacity={i < 4 ? 0.75 : 0.18}
          >
            ★
          </text>
        ))}

        {/* Submit button */}
        <rect
          x="136"
          y="108"
          width="64"
          height="12"
          rx="4"
          fill="var(--primary)"
          opacity="0.88"
        />
        <rect
          x="144"
          y="112"
          width="48"
          height="4"
          rx="2"
          fill="var(--primary-foreground)"
          opacity="0.65"
        />
      </svg>
    </div>
  );
}
