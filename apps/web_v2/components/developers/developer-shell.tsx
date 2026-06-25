"use client";

/**
 * DeveloperShell — shared chrome for the project Developers area.
 *
 * PageHeader (title only) + a vertical SectionNav rail on desktop / horizontal
 * scroll strip on mobile. Docs is an external link inside the same rail. Detail
 * pages render their own PageHeader and skip this shell.
 */

import * as React from "react";
import { PageHeader, SectionNav } from "@/components/shared";
import { buildDeveloperNav, type DeveloperSection } from "./developer-nav";

export type { DeveloperSection };

export function DeveloperShell({
  slug,
  active,
  actions,
  children,
}: {
  slug: string;
  active: DeveloperSection;
  /** @deprecated Page subheadings were removed for cross-tab consistency. */
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const items = buildDeveloperNav(slug);
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader title="Developers" actions={actions} />
      <SectionNav
        items={items}
        active={active}
        variant="horizontal"
        aria-label="Developer sections"
        className="border-b border-border px-2 lg:hidden"
      />
      <div className="flex flex-1">
        <SectionNav
          items={items}
          active={active}
          variant="vertical"
          aria-label="Developer sections"
          className="hidden w-52 shrink-0 border-r border-border lg:flex"
        />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
