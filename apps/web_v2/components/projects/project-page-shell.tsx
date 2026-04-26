import * as React from "react";
import { PageHeader } from "@/components/shared";

interface ProjectPageShellProps {
  title: string;
  description?: React.ReactNode;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
}

export function ProjectPageShell({
  title,
  description,
  headerAction,
  children,
}: ProjectPageShellProps) {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title={title}
        description={description}
        actions={headerAction}
      />
      <div className="flex-1 px-6 py-8">{children}</div>
    </div>
  );
}
