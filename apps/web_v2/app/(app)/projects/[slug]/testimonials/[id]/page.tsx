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

  return <TestimonialDetailPage slug={slug} testimonialId={id} />;
}
