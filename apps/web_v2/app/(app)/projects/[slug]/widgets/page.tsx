import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProjectBySlug } from "@/lib/mock-data";
import { ProjectPageShell } from "@/components/projects/project-page-shell";

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const project = getProjectBySlug(slug);
  return { title: project ? `Widgets — ${project.name}` : "Widgets" };
}

export default async function WidgetsPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <ProjectPageShell
      title="Widgets"
      description={
        <>
          {project._count.widgets} widget
          {project._count.widgets !== 1 ? "s" : ""} - {project.name}
        </>
      }
    >
      <p className="text-sm text-muted-foreground">
        Widget gallery with layout type, theme, load stats, and create/edit
        actions will be built here.
      </p>
    </ProjectPageShell>
  );
}
