import {
  IdentificationCardIcon,
  PaintBrushIcon,
  EyeIcon,
  ShareNetworkIcon,
  GlobeIcon,
  ShieldCheckIcon,
  UsersIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import type { SectionNavItem } from "@/components/shared";

// ── Settings section model ───────────────────────────────────────────────────
//
// Single source of truth for the project Settings sub-navigation. The id of
// each item doubles as the `SettingsSection` discriminator passed by pages.

export type SettingsSection =
  | "general"
  | "branding"
  | "visibility"
  | "social"
  | "hosts"
  | "trust"
  | "members"
  | "danger";

export function buildSettingsNav(slug: string): SectionNavItem[] {
  const base = `/projects/${slug}/settings`;
  return [
    {
      id: "general",
      label: "General",
      href: base,
      icon: IdentificationCardIcon,
    },
    {
      id: "branding",
      label: "Branding",
      href: `${base}/branding`,
      icon: PaintBrushIcon,
    },
    {
      id: "visibility",
      label: "Visibility",
      href: `${base}/visibility`,
      icon: EyeIcon,
    },
    {
      id: "social",
      label: "Social",
      href: `${base}/social`,
      icon: ShareNetworkIcon,
    },
    { id: "hosts", label: "Hosts", href: `${base}/hosts`, icon: GlobeIcon },
    {
      id: "trust",
      label: "Trust",
      href: `${base}/trust`,
      icon: ShieldCheckIcon,
    },
    {
      id: "members",
      label: "Members",
      href: `${base}/members`,
      icon: UsersIcon,
    },
    {
      id: "danger",
      label: "Danger",
      href: `${base}/danger`,
      icon: WarningIcon,
      dividerBefore: true,
    },
  ];
}
