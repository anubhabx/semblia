import { redirect } from "next/navigation";

export default async function CollectPreviewPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  redirect(`/projects/${slug}/collect`);
}
