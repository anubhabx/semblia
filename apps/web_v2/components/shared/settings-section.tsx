import * as React from "react";

// ── Settings section wrapper ───────────────────────────────────────────────────

export interface SettingsSectionProps {
  id: string;
  title: string;
  description?: string;
  /** Optional right-side actions (e.g. "Add email" button). */
  actions?: React.ReactNode;
  children: React.ReactNode;
  staggerIndex?: number;
}

export function SettingsSection({
  id,
  title,
  description,
  actions,
  children,
  staggerIndex = 0,
}: SettingsSectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="settings-section-enter space-y-5"
      style={{ animationDelay: `${staggerIndex * 60}ms` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2
            id={`${id}-heading`}
            className="text-sm font-semibold tracking-tight text-foreground"
          >
            {title}
          </h2>
          {description && (
            <p className="max-w-[65ch] text-[13px] leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
      {children}
    </section>
  );
}
