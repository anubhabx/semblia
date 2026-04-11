import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getProjectBySlug } from "@/lib/mock-data";
import { OverviewHub } from "./_overview";

// ── Metadata ───────────────────────────────────────────────────────────────────

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const project = getProjectBySlug(slug);
  return { title: project?.name ?? "Project" };
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function ProjectHubPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  return <OverviewHub slug={slug} />;
}
