import * as React from "react";

// ── Settings section wrapper ───────────────────────────────────────────────────

export interface SettingsSectionProps {
  id: string;
  title: string;
  /**
   * @deprecated Section helper lines were removed for a flatter, consistent
   * hierarchy across tabs. Per-control helper text still lives on the controls.
   */
  description?: string;
  /** Optional right-side actions (e.g. "Add email" button). */
  actions?: React.ReactNode;
  children: React.ReactNode;
  staggerIndex?: number;
}

export function SettingsSection({
  id,
  title,
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
        <h2
          id={`${id}-heading`}
          className="text-sm font-semibold tracking-tight text-foreground"
        >
          {title}
        </h2>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
      {children}
    </section>
  );
}
