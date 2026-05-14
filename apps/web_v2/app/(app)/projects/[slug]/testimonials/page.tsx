import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { serverFetchProjectBySlug } from "@/lib/tresta-api-server";
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

  // Slug-only boundary: the client component derives all project data
  // via useProject(slug) internally.
  return <TestimonialsInbox slug={slug} />;
}
