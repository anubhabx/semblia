import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getProjectBySlug,
  getTestimonialById,
} from "@/lib/mock-data";

export async function generateMetadata(props: {
  params: Promise<{ slug: string; id: string }>;
}): Promise<Metadata> {
  const { slug, id } = await props.params;
  const project = getProjectBySlug(slug);
  const testimonial = project ? getTestimonialById(project.id, id) : null;
  return {
    title: testimonial
      ? `${testimonial.authorName} — ${project!.name}`
      : "Testimonial",
  };
}

export default async function TestimonialDetailPage(props: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await props.params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const testimonial = getTestimonialById(project.id, id);
  if (!testimonial) notFound();

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border px-6 pt-7 pb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {testimonial.authorName}
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Testimonial detail — {project.name}
        </p>
      </header>
      <div className="flex-1 px-6 py-8">
        <p className="text-sm text-muted-foreground">
          Full testimonial detail view will be built here: content, author info,
          moderation flags, OAuth status, tags, publish/approve actions.
        </p>
      </div>
    </div>
  );
}
