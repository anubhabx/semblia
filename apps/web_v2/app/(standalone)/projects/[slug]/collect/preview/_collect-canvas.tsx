"use client";

import { CanvasShell } from "@/components/collect/canvas/canvas-shell";
import type { MockProject } from "@/lib/mock-data";

export function CollectCanvasClient({ project }: { project: MockProject }) {
  return <CanvasShell project={project} />;
}
