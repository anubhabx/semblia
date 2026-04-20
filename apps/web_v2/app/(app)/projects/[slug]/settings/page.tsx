import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProjectBySlug } from "@/lib/mock-data";
import { ProjectPageShell } from "@/components/projects/project-page-shell";

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const project = getProjectBySlug(slug);
  return { title: project ? `Settings — ${project.name}` : "Settings" };
}

export default async function SettingsPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <ProjectPageShell
      title="Settings"
      description={<>Project configuration - {project.name}</>}
    >
      <p className="text-sm text-muted-foreground">
        Project name, slug, description, branding (colors, logo), visibility,
        moderation settings, social links, and danger zone (delete project)
        will be built here.
      </p>
    </ProjectPageShell>
  );
}
