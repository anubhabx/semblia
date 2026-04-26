import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProjectBySlug, getApiKeyById } from "@/lib/mock-data";
import { ApiKeyDetailClient } from "@/components/api-keys/api-key-detail-client";

export async function generateMetadata(props: {
  params: Promise<{ slug: string; keyId: string }>;
}): Promise<Metadata> {
  const { slug, keyId } = await props.params;
  const key = getApiKeyById(keyId);
  const project = getProjectBySlug(slug);
  return {
    title:
      key && project ? `${key.name} — API Keys — ${project.name}` : "API Key",
  };
}

export default async function ApiKeyDetailPage(props: {
  params: Promise<{ slug: string; keyId: string }>;
}) {
  const { slug, keyId } = await props.params;
  const project = getProjectBySlug(slug);
  const key = getApiKeyById(keyId);
  if (!project || !key) notFound();

  return (
    <ApiKeyDetailClient keyId={keyId} slug={slug} projectName={project.name} />
  );
}
