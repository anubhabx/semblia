"use client";

import { useStudioDraft } from "@/lib/collect/studio-draft-context";
import type { SuccessActionKind } from "@/lib/collect/studio-types";
import {
  SectionCollapsible,
  Row,
  Pills,
  StudioTextInput,
  StudioTextarea,
  StudioToggle,
} from "./studio-primitives";

/* ─── Success screen section ─────────────────────────────────────────────── */

export function SuccessSection() {
  const { draft, setSuccess, setScreen } = useStudioDraft();
  const { success } = draft;

  return (
    <SectionCollapsible title="Success screen" defaultOpen={false}>
      <Row label="Title">
        <StudioTextInput
          value={success.title}
          onChange={(v) => setSuccess({ title: v })}
          placeholder="Thank you!"
        />
      </Row>
      <Row label="Message">
        <StudioTextarea
          value={success.message}
          onChange={(v) => setSuccess({ message: v })}
          placeholder="Your testimonial has been received."
          rows={3}
        />
      </Row>
      <Row label="Glyph" hint="Emoji shown above the title">
        <StudioTextInput
          value={success.emoji}
          onChange={(v) => setSuccess({ emoji: v })}
          placeholder="🎉"
        />
      </Row>
      <Row label="After submit">
        <Pills<SuccessActionKind>
          options={[
            { value: "message", label: "Message" },
            { value: "cta", label: "Button" },
            { value: "redirect", label: "Redirect" },
          ]}
          value={success.action}
          onChange={(v) => {
            setSuccess({ action: v });
            setScreen("success");
          }}
        />
      </Row>
      {success.action === "cta" && (
        <>
          <Row label="Button label">
            <StudioTextInput
              value={success.ctaLabel}
              onChange={(v) => setSuccess({ ctaLabel: v })}
              placeholder="Back to site"
            />
          </Row>
          <Row label="Button URL">
            <StudioTextInput
              value={success.ctaUrl}
              onChange={(v) => setSuccess({ ctaUrl: v })}
              placeholder="https://example.com"
            />
          </Row>
        </>
      )}
      {success.action === "redirect" && (
        <Row label="Redirect URL" hint="Sent here after a short pause">
          <StudioTextInput
            value={success.redirectUrl}
            onChange={(v) => setSuccess({ redirectUrl: v })}
            placeholder="https://example.com/thanks"
          />
        </Row>
      )}
      <StudioToggle
        label="Confetti"
        hint="A celebratory burst when the screen appears."
        checked={success.showConfetti}
        onChange={(v) => setSuccess({ showConfetti: v })}
      />
    </SectionCollapsible>
  );
}
