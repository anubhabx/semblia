"use client";

import * as React from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useRouter } from "next/navigation";
import { useCollectStore, isDirty } from "@/lib/collect/form-config-store";
import { useCollectSync } from "@/lib/collect/sync";
import type { MockProject } from "@/lib/mock-data";
import { InspectorShell } from "@/components/collect/inspector/inspector-shell";
import { EditorTopbar } from "./editor-topbar";
import { EditorPreview } from "./editor-preview";

export function EditorShell({ project }: { project: MockProject }) {
  useCollectSync();
  const router = useRouter();
  const slug = project.slug;

  const ensure = useCollectStore((s) => s.ensure);
  const save = useCollectStore((s) => s.save);
  const reset = useCollectStore((s) => s.reset);
  const snap = useCollectStore((s) => s.bySlug[slug]);

  React.useEffect(() => {
    ensure(slug, project);
  }, [slug, project, ensure]);

  if (!snap) {
    return (
      <div className="flex flex-1 items-center justify-center text-xs text-muted-foreground">
        Loading configuration…
      </div>
    );
  }

  const dirty = isDirty(snap);

  const handleOpenPreview = () => {
    if (typeof window === "undefined") return;
    window.open(`/projects/${slug}/collect/preview`, "_blank", "noopener");
  };

  return (
    <div
      data-slot="collect-editor"
      className="flex h-[calc(100svh-3.5rem)] flex-1 flex-col overflow-hidden"
    >
      <EditorTopbar
        projectName={project.name}
        savedAt={snap.savedAt}
        dirty={dirty}
        onSave={() => save(slug)}
        onReset={() => reset(slug)}
        onOpenPreview={handleOpenPreview}
      />
      <PanelGroup direction="horizontal" className="flex-1">
        <Panel
          defaultSize={42}
          minSize={32}
          maxSize={60}
          className="flex flex-col"
        >
          <InspectorShell slug={slug} config={snap.draft} className="h-full" />
        </Panel>
        <PanelResizeHandle className="group relative flex w-px items-stretch bg-border transition-colors data-[resize-handle-state=drag]:bg-primary data-[resize-handle-state=hover]:bg-primary/60">
          <span className="pointer-events-none absolute inset-y-0 -left-1.5 w-4" />
        </PanelResizeHandle>
        <Panel defaultSize={58} minSize={40} className="min-w-0">
          <EditorPreview config={snap.draft} />
        </Panel>
      </PanelGroup>
      <button
        type="button"
        className="sr-only"
        onClick={() => router.refresh()}
      >
        refresh
      </button>
    </div>
  );
}
