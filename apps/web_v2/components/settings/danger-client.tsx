"use client";

import * as React from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { V2ProjectDTO } from "@workspace/types";
import { Button } from "@/components/ui/button";
import { PageBody, SettingsSection } from "@/components/shared";
import { useDeleteProject } from "@/hooks/api";
import { DeleteProjectDialog } from "./shared/delete-project-dialog";

export function DangerClient({ project }: { project: V2ProjectDTO }) {
  const router = useRouter();
  const deleteProject = useDeleteProject(project.slug);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  async function handleDelete() {
    setDeleteOpen(false);
    try {
      await deleteProject.mutateAsync();
      toast.success("Project deleted");
      router.push("/projects");
    } catch {
      toast.error("Failed to delete project");
    }
  }

  return (
    <PageBody padding="default">
      <div className="space-y-8 pb-8">
        <SettingsSection
          id="danger"
          title="Danger zone"
          description="Irreversible actions. Double-check before clicking."
        >
          <div className="overflow-hidden rounded-xl border border-destructive/30 bg-destructive/[0.03] dark:bg-destructive/[0.06]">
            <div className="divide-y divide-destructive/15">
              <div className="flex items-center justify-between gap-4 p-5">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Transfer ownership
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Move this project to another workspace member.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  aria-label="Transfer ownership (coming soon)"
                  className="shrink-0"
                >
                  Coming soon
                </Button>
              </div>

              <div className="flex items-center justify-between gap-4 p-5">
                <div>
                  <p className="text-sm font-medium text-destructive">
                    Delete project
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Permanently deletes the project, forms, widgets, and
                    testimonials.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteOpen(true)}
                  className="tactile shrink-0"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </SettingsSection>
      </div>

      <DeleteProjectDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        slug={project.slug}
        onConfirm={handleDelete}
      />
    </PageBody>
  );
}
