import { notFound } from "next/navigation";
import type { Metadata } from "next";
import React from "react";
import { getProjectBySlug } from "@/lib/mock-data";
import { SettingsClient } from "@/components/settings/settings-client";

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const project = getProjectBySlug(slug);
  return { title: project ? `Settings — ${project.name}` : "Settings" };
}

export default async function SettingsPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <React.Suspense fallback={<div className="flex flex-1 flex-col" />}>
      <SettingsClient project={project} />
    </React.Suspense>
  );
}
