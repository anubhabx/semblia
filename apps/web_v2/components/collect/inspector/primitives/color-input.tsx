"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const HEX_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function ColorInput({
  label,
  value,
  onChange,
  className,
  testId,
}: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
  className?: string;
  testId?: string;
}) {
  const [raw, setRaw] = React.useState(value);

  React.useEffect(() => {
    setRaw(value);
  }, [value]);

  const commit = (next: string) => {
    if (HEX_REGEX.test(next)) onChange(next);
  };

  return (
    <div
      data-slot="color-input"
      className={cn(
        "flex items-center justify-between gap-2 rounded-md border border-border/70 bg-muted/30 px-2.5 py-2",
        className
      )}
    >
      <span className="text-[11px] font-medium text-foreground">{label}</span>
      <div className="flex items-center gap-1.5">
        <label
          className="relative size-5 cursor-pointer overflow-hidden rounded border border-border"
          style={{ backgroundColor: HEX_REGEX.test(raw) ? raw : value }}
        >
          <input
            type="color"
            value={HEX_REGEX.test(raw) ? raw : value}
            onChange={(e) => {
              setRaw(e.target.value);
              commit(e.target.value);
            }}
            className="absolute inset-0 cursor-pointer opacity-0"
            aria-label={`${label} swatch`}
          />
        </label>
        <input
          type="text"
          data-testid={testId}
          value={raw}
          onChange={(e) => {
            const v = e.target.value;
            setRaw(v);
            commit(v);
          }}
          onBlur={() => {
            if (!HEX_REGEX.test(raw)) setRaw(value);
          }}
          spellCheck={false}
          className="h-6 w-[88px] rounded border border-border bg-background px-1.5 font-mono text-[10px] uppercase outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
      </div>
    </div>
  );
}
