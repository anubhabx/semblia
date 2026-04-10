import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TestimonialsClient } from "@/components/testimonials/testimonials-client";
import { getProjectBySlug } from "@/lib/mock-data";

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const project = getProjectBySlug(slug);
  return { title: project ? `Testimonials — ${project.name}` : "Testimonials" };
}

export default async function TestimonialsPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const project = getProjectBySlug(slug);

  if (!project) notFound();

  return (
    <div className="flex flex-1 flex-col">
      {/* Page title strip — identity & breadcrumbs are in the topbar */}
      <div className="flex items-end justify-between gap-4 px-6 pt-7 pb-5">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Testimonials
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {project._count.testimonials} total
            {project._count.pendingModeration > 0 && (
              <>
                {" · "}
                <span className="font-medium text-warning">
                  {project._count.pendingModeration} pending moderation
                </span>
              </>
            )}
          </p>
        </div>
      </div>

      {/* ── Inbox ── */}
      <TestimonialsClient
        projectId={project.id}
        projectSlug={project.slug}
        totalCount={project._count.testimonials}
      />
    </div>
  );
}
