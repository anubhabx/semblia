import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProjectBySlug } from "@/lib/mock-data";

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const project = getProjectBySlug(slug);
  return { title: project ? `API Keys — ${project.name}` : "API Keys" };
}

export default async function ApiKeysPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border px-6 pt-7 pb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          API Keys
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          {project._count.apiKeys} key{project._count.apiKeys !== 1 ? "s" : ""}{" "}
          — {project.name}
        </p>
      </header>
      <div className="flex-1 px-6 py-8">
        <p className="text-sm text-muted-foreground">
          API key list with permissions, usage/limits, rate limits, daily usage
          chart, and create/revoke actions will be built here.
        </p>
      </div>
    </div>
  );
}
