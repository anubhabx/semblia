import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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
      {/* ── Page header — sticky single-line strip ── */}
      <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/95 px-6 backdrop-blur-sm">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/projects" className="text-xs">
                    Projects
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={`/projects/${slug}`} className="text-xs">
                    {project.name}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-xs font-semibold text-foreground">
                  Testimonials
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <span className="text-xs tabular-nums text-muted-foreground">
            {project._count.testimonials}
          </span>

          {project._count.pendingModeration > 0 && (
            <span className="rounded-full bg-warning/12 px-2 py-0.5 text-[10px] font-semibold text-warning">
              {project._count.pendingModeration} pending
            </span>
          )}
        </div>
      </header>

      {/* ── Inbox ── */}
      <TestimonialsClient
        projectId={project.id}
        projectSlug={project.slug}
        totalCount={project._count.testimonials}
      />
    </div>
  );
}
