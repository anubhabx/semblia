import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProjectBySlug } from "@/lib/mock-data";

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const project = getProjectBySlug(slug);
  return { title: project ? `Collect — ${project.name}` : "Collect" };
}

export default async function CollectPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border px-6 pt-7 pb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Collect
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Configure your collection form and share link — {project.name}
        </p>
      </header>
      <div className="flex-1 px-6 py-8">
        <p className="text-sm text-muted-foreground">
          Form configuration (18 toggle fields), collection URL with copy, embed
          snippet, and form preview will be built here.
        </p>
      </div>
    </div>
  );
}
