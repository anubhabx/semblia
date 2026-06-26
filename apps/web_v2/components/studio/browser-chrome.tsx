"use client";

/**
 * BrowserChrome — frames preview content in a faux browser window so the user
 * gets the visceral sense that this is a standalone hosted page. Shared by the
 * widget studio (wall previews) and the form studio (hosted form previews).
 *
 * Renders entirely with host UI tokens (zinc) so it never inherits the
 * widget/form design tokens — the chrome is "outside" the rendered surface.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { Lock as LockIcon } from "@phosphor-icons/react";

interface BrowserChromeProps {
  url: string;
  /** Resolved theme of the framed content (light | dark) — drives chrome inversion. */
  contentDark?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function BrowserChrome({
  url,
  contentDark = false,
  children,
  className,
}: BrowserChromeProps) {
  return (
    <div
      className={cn(
        "flex h-full min-h-0 w-full flex-col overflow-hidden",
        className,
      )}
      data-content-dark={contentDark}
    >
      {/* Chrome bar */}
      <div
        className={cn(
          "flex shrink-0 items-center gap-3 border-b px-4 py-2",
          "border-zinc-200/70 bg-zinc-50/95 text-zinc-500",
          contentDark && "border-zinc-700/60 bg-zinc-900/95 text-zinc-400",
        )}
      >
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="size-[9px] rounded-full bg-rose-400/80" />
          <span className="size-[9px] rounded-full bg-amber-400/80" />
          <span className="size-[9px] rounded-full bg-emerald-400/80" />
        </div>

        <div
          className={cn(
            "flex h-7 flex-1 items-center gap-2 rounded-md border px-3",
            "border-zinc-200/80 bg-white text-zinc-600",
            contentDark && "border-zinc-700/40 bg-zinc-800 text-zinc-300",
          )}
        >
          <LockIcon
            weight="fill"
            className={cn(
              "size-3 text-emerald-500",
              contentDark && "text-emerald-400",
            )}
            aria-hidden
          />
          <span className="truncate font-mono text-[11px] tracking-tight">
            {url}
          </span>
        </div>
      </div>

      {/* Page content */}
      <div className="relative flex-1 overflow-y-auto" data-slot="browser-body">
        {children}
      </div>
    </div>
  );
}
