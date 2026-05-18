"use client";

/**
 * DeveloperShell — shared page chrome for the project Developers area.
 *
 * Renders the standard "Developers" PageHeader with sub-tabs in its toolbar
 * slot (Overview / Keys / Agents / Docs). Wraps children in a flex column so
 * sub-pages can drop straight into PageBody without re-declaring identity.
 *
 * Detail pages (/developers/keys/[keyId], /developers/agents/[keyId]) render
 * their own PageHeader and skip this shell.
 */

import * as React from "react";
import Link from "next/link";
import {
  HouseIcon,
  KeyIcon,
  RobotIcon,
  BookOpenTextIcon,
  type Icon as PhosphorIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/shared";

export type DeveloperSection = "overview" | "keys" | "agents" | "docs";

interface SubTabSpec {
  id: DeveloperSection;
  label: string;
  href: (slug: string) => string;
  icon: PhosphorIcon;
}

const SUB_TABS: SubTabSpec[] = [
  {
    id: "overview",
    label: "Overview",
    href: (slug) => `/projects/${slug}/developers`,
    icon: HouseIcon,
  },
  {
    id: "keys",
    label: "Keys",
    href: (slug) => `/projects/${slug}/developers/keys`,
    icon: KeyIcon,
  },
  {
    id: "agents",
    label: "Agents",
    href: (slug) => `/projects/${slug}/developers/agents`,
    icon: RobotIcon,
  },
  {
    id: "docs",
    label: "Docs",
    href: (slug) => `/projects/${slug}/developers/docs`,
    icon: BookOpenTextIcon,
  },
];

function SubTabs({ slug, active }: { slug: string; active: DeveloperSection }) {
  return (
    <div
      role="tablist"
      aria-label="Developer sections"
      className="scrollbar-none -my-2.5 flex min-w-0 items-center gap-0 overflow-x-auto"
    >
      {SUB_TABS.map((tab) => {
        const on = tab.id === active;
        const Icon = tab.icon;
        return (
          <Link
            key={tab.id}
            href={tab.href(slug)}
            role="tab"
            aria-selected={on}
            className={cn(
              "group relative inline-flex shrink-0 items-center gap-1.5 px-3 py-3 text-xs font-medium",
              "transition-colors duration-150",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-brand",
              "after:absolute after:-bottom-px after:left-0 after:h-[2px] after:w-full after:rounded-full",
              "after:transition-[transform,opacity] after:duration-200 after:[transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
              on
                ? "text-foreground after:scale-x-100 after:bg-brand after:opacity-100"
                : "text-muted-foreground after:scale-x-0 after:bg-brand after:opacity-0 hover:text-foreground",
            )}
            style={{ transformOrigin: "left" }}
          >
            <Icon
              weight={on ? "fill" : "regular"}
              className={cn(
                "size-3.5 transition-colors duration-150",
                on
                  ? "text-brand"
                  : "text-muted-foreground group-hover:text-foreground",
              )}
            />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}

export function DeveloperShell({
  slug,
  active,
  description,
  actions,
  children,
}: {
  slug: string;
  active: DeveloperSection;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Developers"
        description={
          description ??
          "Programmatic access for this project — keys, agents, and docs."
        }
        actions={actions}
        toolbar={<SubTabs slug={slug} active={active} />}
      />
      {children}
    </div>
  );
}
