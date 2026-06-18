import { redirect } from "next/navigation";

export default async function ProjectHubPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  // FORMS-REBUILD: the Responses inbox was removed in the demolition; land on
  // Widgets until the rebuilt Forms surface becomes the project home (Phase 9).
  redirect(`/projects/${slug}/widgets`);
}
