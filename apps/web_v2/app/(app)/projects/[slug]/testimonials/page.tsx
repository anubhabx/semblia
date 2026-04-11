import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProjectBySlug } from "@/lib/mock-data";
import { TestimonialsInbox } from "./_testimonials-inbox";

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const project = getProjectBySlug(slug);
  return { title: project ? `Testimonials — ${project.name}` : "Testimonials" };
}

export default async function TestimonialsPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const project = getProjectBySlug(slug);

  if (!project) notFound();

  return (
    <TestimonialsInbox
      projectId={project.id}
      projectSlug={project.slug}
      totalCount={project._count.testimonials}
      pendingCount={project._count.pendingModeration}
    />
  );
}
