import * as React from "react";
import { PageBody, PageHeader } from "@/components/shared";

interface ProjectPageShellProps {
  title: string;
  /** @deprecated Page subheadings were removed for cross-tab consistency. */
  description?: React.ReactNode;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
}

export function ProjectPageShell({
  title,
  headerAction,
  children,
}: ProjectPageShellProps) {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader title={title} actions={headerAction} />
      <PageBody padding="default">{children}</PageBody>
    </div>
  );
}
