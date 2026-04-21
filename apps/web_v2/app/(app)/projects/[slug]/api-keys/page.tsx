import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProjectBySlug } from "@/lib/mock-data";
import { ProjectPageShell } from "@/components/projects/project-page-shell";

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const project = getProjectBySlug(slug);
  return { title: project ? `API Keys — ${project.name}` : "API Keys" };
}

export default async function ApiKeysPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <ProjectPageShell
      title="API Keys"
      description={
        <>
          {project._count.apiKeys} key{project._count.apiKeys !== 1 ? "s" : ""}{" "}
          - {project.name}
        </>
      }
    >
      <p className="text-sm text-muted-foreground">
        API key list with permissions, usage/limits, rate limits, daily usage
        chart, and create/revoke actions will be built here.
      </p>
    </ProjectPageShell>
  );
}
