import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { serverFetchProjectBySlug } from "@/lib/tresta-api-server";
import { ApiKeyDetailClient } from "@/components/api-keys/api-key-detail-client";

export async function generateMetadata(props: {
  params: Promise<{ slug: string; keyId: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const project = await serverFetchProjectBySlug(slug);
  return {
    title: project ? `API Key — ${project.name}` : "API Key",
  };
}

export default async function ApiKeyDetailPage(props: {
  params: Promise<{ slug: string; keyId: string }>;
}) {
  const { slug, keyId } = await props.params;
  const project = await serverFetchProjectBySlug(slug);
  if (!project) notFound();

  return <ApiKeyDetailClient slug={slug} keyId={keyId} />;
}
