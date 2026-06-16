import type {
  V2WidgetConfig,
  V2WidgetListEntry,
  V2WidgetType,
  V2LayoutType,
  V2ThemeMode,
} from "@workspace/types";
import type {
  WidgetKind,
  WidgetLayout,
  WidgetListEntry,
  WidgetStudioConfig,
  WidgetTheme,
} from "./widget-types";
import { syncStudioConfig } from "./widget-presets";

const KIND_MAP: Record<V2WidgetType, WidgetKind> = {
  EMBED: "embed",
  WALL_OF_LOVE: "wall",
};

const LAYOUT_MAP: Record<V2LayoutType, WidgetLayout> = {
  CAROUSEL: "carousel",
  GRID: "grid",
  MASONRY: "masonry",
  LIST: "list",
  WALL: "wall",
};

const THEME_MAP: Record<V2ThemeMode, WidgetTheme> = {
  LIGHT: "light",
  DARK: "dark",
  AUTO: "system",
};

export function dtoToWidgetListEntry(
  dto: V2WidgetListEntry,
  fallbackAccent: string,
): WidgetListEntry {
  return {
    id: dto.id,
    name: dto.name,
    kind: KIND_MAP[dto.widgetType],
    layout: LAYOUT_MAP[dto.layoutType],
    theme: THEME_MAP[dto.themeMode],
    accent: fallbackAccent,
    isActive: dto.isActive,
    createdAt: Date.parse(dto.createdAt),
    updatedAt: Date.parse(dto.updatedAt),
    metrics: {
      totalLoads: dto.totalLoads,
      avgLoadMs: dto.avgLoadMs,
      lastLoadAt: dto.lastLoadAt != null ? Date.parse(dto.lastLoadAt) : null,
    },
  };
}

/**
 * Build a full, editable `WidgetStudioConfig` from a widget's published API
 * config. `definition` is the shared `WidgetDefinitionDoc` source of truth, so
 * `syncStudioConfig` derives every studio field (kind/layout/theme/tokens/
 * visibility/behavior/content/wall) from it deterministically.
 */
export function dtoToWidgetStudioConfig(
  config: V2WidgetConfig,
): WidgetStudioConfig {
  return syncStudioConfig({ name: config.name, definition: config.definition });
}
