"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function Section({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      data-slot="inspector-section"
      className={cn("flex flex-col gap-3 px-4 py-4", className)}
    >
      <div>
        <h3 className="text-xs font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        {description && (
          <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  );
}

export function SectionDivider() {
  return <div className="h-px w-full bg-border/60" />;
}
