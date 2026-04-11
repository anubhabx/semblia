import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProjectBySlug, getWidgetById } from "@/lib/mock-data";

export async function generateMetadata(props: {
  params: Promise<{ slug: string; id: string }>;
}): Promise<Metadata> {
  const { slug, id } = await props.params;
  const project = getProjectBySlug(slug);
  const widget = project ? getWidgetById(project.id, id) : null;
  return {
    title: widget
      ? `${widget.config.layoutType} widget — ${project!.name}`
      : "Widget",
  };
}

export default async function WidgetDetailPage(props: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await props.params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const widget = getWidgetById(project.id, id);
  if (!widget) notFound();

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border px-6 pt-7 pb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Widget Editor
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          {widget.config.layoutType} · {widget.config.theme} theme —{" "}
          {project.name}
        </p>
      </header>
      <div className="flex-1 px-6 py-8">
        <p className="text-sm text-muted-foreground">
          Widget configuration editor with live preview, testimonial selection,
          and embed code will be built here.
        </p>
      </div>
    </div>
  );
}
