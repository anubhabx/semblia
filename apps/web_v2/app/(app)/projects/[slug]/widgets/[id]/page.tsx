import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProjectBySlug, getWidgetById } from "@/lib/mock-data";
import { ProjectPageShell } from "@/components/projects/project-page-shell";

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
    <ProjectPageShell
      title="Widget Editor"
      description={
        <>
          {widget.config.layoutType} · {widget.config.theme} theme - {project.name}
        </>
      }
    >
      <p className="text-sm text-muted-foreground">
        Widget configuration editor with live preview, testimonial selection,
        and embed code will be built here.
      </p>
    </ProjectPageShell>
  );
}
