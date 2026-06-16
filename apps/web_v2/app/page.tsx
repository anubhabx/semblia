import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { serverFetchProjectBySlug } from "@/lib/semblia-api-server";

export default async function RootPage() {
  // Land on the last-opened project (Clerk-style), falling back to the index.
  // The slug is validated so a renamed/deleted project can't dead-end on a 404.
  const store = await cookies();
  const last = store.get("last_project")?.value;

  let target: string | null = null;
  if (last) {
    try {
      const project = await serverFetchProjectBySlug(last);
      if (project) target = `/projects/${project.slug}`;
    } catch {
      // Network/auth hiccup — fall back to the index rather than erroring.
    }
  }

  redirect(target ?? "/projects");
}
