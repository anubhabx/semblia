"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

// ── Settings toggle row ────────────────────────────────────────────────────────

export interface ToggleRowProps {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

export function ToggleRow({
  title,
  description,
  checked,
  onChange,
  disabled = false,
}: ToggleRowProps) {
  const id = React.useId();
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 px-4 py-3.5 transition-colors duration-100",
        disabled ? "pointer-events-none opacity-50" : "hover:bg-muted/40",
      )}
    >
      <div className="min-w-0">
        <label
          htmlFor={id}
          className="cursor-pointer text-sm font-medium text-foreground"
        >
          {title}
        </label>
        <p
          id={`${id}-desc`}
          className="text-[12.5px] leading-relaxed text-muted-foreground"
        >
          {description}
        </p>
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
        aria-describedby={`${id}-desc`}
        className="shrink-0"
      />
    </div>
  );
}
