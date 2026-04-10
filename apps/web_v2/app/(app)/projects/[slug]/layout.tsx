import { notFound } from "next/navigation";
import { getProjectBySlug } from "@/lib/mock-data";
import { ProjectSidebar } from "@/components/nav/project-sidebar";

interface ProjectLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function ProjectLayout({
  children,
  params,
}: ProjectLayoutProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) notFound();

  return (
    <>
      <ProjectSidebar slug={slug} />
      <div className="flex flex-1 flex-col lg:pl-56">{children}</div>
    </>
  );
}
