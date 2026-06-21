"use client";

/**
 * FormStudioPreview — the live, true-WYSIWYG preview. Compiles the working draft
 * with forms-core and renders it through the shared FormRenderer, so the editor
 * shows exactly what a respondent will see on the hosted page or embed.
 */

import * as React from "react";
import { SunIcon, MoonStarsIcon } from "@phosphor-icons/react";
import { FormRenderer } from "@workspace/forms-renderer";
import type { FormDefinitionDoc } from "@workspace/forms-core";
import { cn } from "@/lib/utils";
import { compilePreviewSnapshot, type PreviewMeta } from "@/lib/forms/draft";
import { Segmented } from "@/components/studio/controls";

type Scheme = "light" | "dark";

export function FormStudioPreview({
  doc,
  meta,
}: {
  doc: FormDefinitionDoc;
  meta: PreviewMeta;
}) {
  const [scheme, setScheme] = React.useState<Scheme>(() =>
    doc.design.mode === "dark" ? "dark" : "light",
  );

  const snapshot = React.useMemo(
    () => compilePreviewSnapshot(doc, meta),
    [doc, meta],
  );

  // Re-mount the renderer whenever the structural shape changes so its internal
  // controller (answers, step) resets cleanly to the new form.
  const rendererKey = `${snapshot.checksum}:${scheme}`;

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-muted/30">
      <div className="flex items-center justify-between gap-3 border-b border-border/60 bg-background/60 px-4 py-2">
        <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Live preview
        </span>
        <Segmented<Scheme>
          ariaLabel="Preview color scheme"
          className="w-auto"
          options={[
            { value: "light", label: "Light", icon: SunIcon },
            { value: "dark", label: "Dark", icon: MoonStarsIcon },
          ]}
          value={scheme}
          onChange={setScheme}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
        <div
          className={cn(
            "mx-auto max-w-2xl overflow-hidden rounded-xl border border-border bg-background shadow-sm",
          )}
        >
          <FormRenderer
            key={rendererKey}
            snapshot={snapshot}
            mode="preview"
            forcedScheme={scheme}
          />
        </div>
      </div>
    </div>
  );
}
