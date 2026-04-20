"use client";

/**
 * Studio preview stage — scaled device frame with device switcher.
 * Uses ResizeObserver to fit the device into available space.
 */

import * as React from "react";
import { DeviceFrame } from "@/components/collect/device-frame";
import type { StudioDevice } from "@/lib/collect/studio-types";
import { useStudioStore } from "@/lib/collect/studio-store";
import { TestimonialForm } from "@/components/collect/form";

/* ─── Device size map ─────────────────────────────────────────────────────── */

const DEVICE_DIMS: Record<StudioDevice, { w: number; h: number }> = {
  desktop: { w: 1280, h: 800 },
  tablet: { w: 768, h: 1024 },
  mobile: { w: 393, h: 852 },
};

/* ─── Scaled device frame wrapper ─────────────────────────────────────────── */

const ScaledDeviceFrame = React.memo(function ScaledDeviceFrame({
  device,
  children,
}: {
  device: StudioDevice;
  children: React.ReactNode;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState(1);
  const dims = DEVICE_DIMS[device];

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: cw, height: ch } = entry.contentRect;
        // Use smaller padding on narrow containers
        const pad = cw < 500 ? 12 : 40;
        const availW = cw - pad * 2;
        const availH = ch - pad * 2;
        const s = Math.min(availW / dims.w, availH / dims.h, 1);
        setScale(Math.max(0.15, s));
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [dims.w, dims.h]);

  return (
    <div
      ref={containerRef}
      className="flex flex-1 items-center justify-center overflow-hidden p-2 sm:p-0"
    >
      <div
        className="studio-stage-frame"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          width: dims.w,
          height: dims.h,
          flexShrink: 0,
        }}
      >
        <DeviceFrame device={device} showChrome>
          {children}
        </DeviceFrame>
      </div>
    </div>
  );
});

/* ─── Main preview stage ────────────────────────────────────────────── */

const PREVIEW_CSS = `
.studio-stage {
  --stage-bg: #eae7df;
  --stage-chrome: #8d8b83;
  --stage-tip: #b8b7b1;
  transition: background-color 0.3s ease;
}
:is(.dark, [data-theme="dark"]) .studio-stage {
  --stage-bg: #1a1814;
  --stage-chrome: #6b6963;
  --stage-tip: #4a4840;
}
.studio-stage-frame {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s ease, height 0.3s ease;
}
@keyframes stage-pulse { 0%,100% { opacity:1; } 50% { opacity:0.6; } }
.stage-live-dot { animation: stage-pulse 2s ease-in-out infinite; }
`;

export const StudioPreview = React.memo(function StudioPreview({ formId }: { formId: string }) {
  const draft = useStudioStore((s) => s.snapshots[formId]?.draft);
  const device = useStudioStore((s) => s.device);

  if (!draft) return null;

  return (
    <div className="studio-stage flex h-full flex-col" style={{ background: "var(--stage-bg, #eae7df)" }}>
      <style dangerouslySetInnerHTML={{ __html: PREVIEW_CSS }} />
      {/* Stage chrome — live indicator + label */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 20px",
        fontFamily: '"Geist Mono", ui-monospace, monospace',
        fontSize: 10.5, letterSpacing: "0.06em", color: "var(--stage-chrome, #8d8b83)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span className="stage-live-dot" style={{
            width: 7, height: 7, borderRadius: "50%",
            background: "#4ade80", boxShadow: "0 0 6px #4ade8060",
          }} />
          LIVE PREVIEW
        </div>
        <span style={{ transition: "opacity 0.2s" }}>{device.toUpperCase()} · {DEVICE_DIMS[device].w}×{DEVICE_DIMS[device].h}</span>
      </div>

      {/* Stage area — warm paper background */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        <ScaledDeviceFrame device={device}>
          <TestimonialForm config={draft} mode="preview" />
        </ScaledDeviceFrame>
      </div>

      {/* Stage tip */}
      <div style={{
        textAlign: "center" as const, padding: "8px 0 12px",
        fontFamily: '"Geist Mono", ui-monospace, monospace',
        fontSize: 10, color: "var(--stage-tip, #b8b7b1)", letterSpacing: "0.04em",
      }}>
        Changes apply instantly · Cmd+S to save
      </div>
    </div>
  );
});
