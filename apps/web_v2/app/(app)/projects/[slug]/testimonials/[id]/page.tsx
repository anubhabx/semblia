import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProjectBySlug, getTestimonialById } from "@/lib/mock-data";
import { TestimonialDetailPage } from "./_detail-page";

export async function generateMetadata(props: {
  params: Promise<{ slug: string; id: string }>;
}): Promise<Metadata> {
  const { slug, id } = await props.params;
  const project = getProjectBySlug(slug);
  const testimonial = project ? getTestimonialById(project.id, id) : null;
  return {
    title: testimonial
      ? `${testimonial.authorName} — ${project!.name}`
      : "Testimonial"
  };
}

export default async function TestimonialDetailRoute(props: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await props.params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const testimonial = getTestimonialById(project.id, id);
  if (!testimonial) notFound();

  return <TestimonialDetailPage testimonial={testimonial} projectSlug={slug} />;
}
