import * as React from "react";
import { cn } from "@/lib/utils";

// ── Settings section card ──────────────────────────────────────────────────────
//
// Each settings/account section is a self-contained card: a header band (title +
// optional description + optional actions) divided from the body. This gives the
// settings area a clear "one card per category" hierarchy (Clerk-like structure,
// Vercel-like restraint) instead of a flat stack of bold labels.

export interface SettingsSectionProps {
  id: string;
  title: string;
  /** One-line description under the title — drives the section's hierarchy. */
  description?: React.ReactNode;
  /** Optional right-side header actions (e.g. "Add email" button). */
  actions?: React.ReactNode;
  /** Destructive sections (delete, transfer) render with a danger accent. */
  tone?: "default" | "danger";
  /**
   * Remove body padding so children (e.g. a divided list) can sit edge-to-edge
   * inside the card. Children then own their own row padding.
   */
  flush?: boolean;
  /** Optional card footer band (e.g. an inline note or a scoped action). */
  footer?: React.ReactNode;
  children: React.ReactNode;
  staggerIndex?: number;
}

export function SettingsSection({
  id,
  title,
  description,
  actions,
  tone = "default",
  flush = false,
  footer,
  children,
  staggerIndex = 0,
}: SettingsSectionProps) {
  const danger = tone === "danger";
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={cn(
        "settings-section-enter overflow-hidden rounded-xl border bg-card",
        danger ? "border-destructive/30" : "border-border",
      )}
      style={{ animationDelay: `${staggerIndex * 60}ms` }}
    >
      <div className="flex items-start justify-between gap-4 px-5 py-4">
        <div className="min-w-0 space-y-1">
          <h2
            id={`${id}-heading`}
            className={cn(
              "text-sm font-semibold tracking-tight",
              danger ? "text-destructive" : "text-foreground",
            )}
          >
            {title}
          </h2>
          {description && (
            <p className="max-w-prose text-xs leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>

      <div
        className={cn(
          "border-t",
          danger ? "border-destructive/20" : "border-border/60",
          flush ? "" : "space-y-5 px-5 py-5",
        )}
      >
        {children}
      </div>

      {footer && (
        <div
          className={cn(
            "border-t px-5 py-3 text-xs text-muted-foreground",
            danger
              ? "border-destructive/20 bg-destructive/5"
              : "border-border/60 bg-muted/30",
          )}
        >
          {footer}
        </div>
      )}
    </section>
  );
}
