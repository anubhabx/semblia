"use client";

import * as React from "react";
import type {
  StudioConfig,
  FlowMode,
  ContainerMode,
} from "@/lib/collect/studio-types";
import { evalShowIf } from "@/lib/collect/studio-types";
import { FormContext } from "./form-context";
import { useFormState } from "./use-form-state";
import { tokensToCssVars, textureBg } from "./tokens-to-css";
import { Flow } from "./flows";
import { PoweredBy, BrandPill } from "./containers";
import {
  ContainerBoxed,
  ContainerCentered,
  ContainerFullbleed,
  ContainerSplit,
  HeroTop,
  HeroSide,
  HeroFloating,
} from "./containers";
import { ThankYou } from "./thank-you";
import { useContainerWidth } from "@/hooks/use-container-width";

/* ─── TestimonialForm ─────────────────────────────────────────────────────── */

export interface TestimonialFormProps {
  config: StudioConfig;
  /** "preview" = interactive but mock-submits; "live" = real submission path (future). */
  mode?: "preview" | "live";
  onSubmit?: (payload: unknown) => void;
}

export const TestimonialForm = React.memo(function TestimonialForm({
  config,
  onSubmit,
}: TestimonialFormProps) {
  const { tokens, layout, questions, brandName, logoUrl } = config;

  // Measure the form's own width (not the page window) so preview devices
  // correctly trigger mobile overrides regardless of outer viewport size.
  const [rootRef, containerWidth] = useContainerWidth<HTMLDivElement>();
  const isNarrow = containerWidth > 0 && containerWidth < 640;

  const effectiveFlow: FlowMode =
    isNarrow && layout.mobileFlow !== "auto" ? layout.mobileFlow : layout.flow;
  const requestedContainer: ContainerMode =
    isNarrow && layout.mobileContainer !== "auto"
      ? layout.mobileContainer
      : layout.container;
  // Split layout is unworkable below ~520px: auto-stack to boxed.
  const effectiveContainer: ContainerMode =
    requestedContainer === "split" && containerWidth > 0 && containerWidth < 520
      ? "boxed"
      : requestedContainer;

  // Form state
  const formState = useFormState(questions, onSubmit);

  // Derived underline flag (replaces getComputedStyle in fields)
  const isUnderline = tokens.fieldShape === "underline";

  // Context value
  const contextValue = React.useMemo(
    () => ({
      questions,
      values: formState.values,
      errors: formState.errors,
      status: formState.status,
      step: formState.step,
      totalSteps: formState.totalSteps,
      isUnderline,
      setValue: formState.setValue,
      clearError: formState.clearError,
      goNext: formState.goNext,
      goBack: formState.goBack,
      submit: formState.submit,
    }),
    [formState, questions, isUnderline],
  );

  // Memoized CSS variable block — only recompute when tokens change.
  const cssVars = React.useMemo(
    () => tokensToCssVars(tokens) as React.CSSProperties,
    [tokens],
  );

  // Memoized texture background — cache data-URI by (texture, ink).
  const textureImage = React.useMemo(
    () => textureBg(tokens.texture, tokens.ink),
    [tokens.texture, tokens.ink],
  );

  const rootStyle = React.useMemo<React.CSSProperties>(
    () => ({
      ...cssVars,
      width: "100%",
      height: "100%",
      minHeight: "100%",
      background: tokens.bg,
      backgroundImage: textureImage !== "none" ? textureImage : undefined,
      fontFamily: tokens.fontBody,
      color: tokens.ink,
      position: "relative",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column" as const,
    }),
    [
      cssVars,
      tokens.bg,
      textureImage,
      tokens.fontBody,
      tokens.ink,
      effectiveContainer,
    ],
  );

  // Thank-you screen
  if (formState.status === "success") {
    return (
      <div ref={rootRef} style={rootStyle}>
        <div style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 0",
        }}>
          <ContainerBoxed>
            <ThankYou brandName={brandName} />
          </ContainerBoxed>
        </div>
      </div>
    );
  }

  // Visible questions (conditional logic applied)
  const visibleQuestions = questions.filter((q) => evalShowIf(q, formState.values));

  // Hero node (for non-split containers)
  const heroNode =
    layout.hero === "top" ? (
      <HeroTop config={config} />
    ) : layout.hero === "floating" ? (
      <HeroFloating config={config} />
    ) : null;

  // Inner form content (questions + footer)
  const formContent = (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--f-gap)" }}>
      {layout.hero === "top" && heroNode}

      <Flow
        flow={effectiveFlow}
        questions={visibleQuestions}
        stickyProgress={layout.stickyProgress}
      />

      <PoweredBy />
    </div>
  );

  // Pick container
  let containerNode: React.ReactNode;
  if (effectiveContainer === "split") {
    containerNode = (
      <ContainerSplit heroContent={<HeroSide config={config} />}>
        {formContent}
      </ContainerSplit>
    );
  } else if (effectiveContainer === "centered") {
    containerNode = <ContainerCentered>{formContent}</ContainerCentered>;
  } else if (effectiveContainer === "fullbleed") {
    containerNode = <ContainerFullbleed>{formContent}</ContainerFullbleed>;
  } else {
    containerNode = <ContainerBoxed>{formContent}</ContainerBoxed>;
  }

  // Split layout: the container handles its own scroll (hero sticky left, form scrolls right)
  // All other layouts: wrap in a scrollable flex child that centers content vertically
  const isSplit = effectiveContainer === "split";

  return (
    <FormContext.Provider value={contextValue}>
      <div ref={rootRef} style={rootStyle}>
        {layout.hero === "floating" && heroNode}

        {isSplit ? (
          /* Split takes full height, manages its own scroll */
          <div style={{ flex: 1, minHeight: 0 }}>
            {containerNode}
          </div>
        ) : (
          /* Other layouts: scrollable, vertically centered */
          <div style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            justifyContent: "center",
            padding: "24px 0",
            minHeight: 0,
          }}>
            {containerNode}
          </div>
        )}

        {layout.showBrandPill && !isSplit && (
          <div
            style={{
              flexShrink: 0,
              display: "flex",
              justifyContent: "center",
              padding: "10px 0 14px",
              background:
                "linear-gradient(to top, var(--f-bg) 70%, transparent)",
              pointerEvents: "none",
            }}
          >
            <div style={{ pointerEvents: "auto" }}>
              <BrandPill name={brandName} logoUrl={logoUrl} />
            </div>
          </div>
        )}
      </div>
    </FormContext.Provider>
  );
});
