import {
  SlackLogoIcon,
  NotionLogoIcon,
  GithubLogoIcon,
  KanbanIcon,
  type Icon as PhosphorIcon,
} from "@phosphor-icons/react";
import type { V2IntegrationProvider } from "@workspace/types";

export interface ProviderConfigField {
  key: string;
  label: string;
  placeholder: string;
  helper?: string;
}

export interface ProviderSpec {
  id: V2IntegrationProvider;
  label: string;
  icon: PhosphorIcon;
  /** Short description shown on the connect picker. */
  blurb: string;
  /** Destination config fields the user fills when connecting. */
  fields: ProviderConfigField[];
  /**
   * `true` when only one of the listed fields is required (Notion's
   * page-vs-data-source choice). Otherwise every field is required.
   */
  oneOf?: boolean;
  /** Human-readable summary of where exports land, for the row subtitle. */
  summarize: (config: Record<string, unknown> | null) => string | null;
}

function str(config: Record<string, unknown> | null, key: string): string {
  const value = config?.[key];
  return typeof value === "string" ? value.trim() : "";
}

export const PROVIDERS: ProviderSpec[] = [
  {
    id: "SLACK",
    label: "Slack",
    icon: SlackLogoIcon,
    blurb: "Post new responses to a Slack channel.",
    fields: [
      {
        key: "channelId",
        label: "Channel ID",
        placeholder: "C0123456789",
        helper: "The Slack channel exports are posted to.",
      },
    ],
    summarize: (config) => {
      const id = str(config, "channelId");
      return id ? `#${id}` : null;
    },
  },
  {
    id: "NOTION",
    label: "Notion",
    icon: NotionLogoIcon,
    blurb: "Append responses to a Notion page or database.",
    oneOf: true,
    fields: [
      {
        key: "parentPageId",
        label: "Parent page ID",
        placeholder: "32-character page id",
      },
      {
        key: "dataSourceId",
        label: "Data source ID",
        placeholder: "Database / data source id",
        helper: "Provide a parent page or a data source — one is required.",
      },
    ],
    summarize: (config) => {
      const page = str(config, "parentPageId");
      const ds = str(config, "dataSourceId");
      if (ds) return `Data source ${ds.slice(0, 8)}`;
      if (page) return `Page ${page.slice(0, 8)}`;
      return null;
    },
  },
  {
    id: "LINEAR",
    label: "Linear",
    icon: KanbanIcon,
    blurb: "Create Linear issues from responses.",
    fields: [
      {
        key: "teamId",
        label: "Team ID",
        placeholder: "Linear team id",
        helper: "Issues are created in this team.",
      },
    ],
    summarize: (config) => {
      const id = str(config, "teamId");
      return id ? `Team ${id.slice(0, 8)}` : null;
    },
  },
  {
    id: "GITHUB",
    label: "GitHub",
    icon: GithubLogoIcon,
    blurb: "Open GitHub issues from responses.",
    fields: [
      {
        key: "owner",
        label: "Owner",
        placeholder: "org-or-user",
      },
      {
        key: "repo",
        label: "Repository",
        placeholder: "repo-name",
      },
    ],
    summarize: (config) => {
      const owner = str(config, "owner");
      const repo = str(config, "repo");
      return owner && repo ? `${owner}/${repo}` : null;
    },
  },
];

export function getProviderSpec(id: V2IntegrationProvider): ProviderSpec {
  return PROVIDERS.find((p) => p.id === id) ?? PROVIDERS[0];
}

/** Validate filled config against a provider's field requirements. */
export function isProviderConfigValid(
  spec: ProviderSpec,
  config: Record<string, string>,
): boolean {
  const filled = (key: string) => (config[key] ?? "").trim().length > 0;
  if (spec.oneOf) {
    return spec.fields.some((f) => filled(f.key));
  }
  return spec.fields.every((f) => filled(f.key));
}

/** Drop empty values so the API only receives provided config keys. */
export function cleanConfig(
  config: Record<string, string>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(config)) {
    if (value.trim()) out[key] = value.trim();
  }
  return out;
}
