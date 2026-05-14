import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { serverFetchProjectBySlug } from "@/lib/tresta-api-server";
import { TestimonialDetailPage } from "./_detail-page";

export async function generateMetadata(props: {
  params: Promise<{ slug: string; id: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const project = await serverFetchProjectBySlug(slug);
  return {
    title: project ? `Testimonial — ${project.name}` : "Testimonial",
  };
}

export default async function TestimonialDetailPageRoute(props: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await props.params;
  const project = await serverFetchProjectBySlug(slug);
  if (!project) notFound();

  // _detail-page.tsx expects { testimonial: MockTestimonial; projectSlug }
  // The testimonial is loaded client-side via the mock api layer.
  // Full migration to V2 hooks is deferred to Phase 2.
  // For now, we fetch it via the legacy api.ts layer inline.
  const { apiGetTestimonial } = await import("@/lib/api");
  const testimonial = await apiGetTestimonial(project.id, id);
  if (!testimonial) notFound();

  return <TestimonialDetailPage testimonial={testimonial} projectSlug={slug} />;
}
