"use client";

import { EditorShell } from "@/components/collect/editor/editor-shell";
import type { MockProject } from "@/lib/mock-data";

export function CollectEditorClient({ project }: { project: MockProject }) {
  return <EditorShell project={project} />;
}
