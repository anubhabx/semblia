"use client";

import * as React from "react";
import { DesktopIcon, DeviceMobileIcon } from "@phosphor-icons/react";
import {
  publishFormDefinition,
  renderPublishedFormFragment,
  renderPublishedFormPage,
  type FormDefinitionDoc,
} from "@workspace/forms-core";
import { cn } from "@/lib/utils";
import { renderMockHostPage } from "@/lib/collect/preview-scaffolds";
import type { StudioProject } from "./studio-client";

type Device = "desktop" | "mobile";
type Mode = "page" | "embed";
type View = "form" | "success";

const DIMS: Record<Device, { w: number; h: number }> = {
  desktop: { w: 1200, h: 820 },
  mobile: { w: 390, h: 760 },
};
const TITLEBAR = 40;
const STAGE_PAD = 28;

/**
 * The studio preview as a canvas: the production forms-core render (so it can
 * never drift from the served form) framed in a browser window, scaled to fit,
 * with a device toggle and two modes — the hosted page, or the form embedded in
 * a faint mock host site derived from the project type.
 */
export function PreviewCanvas({
  doc,
  project,
  slug,
  className,
}: {
  doc: FormDefinitionDoc;
  project: StudioProject;
  slug: string;
  className?: string;
}) {
  const [device, setDevice] = React.useState<Device>("desktop");
  const [mode, setMode] = React.useState<Mode>("page");
  const [view, setView] = React.useState<View>("form");
  const [zoom, setZoom] = React.useState<"fit" | number>("fit");
  const [fitScale, setFitScale] = React.useState(1);

  const stageRef = React.useRef<HTMLDivElement>(null);
  const dims = DIMS[device];
  const chromeH = dims.h + TITLEBAR;

  // Fit-to-width: measure the stage and scale the window so it always fits.
  React.useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let raf = 0;
    const measure = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const avail = stage.clientWidth - STAGE_PAD * 2;
        setFitScale(Math.min(1, Math.max(0.25, avail / dims.w)));
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [dims.w]);

  const scale = zoom === "fit" ? fitScale : zoom / 100;

  const result = React.useMemo<
    { ok: true; html: string } | { ok: false; error: string }
  >(() => {
    try {
      const published = publishFormDefinition(doc);
      const submitted = view === "success";
      if (mode === "embed") {
        const { html } = renderPublishedFormFragment(published, { submitted });
        return {
          ok: true,
          html: renderMockHostPage({
            fragmentHtml: html,
            type: project.type,
            brandName: doc.content.brandName,
            accent: doc.theme.inputs.brandColor,
          }),
        };
      }
      const { html } = renderPublishedFormPage(published, {
        watermark: true,
        submitted,
      });
      return { ok: true, html };
    } catch (error) {
      return {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "This form has a configuration error.",
      };
    }
  }, [doc, mode, view, project.type]);

  const url =
    mode === "page"
      ? `forms.semblia.com/${slug}`
      : `${slug.replace(/[^a-z0-9-]/gi, "")}.com`;

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col bg-muted/30", className)}>
      {/* Toolbar — fixed above the scrolling stage. */}
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border bg-background px-4 py-2">
        <Segmented
          options={[
            { id: "page", label: "Hosted page" },
            { id: "embed", label: "On your site" },
          ]}
          value={mode}
          onChange={setMode}
        />
        <Segmented
          options={[
            { id: "form", label: "Form" },
            { id: "success", label: "Thank-you" },
          ]}
          value={view}
          onChange={setView}
        />
        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-0.5 rounded-md border border-border p-0.5">
            {(
              [
                { id: "desktop", Icon: DesktopIcon, label: "Desktop" },
                { id: "mobile", Icon: DeviceMobileIcon, label: "Mobile" },
              ] as const
            ).map(({ id, Icon, label }) => (
              <button
                key={id}
                type="button"
                aria-label={label}
                aria-pressed={device === id}
                onClick={() => setDevice(id)}
                className={cn(
                  "flex size-7 items-center justify-center rounded transition-colors",
                  device === id
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-4" aria-hidden />
              </button>
            ))}
          </div>
          <ZoomControl
            scale={scale}
            isFit={zoom === "fit"}
            onZoom={(next) => setZoom(next)}
          />
        </div>
      </div>

      {/* Canvas stage. */}
      <div
        ref={stageRef}
        className="flex min-h-0 flex-1 justify-center overflow-auto p-7"
      >
        {result.ok ? (
          <div
            // Sizer carries the scaled footprint so the stage scrolls/centers right.
            style={{ width: dims.w * scale, height: chromeH * scale }}
            className="shrink-0"
          >
            <div
              style={{
                width: dims.w,
                height: chromeH,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
              className="overflow-hidden rounded-xl border border-border bg-background shadow-[0_12px_40px_-12px_rgba(15,20,30,0.28)]"
            >
              <div className="flex h-10 items-center gap-2 border-b border-border bg-muted/60 px-3.5">
                <span className="flex gap-1.5" aria-hidden>
                  <span className="size-2.5 rounded-full bg-foreground/15" />
                  <span className="size-2.5 rounded-full bg-foreground/15" />
                  <span className="size-2.5 rounded-full bg-foreground/15" />
                </span>
                <span className="mx-auto flex max-w-[60%] items-center gap-1.5 truncate rounded-md bg-background px-3 py-1 text-[11px] text-muted-foreground ring-1 ring-border">
                  {url}
                </span>
              </div>
              <iframe
                key={`${device}-${mode}`}
                title="Form preview"
                srcDoc={result.html}
                sandbox="allow-forms allow-scripts allow-popups"
                style={{ width: dims.w, height: dims.h }}
                className="block border-0 bg-background"
              />
            </div>
          </div>
        ) : (
          <div className="flex max-w-sm flex-col items-center justify-center gap-2 self-center text-center">
            <p className="text-sm font-medium text-foreground">
              Preview unavailable
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {result.error}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: ReadonlyArray<{ id: T; label: string }>;
  value: T;
  onChange: (next: T) => void;
}) {
  return (
    <div className="flex items-center gap-0.5 rounded-md border border-border p-0.5">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={value === o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            "rounded px-2.5 py-1 text-xs font-medium transition-colors",
            value === o.id
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function ZoomControl({
  scale,
  isFit,
  onZoom,
}: {
  scale: number;
  isFit: boolean;
  onZoom: (next: "fit" | number) => void;
}) {
  const pct = Math.round(scale * 100);
  const step = (delta: number) =>
    onZoom(Math.min(150, Math.max(40, pct + delta)));
  return (
    <div className="flex items-center gap-0.5 rounded-md border border-border p-0.5 text-muted-foreground">
      <button
        type="button"
        aria-label="Zoom out"
        onClick={() => step(-10)}
        className="flex size-7 items-center justify-center rounded text-base leading-none transition-colors hover:text-foreground"
      >
        −
      </button>
      <button
        type="button"
        onClick={() => onZoom("fit")}
        aria-pressed={isFit}
        className={cn(
          "min-w-12 rounded px-1.5 py-1 text-center text-xs font-medium tabular-nums transition-colors hover:text-foreground",
          isFit && "text-foreground",
        )}
        title="Fit to width"
      >
        {isFit ? `Fit ${pct}%` : `${pct}%`}
      </button>
      <button
        type="button"
        aria-label="Zoom in"
        onClick={() => step(10)}
        className="flex size-7 items-center justify-center rounded text-base leading-none transition-colors hover:text-foreground"
      >
        +
      </button>
    </div>
  );
}
