import {
  HouseIcon,
  KeyIcon,
  RobotIcon,
  WebhooksLogoIcon,
  ExportIcon,
  PlugsConnectedIcon,
  ClockCounterClockwiseIcon,
  BookOpenTextIcon,
} from "@phosphor-icons/react";
import type { SectionNavItem } from "@/components/shared";

// ── Developers section model ─────────────────────────────────────────────────
//
// Single source of truth for the project Developers sub-navigation. Docs lives
// on the external docs site, so it is rendered as an external link.

export type DeveloperSection =
  | "overview"
  | "keys"
  | "agents"
  | "webhooks"
  | "exports"
  | "integrations"
  | "audit";

const EXTERNAL_DOCS_URL = "https://docs.semblia.com";

export function buildDeveloperNav(slug: string): SectionNavItem[] {
  const base = `/projects/${slug}/developers`;
  return [
    { id: "overview", label: "Overview", href: base, icon: HouseIcon },
    { id: "keys", label: "Keys", href: `${base}/keys`, icon: KeyIcon },
    { id: "agents", label: "Agents", href: `${base}/agents`, icon: RobotIcon },
    {
      id: "webhooks",
      label: "Webhooks",
      href: `${base}/webhooks`,
      icon: WebhooksLogoIcon,
    },
    {
      id: "exports",
      label: "Exports",
      href: `${base}/exports`,
      icon: ExportIcon,
    },
    {
      id: "integrations",
      label: "Integrations",
      href: `${base}/integrations`,
      icon: PlugsConnectedIcon,
    },
    {
      id: "audit",
      label: "Activity",
      href: `${base}/audit`,
      icon: ClockCounterClockwiseIcon,
    },
    {
      id: "docs",
      label: "Docs",
      href: EXTERNAL_DOCS_URL,
      icon: BookOpenTextIcon,
      external: true,
    },
  ];
}
