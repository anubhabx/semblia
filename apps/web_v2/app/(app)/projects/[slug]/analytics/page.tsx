import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProjectBySlug } from "@/lib/mock-data";
import { ProjectPageShell } from "@/components/projects/project-page-shell";

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const project = getProjectBySlug(slug);
  return { title: project ? `Analytics — ${project.name}` : "Analytics" };
}

export default async function AnalyticsPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <ProjectPageShell
      title="Analytics"
      description={<>Performance metrics - {project.name}</>}
    >
      <p className="text-sm text-muted-foreground">
        Unified analytics dashboard: form impressions funnel, testimonial
        reach, widget load performance (device/country/time), and API usage
        trends will be built here.
      </p>
    </ProjectPageShell>
  );
}
