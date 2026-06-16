/**
 * Forms list view-model — the management surface that survived the freeform
 * studio demolition (forms v4, docs/plans/2026-06-11-forms-v4-parametric-theming.md).
 *
 * Layout is no longer a composable flow × container × hero object; a form has
 * exactly one hand-designed layout preset. Legacy configs that haven't been
 * migrated yet surface as `layoutPreset: null`.
 */

import type { V2FormConfigEntry } from "@workspace/types";

export type FormLayoutPreset = "card" | "inline" | "split" | "conversational";

export const LAYOUT_PRESET_LABEL: Record<FormLayoutPreset, string> = {
  card: "Card",
  inline: "Inline",
  split: "Split",
  conversational: "Conversational",
};

export interface FormConfigEntry {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  /** Traffic weight for A/B testing (0–100). Active forms split traffic by weight. */
  abWeight: number;
  createdAt: number;
  updatedAt: number;
  /** Total form submissions received. */
  submissions: number;
  /** Total form impressions / views. */
  views: number;
  /** Submission-to-view conversion rate (0–100). */
  responseRate: number;
  /** Average star rating from submissions (0–5). */
  avgRating: number;
  /** Timestamp of the most recent submission, or null if none. */
  lastSubmissionAt: number | null;
  /** v4 layout preset, or null while the config is pre-v4 / malformed. */
  layoutPreset: FormLayoutPreset | null;
  /** Brand color from the form's theme, used to tint the gallery preview. */
  brandColor: string | null;
  /** Resolved light/dark appearance for the preview (system → light). */
  appearance: "light" | "dark";
  /** Brand name shown in the preview chrome. */
  brandName: string | null;
}

const PRESETS: ReadonlySet<string> = new Set([
  "card",
  "inline",
  "split",
  "conversational",
]);

function extractLayoutPreset(config: unknown): FormLayoutPreset | null {
  if (!config || typeof config !== "object") return null;
  const doc = config as { schemaVersion?: unknown; layout?: unknown };
  if (doc.schemaVersion !== 2) return null;
  const preset =
    doc.layout && typeof doc.layout === "object"
      ? (doc.layout as { preset?: unknown }).preset
      : undefined;
  return typeof preset === "string" && PRESETS.has(preset)
    ? (preset as FormLayoutPreset)
    : null;
}

function extractTheme(config: unknown): {
  brandColor: string | null;
  appearance: "light" | "dark";
  brandName: string | null;
} {
  const fallback = {
    brandColor: null,
    appearance: "light" as const,
    brandName: null,
  };
  if (!config || typeof config !== "object") return fallback;
  const doc = config as {
    theme?: { inputs?: { brandColor?: unknown; appearance?: unknown } };
    content?: { brandName?: unknown };
  };
  const inputs = doc.theme?.inputs;
  const brandColor =
    typeof inputs?.brandColor === "string" ? inputs.brandColor : null;
  // Preview is a single still — resolve "system" to light.
  const appearance = inputs?.appearance === "dark" ? "dark" : "light";
  const brandName =
    typeof doc.content?.brandName === "string" && doc.content.brandName
      ? doc.content.brandName
      : null;
  return { brandColor, appearance, brandName };
}

export function dtoToFormConfigEntry(
  dto: V2FormConfigEntry,
  config?: unknown,
): FormConfigEntry {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    isActive: dto.isActive,
    abWeight: dto.abWeight,
    createdAt: Date.parse(dto.createdAt),
    updatedAt: Date.parse(dto.updatedAt),
    submissions: dto.submissions,
    views: dto.views,
    responseRate: dto.responseRate,
    avgRating: dto.avgRating,
    lastSubmissionAt:
      dto.lastSubmissionAt != null ? Date.parse(dto.lastSubmissionAt) : null,
    layoutPreset: extractLayoutPreset(config),
    ...extractTheme(config),
  };
}
