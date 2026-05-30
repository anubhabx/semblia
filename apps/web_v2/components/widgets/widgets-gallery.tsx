"use client";

import { useMemo, useState } from "react";
import {
  LayoutGrid,
  Plus,
  Quote,
  Grid3x3,
  Columns,
  Loader2,
} from "lucide-react";
import { useWidgets, useCreateWidget } from "@/hooks/use-widgets";
import {
  PageHeader,
  PageBody,
  EmptyKindPicker,
  StatusPill,
  ItemCard,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import type { WidgetSummary, WidgetLayout } from "@/lib/tresta-api";

const LAYOUT_META: Record<
  WidgetLayout,
  { label: string; icon: typeof LayoutGrid; description: string }
> = {
  wall: {
    label: "Wall",
    icon: Grid3x3,
    description: "Masonry grid of testimonials",
  },
  carousel: {
    label: "Carousel",
    icon: Columns,
    description: "Rotating testimonial slider",
  },
  grid: {
    label: "Grid",
    icon: LayoutGrid,
    description: "Fixed grid layout",
  },
  list: {
    label: "List",
    icon: Quote,
    description: "Vertical stacked list",
  },
};

function WidgetCard({ widget, slug }: { widget: WidgetSummary; slug: string }) {
  const meta = LAYOUT_META[widget.layout] ?? LAYOUT_META.wall;
  return (
    <ItemCard
      href={`/projects/${slug}/widgets/${widget.id}`}
      leading={
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
          <meta.icon className="h-5 w-5" />
        </span>
      }
      title={widget.name}
      subtitle={meta.label}
      trailing={
        <StatusPill tone={widget.status === "published" ? "success" : "muted"}>
          {widget.status === "published" ? "Published" : "Draft"}
        </StatusPill>
      }
      metrics={
        <span className="text-xs text-muted-foreground">
          {widget.testimonialCount} testimonials
        </span>
      }
    />
  );
}

export function WidgetsGallery({
  slug,
  project,
}: {
  slug: string;
  project: { id: string; name: string };
}) {
  const { data: widgets, isLoading } = useWidgets(slug);
  const createWidget = useCreateWidget(slug);
  const [creating, setCreating] = useState<WidgetLayout | null>(null);

  const sortedWidgets = useMemo(() => {
    if (!widgets) return [];
    return [...widgets].sort((a, b) => a.name.localeCompare(b.name));
  }, [widgets]);

  async function handleCreate(layout: WidgetLayout) {
    setCreating(layout);
    try {
      const widget = await createWidget.mutateAsync({ layout });
      window.location.href = `/projects/${slug}/widgets/${widget.id}`;
    } catch {
      setCreating(null);
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Widgets"
        description={`Embeddable testimonial displays for ${project.name}`}
      />
      <PageBody>
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : sortedWidgets.length === 0 ? (
          <EmptyKindPicker
            eyebrow="New widget"
            title="Build your first embeddable display"
            description="Choose a layout to begin. You can customize everything afterward."
            options={(Object.keys(LAYOUT_META) as WidgetLayout[]).map(
              (layout) => ({
                key: layout,
                label: LAYOUT_META[layout].label,
                description: LAYOUT_META[layout].description,
                icon: LAYOUT_META[layout].icon,
              }),
            )}
            onSelect={(key) => handleCreate(key as WidgetLayout)}
            busyKey={creating}
            disabled={creating !== null}
          />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sortedWidgets.map((widget) => (
                <WidgetCard key={widget.id} widget={widget} slug={slug} />
              ))}
            </div>
            <div className="mt-8 flex justify-center">
              <CreateRow onCreate={handleCreate} creating={creating} />
            </div>
          </>
        )}
      </PageBody>
    </div>
  );
}

function CreateRow({
  onCreate,
  creating,
}: {
  onCreate: (layout: WidgetLayout) => void;
  creating: WidgetLayout | null;
}) {
  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-border/60 bg-card px-4 py-2">
      <span className="text-sm text-muted-foreground">Add another widget</span>
      <div className="flex items-center gap-1.5">
        {(Object.keys(LAYOUT_META) as WidgetLayout[]).map((layout) => (
          <Button
            key={layout}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onCreate(layout)}
            disabled={creating !== null}
          >
            <Plus className="h-3.5 w-3.5" />
            {LAYOUT_META[layout].label}
          </Button>
        ))}
      </div>
    </div>
  );
}
