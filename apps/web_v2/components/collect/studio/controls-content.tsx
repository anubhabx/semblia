"use client";

import { useStudioDraft } from "@/lib/collect/studio-draft-context";
import {
  SectionCollapsible,
  Row,
  StudioTextInput,
  StudioTextarea,
} from "./studio-primitives";

/* ─── Content section — copy shown on the form's first screen ─────────────── */

export function ContentSection() {
  const { draft, setHeadline, setSubhead, setBrandName, setSubmitLabel } =
    useStudioDraft();

  return (
    <SectionCollapsible title="Content">
      <Row label="Brand name">
        <StudioTextInput
          value={draft.brandName}
          onChange={setBrandName}
          placeholder="Your brand"
        />
      </Row>
      <Row label="Headline">
        <StudioTextInput
          value={draft.headline}
          onChange={setHeadline}
          placeholder="How was your experience?"
        />
      </Row>
      <Row label="Subhead">
        <StudioTextarea
          value={draft.subhead}
          onChange={setSubhead}
          placeholder="A short line that invites a response…"
          rows={3}
        />
      </Row>
      <Row label="Submit button">
        <StudioTextInput
          value={draft.submitLabel}
          onChange={setSubmitLabel}
          placeholder="Send testimonial"
        />
      </Row>
    </SectionCollapsible>
  );
}
