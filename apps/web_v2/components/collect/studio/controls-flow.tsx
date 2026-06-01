"use client";

import { useStudioDraft } from "@/lib/collect/studio-draft-context";
import type { ContainerMode, HeroMode } from "@/lib/collect/studio-types";
import {
  SectionCollapsible,
  Row,
  Pills,
  StudioToggle,
} from "./studio-primitives";

/* ─── Flow & layout section ──────────────────────────────────────────────── */

export function FlowSection() {
  const { draft, setLayout, setPreviewFlow } = useStudioDraft();
  const { layout } = draft;
  const isStepped = layout.flow === "stepped";

  return (
    <SectionCollapsible title="Flow & layout">
      <Row label="Flow">
        <Pills
          options={[
            { value: "all", label: "Single page" },
            { value: "stepped", label: "Stepped" },
          ]}
          value={isStepped ? "stepped" : "all"}
          onChange={(v) => {
            const flow = v === "stepped" ? "stepped" : "all";
            setLayout({ flow });
            setPreviewFlow(flow);
          }}
        />
      </Row>
      {isStepped && (
        <StudioToggle
          label="Sticky progress"
          hint="Pin the step progress bar to the top while scrolling."
          checked={layout.stickyProgress}
          onChange={(v) => setLayout({ stickyProgress: v })}
        />
      )}
      <Row label="Container">
        <Pills<ContainerMode>
          options={[
            { value: "boxed", label: "Boxed" },
            { value: "centered", label: "Centered" },
            { value: "split", label: "Split" },
            { value: "fullbleed", label: "Full" },
          ]}
          value={layout.container}
          onChange={(v) => setLayout({ container: v })}
        />
      </Row>
      <Row label="Hero">
        <Pills<HeroMode>
          options={[
            { value: "none", label: "None" },
            { value: "top", label: "Top" },
            { value: "side", label: "Side" },
            { value: "floating", label: "Float" },
          ]}
          value={layout.hero}
          onChange={(v) => setLayout({ hero: v })}
        />
      </Row>
    </SectionCollapsible>
  );
}
