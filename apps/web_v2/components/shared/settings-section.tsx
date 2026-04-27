import * as React from "react";

// ── Settings section wrapper ───────────────────────────────────────────────────

export interface SettingsSectionProps {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  staggerIndex?: number;
}

export function SettingsSection({
  id,
  title,
  description,
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
      {children}
    </section>
  );
}
