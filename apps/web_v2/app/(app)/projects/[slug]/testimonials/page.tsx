import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { serverFetchProjectBySlug } from "@/lib/tresta-api-server";
import { getDefaultProjectCollectionUrl } from "@/lib/project-utils";
import { TestimonialsInbox } from "./_testimonials-inbox";

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const project = await serverFetchProjectBySlug(slug);
  return { title: project ? `Testimonials — ${project.name}` : "Testimonials" };
}

export default async function TestimonialsPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const project = await serverFetchProjectBySlug(slug);

  if (!project) notFound();

  const collectionUrl =
    project.collectionFormUrl ?? getDefaultProjectCollectionUrl(project.slug);

  return (
    <TestimonialsInbox
      projectId={project.id}
      projectSlug={project.slug}
      totalCount={project._count.testimonials}
      pendingCount={project._count.pendingModeration}
      collectionUrl={collectionUrl}
    />
  );
}
