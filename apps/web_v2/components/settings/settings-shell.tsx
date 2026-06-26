"use client";

/**
 * SettingsShell — shared chrome for the project Settings area.
 *
 * PageHeader (title only) + a vertical SectionNav rail on desktop / horizontal
 * scroll strip on mobile. Each sub-route renders inside `children`.
 */

import * as React from "react";
import { PageHeader, SectionNav } from "@/components/shared";
import { buildSettingsNav, type SettingsSection } from "./settings-nav";

export type { SettingsSection };

export function SettingsShell({
  slug,
  active,
  actions,
  children,
}: {
  slug: string;
  /** @deprecated No longer rendered; kept for call-site back-compat. */
  projectName?: string;
  active: SettingsSection;
  /** @deprecated Page subheadings were removed for cross-tab consistency. */
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const items = buildSettingsNav(slug);
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader title="Settings" actions={actions} />
      <SectionNav
        items={items}
        active={active}
        variant="horizontal"
        aria-label="Settings sections"
        className="border-b border-border px-2 lg:hidden"
      />
      <div className="flex flex-1">
        <SectionNav
          items={items}
          active={active}
          variant="vertical"
          aria-label="Settings sections"
          className="hidden w-52 shrink-0 border-r border-border lg:flex"
        />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
