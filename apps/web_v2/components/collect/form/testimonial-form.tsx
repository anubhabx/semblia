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

/* ─── Mobile-override hook ────────────────────────────────────────────────── */

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(query);
    setMatches(mq.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [query]);
  return matches;
}

/* ─── TestimonialForm ─────────────────────────────────────────────────────── */

export interface TestimonialFormProps {
  config: StudioConfig;
  /** "preview" = interactive but mock-submits; "live" = real submission path (future). */
  mode?: "preview" | "live";
  onSubmit?: (payload: unknown) => void;
}

export const TestimonialForm = React.memo(function TestimonialForm({
  config,
  mode = "preview",
  onSubmit,
}: TestimonialFormProps) {
  const { tokens, layout, questions, headline, subhead, brandName, logoUrl } = config;

  // Apply mobile overrides
  const isMobile = useMediaQuery("(max-width: 768px)");
  const effectiveFlow: FlowMode =
    isMobile && layout.mobileFlow !== "auto" ? layout.mobileFlow : layout.flow;
  const effectiveContainer: ContainerMode =
    isMobile && layout.mobileContainer !== "auto"
      ? layout.mobileContainer
      : layout.container;

  // Form state
  const formState = useFormState(questions, onSubmit);

  // Context value
  const contextValue = React.useMemo(
    () => ({
      questions,
      values: formState.values,
      errors: formState.errors,
      status: formState.status,
      step: formState.step,
      totalSteps: formState.totalSteps,
      setValue: formState.setValue,
      clearError: formState.clearError,
      goNext: formState.goNext,
      goBack: formState.goBack,
      submit: formState.submit,
    }),
    [formState, questions],
  );

  // Texture bg
  const tex = textureBg(tokens.texture, tokens.ink);

  // Root styles — sets all CSS vars + page bg
  const rootStyle: React.CSSProperties = {
    ...(tokensToCssVars(tokens) as React.CSSProperties),
    width: "100%",
    minHeight: "100%",
    background: tokens.bg,
    backgroundImage: tex !== "none" ? tex : undefined,
    fontFamily: tokens.fontBody,
    color: tokens.ink,
    position: "relative",
    overflowY: effectiveContainer === "split" ? "hidden" : "auto",
  };

  // Thank-you screen
  if (formState.status === "success") {
    return (
      <div style={rootStyle}>
        <ContainerBoxed>
          <ThankYou brandName={brandName} />
        </ContainerBoxed>
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
      {/* Top hero only outside split; floating is absolutely positioned */}
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
    containerNode = (
      <ContainerCentered>
        {formContent}
      </ContainerCentered>
    );
  } else if (effectiveContainer === "fullbleed") {
    containerNode = (
      <ContainerFullbleed>
        {formContent}
      </ContainerFullbleed>
    );
  } else {
    // boxed (default)
    containerNode = (
      <ContainerBoxed>
        {formContent}
      </ContainerBoxed>
    );
  }

  return (
    <FormContext.Provider value={contextValue}>
      <div style={rootStyle}>
        {/* Floating hero is absolutely positioned over the form */}
        {layout.hero === "floating" && heroNode}

        {containerNode}

        {/* Brand pill — sticky bottom for non-split layouts */}
        {layout.showBrandPill && effectiveContainer !== "split" && (
          <div
            style={{
              position: "sticky",
              bottom: 0,
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
