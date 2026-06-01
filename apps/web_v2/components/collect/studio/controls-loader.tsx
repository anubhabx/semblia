"use client";

import { cn } from "@/lib/utils";
import { useStudioDraft } from "@/lib/collect/studio-draft-context";
import type { LoaderStyle, LoaderTint } from "@/lib/collect/studio-types";
import {
  SectionCollapsible,
  Row,
  Pills,
  StudioTextInput,
  StudioToggle,
  StudioNumberInput,
} from "./studio-primitives";

const LOADER_STYLES: { value: LoaderStyle; label: string }[] = [
  { value: "ring", label: "Ring" },
  { value: "spinner", label: "Spinner" },
  { value: "dots", label: "Dots" },
  { value: "bar", label: "Bar" },
  { value: "pulse", label: "Pulse" },
  { value: "logo-pulse", label: "Logo pulse" },
  { value: "logo-draw", label: "Logo draw" },
];

/* ─── Loader screen section ──────────────────────────────────────────────── */

export function LoaderSection() {
  const { draft, setLoader, setScreen } = useStudioDraft();
  const { loader } = draft;

  return (
    <SectionCollapsible title="Loading screen" defaultOpen={false}>
      <StudioToggle
        label="Show a loading screen"
        hint="A brief branded screen before the form appears."
        checked={loader.enabled}
        onChange={(v) => {
          setLoader({ enabled: v });
          if (v) setScreen("loader");
        }}
      />
      {loader.enabled && (
        <>
          <Row label="Style">
            <div className="grid grid-cols-3 gap-1.5">
              {LOADER_STYLES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => {
                    setLoader({ style: s.value });
                    setScreen("loader");
                  }}
                  className={cn(
                    "rounded-lg border px-2 py-1.5 text-[11px] font-medium transition-colors",
                    loader.style === s.value
                      ? "border-foreground bg-card text-foreground"
                      : "border-border bg-transparent text-muted-foreground hover:border-muted-foreground/40 hover:bg-card",
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </Row>
          <Row label="Tint">
            <Pills<LoaderTint>
              options={[
                { value: "accent", label: "Accent" },
                { value: "ink", label: "Ink" },
              ]}
              value={loader.tint}
              onChange={(v) => setLoader({ tint: v })}
            />
          </Row>
          <Row
            label="Duration"
            hint={`${(loader.durationMs / 1000).toFixed(1)}s`}
          >
            <StudioNumberInput
              value={loader.durationMs}
              onChange={(v) => setLoader({ durationMs: v })}
              min={400}
              max={4000}
              step={100}
            />
          </Row>
          <Row label="Message">
            <StudioTextInput
              value={loader.message}
              onChange={(v) => setLoader({ message: v })}
              placeholder="Loading your form…"
            />
          </Row>
        </>
      )}
    </SectionCollapsible>
  );
}
