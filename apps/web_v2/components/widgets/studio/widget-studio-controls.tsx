"use client";

/**
 * WidgetInspectorPanel — renders one section's controls for the active widget.
 *
 * Section navigation is owned by the shared StudioRail in the shell, so this is
 * panel content only (mirroring the Form Studio's FormInspectorPanel):
 *
 *   layout  → layout preset + layout-coupled behavior
 *   style   → the brand-theme appearance inspector (visual pickers)
 *   content → curation (source / hand-pick) · card fields · wall page (wall kind)
 */

import * as React from "react";
import {
  Rows as LayoutIcon,
  PaintBrushBroad as StyleIcon,
  ListBullets as ContentIcon,
} from "@phosphor-icons/react";
import { type StudioSection } from "@/components/studio/studio-rail";
import {
  findSlugForWidget,
  useWidgetStudioStore,
} from "@/lib/widgets/widget-studio-store";

import { LayoutSection } from "./controls-layout";
import { AppearanceSection } from "./controls-appearance";
import { ContentSection } from "./controls-content";
import { BehaviorSection } from "./controls-behavior";
import { WallSection } from "./controls-wall";
import { VisibilitySection } from "./controls-visibility";

export type WidgetSectionId = "layout" | "style" | "content";

/** Section model consumed by the shared StudioRail. */
export const WIDGET_SECTIONS: ReadonlyArray<StudioSection<WidgetSectionId>> = [
  { id: "layout", label: "Layout", icon: LayoutIcon },
  { id: "style", label: "Style", icon: StyleIcon },
  { id: "content", label: "Content", icon: ContentIcon },
];

export const WidgetInspectorPanel = React.memo(function WidgetInspectorPanel({
  widgetId,
  section,
}: {
  widgetId: string;
  section: WidgetSectionId;
}) {
  const draft = useWidgetStudioStore((s) => s.snapshots[widgetId]?.draft);
  const slug = useWidgetStudioStore((s) => findSlugForWidget(s, widgetId));

  if (!draft) return null;
  const isWall = draft.kind === "wall";

  return (
    <div className="divide-y divide-border/60">
      {section === "layout" && (
        <>
          <LayoutSection widgetId={widgetId} />
          <BehaviorSection widgetId={widgetId} />
        </>
      )}
      {section === "style" && <AppearanceSection widgetId={widgetId} />}
      {section === "content" && (
        <>
          {slug && <ContentSection widgetId={widgetId} projectSlug={slug} />}
          <VisibilitySection widgetId={widgetId} />
          {isWall && <WallSection widgetId={widgetId} />}
        </>
      )}
      <div className="h-12" />
    </div>
  );
});
