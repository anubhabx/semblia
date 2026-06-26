import { redirect } from "next/navigation";

export default async function ProjectHubPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  // Forms is the start of the collect → review → display funnel, so it is the
  // project home now that the rebuilt Forms surface has landed (Phase 9).
  redirect(`/projects/${slug}/forms`);
}
