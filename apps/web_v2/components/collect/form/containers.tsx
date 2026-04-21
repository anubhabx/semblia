"use client";

import * as React from "react";
import type { StudioConfig } from "@/lib/collect/studio-types";

/* ─── Brand pill (top identity mark) ─────────────────────────────────────── */

export function BrandPill({
  name,
  logoUrl,
}: {
  name: string;
  logoUrl?: string | null;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "5px 14px 5px 5px",
        borderRadius: 999,
        background: "var(--f-surface-60)",
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "var(--f-line-30)",
        fontSize: "calc(var(--f-size-base) * 0.78)",
        fontFamily: "var(--f-font-body)",
        color: "var(--f-ink-soft)",
        backdropFilter: "blur(8px)",
      }}
    >
      <span
        style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: logoUrl ? "transparent" : "var(--f-accent)",
          color: "var(--f-accent-ink)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          fontWeight: 700,
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt={name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          name.charAt(0)
        )}
      </span>
      {name}
    </div>
  );
}

/* ─── Powered by footer ───────────────────────────────────────────────────── */

export function PoweredBy() {
  return (
    <div
      style={{
        textAlign: "center",
        fontSize: "calc(var(--f-size-base) * 0.65)",
        color: "var(--f-ink-soft-50)",
        fontFamily: "var(--f-font-mono)",
        letterSpacing: "0.04em",
        padding: "12px 0 4px",
      }}
    >
      Powered by{" "}
      <strong style={{ fontWeight: 600, color: "var(--f-ink-soft)" }}>
        Tresta
      </strong>
    </div>
  );
}

/* ─── Hero headline block ─────────────────────────────────────────────────── */

function HeadlineBlock({
  headline,
  subhead,
  center,
}: {
  headline: string;
  subhead: string;
  center?: boolean;
}) {
  if (!headline && !subhead) return null;
  return (
    <div style={{ textAlign: center ? "center" : "left" }}>
      {headline && (
        <h1
          style={{
            fontFamily: "var(--f-font-head)",
            fontSize: "var(--f-size-head)",
            fontWeight:
              "var(--f-weight-head)" as React.CSSProperties["fontWeight"],
            letterSpacing: "var(--f-tracking-head)",
            lineHeight: 1.1,
            color: "var(--f-ink)",
            margin: 0,
            textWrap: "balance" as React.CSSProperties["textWrap"],
          }}
        >
          {headline}
        </h1>
      )}
      {subhead && (
        <p
          style={{
            fontFamily: "var(--f-font-body)",
            fontSize: "var(--f-size-base)",
            fontWeight:
              "var(--f-weight-body)" as React.CSSProperties["fontWeight"],
            color: "var(--f-ink-soft)",
            lineHeight: 1.6,
            marginTop: 10,
            marginBottom: 0,
            maxWidth: center ? 420 : 480,
          }}
        >
          {subhead}
        </p>
      )}
    </div>
  );
}

/* ─── Hero variants ───────────────────────────────────────────────────────── */

export function HeroTop({ config }: { config: StudioConfig }) {
  const { headline, subhead, brandName, layout } = config;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomStyle: "solid",
        borderBottomColor: "var(--f-line-30)",
        marginBottom: 8,
        paddingBottom: 28,
        gap: 14,
      }}
    >
      {layout.showBrandPill && (
        <BrandPill name={brandName} logoUrl={config.logoUrl} />
      )}
      <HeadlineBlock headline={headline} subhead={subhead} center />
    </div>
  );
}

export function HeroSide({ config }: { config: StudioConfig }) {
  const { headline, subhead, brandName, layout } = config;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 20,
        height: "100%",
        padding: 32,
      }}
    >
      {layout.showBrandPill && (
        <BrandPill name={brandName} logoUrl={config.logoUrl} />
      )}
      <div>
        {headline && (
          <h1
            style={{
              fontFamily: "var(--f-font-head)",
              fontSize: "var(--f-size-head)",
              fontWeight:
                "var(--f-weight-head)" as React.CSSProperties["fontWeight"],
              letterSpacing: "var(--f-tracking-head)",
              lineHeight: 1.15,
              color: "var(--f-accent-ink)",
              margin: 0,
              textWrap: "balance" as React.CSSProperties["textWrap"],
            }}
          >
            {headline}
          </h1>
        )}
        {subhead && (
          <p
            style={{
              fontFamily: "var(--f-font-body)",
              fontSize: "var(--f-size-base)",
              color: "var(--f-accent-ink-80)",
              lineHeight: 1.6,
              marginTop: 10,
              marginBottom: 0,
              maxWidth: 280,
            }}
          >
            {subhead}
          </p>
        )}
      </div>
      {/* Testimonial social proof pullquote */}
      <blockquote
        style={{
          fontFamily: "var(--f-font-head)",
          fontStyle: "italic",
          fontSize: "calc(var(--f-size-base) * 1.05)",
          lineHeight: 1.6,
          color: "var(--f-accent-ink-80)",
          borderLeftWidth: 3,
          borderLeftStyle: "solid",
          borderLeftColor: "var(--f-accent-ink-80)",
          paddingLeft: 14,
          margin: "8px 0 0",
          maxWidth: 260,
        }}
      >
        &ldquo;The feedback we got transformed our product roadmap.&rdquo;
      </blockquote>
    </div>
  );
}

export function HeroFloating({ config }: { config: StudioConfig }) {
  const { headline, brandName, layout } = config;
  return (
    <div
      style={{
        position: "absolute",
        top: 20,
        left: 20,
        zIndex: 10,
        maxWidth: 260,
      }}
    >
      {layout.showBrandPill && (
        <BrandPill name={brandName} logoUrl={config.logoUrl} />
      )}
      {headline && (
        <h2
          style={{
            fontFamily: "var(--f-font-head)",
            fontSize: "calc(var(--f-size-head) * 0.55)",
            fontWeight:
              "var(--f-weight-head)" as React.CSSProperties["fontWeight"],
            color: "var(--f-ink)",
            margin: "8px 0 0",
            lineHeight: 1.2,
          }}
        >
          {headline}
        </h2>
      )}
    </div>
  );
}

/* ─── Container variants ──────────────────────────────────────────────────── */

export function ContainerBoxed({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        maxWidth: 560,
        margin: "0 auto",
        padding: "40px 36px",
        background: "var(--f-surface)",
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "var(--f-line-30)",
        borderRadius: "var(--f-radius)",
        boxShadow: "var(--f-shadow)",
      }}
    >
      {children}
    </div>
  );
}

export function ContainerCentered({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        maxWidth: 560,
        margin: "0 auto",
        padding: "40px 24px",
      }}
    >
      {children}
    </div>
  );
}

export function ContainerFullbleed({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div style={{ padding: "40px 32px", width: "100%" }}>{children}</div>;
}

export function ContainerSplit({
  heroContent,
  children,
}: {
  heroContent: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", height: "100%", width: "100%" }}>
      {/* Left hero pane — sticky, never scrolls */}
      <div
        style={{
          width: "42%",
          flexShrink: 0,
          background: "var(--f-accent)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          color: "var(--f-accent-ink)",
          position: "sticky",
          top: 0,
          height: "100%",
          overflow: "hidden",
        }}
      >
        {heroContent}
      </div>
      {/* Right form pane — scrolls independently */}
      <div
        style={{
          flex: 1,
          padding: "40px 36px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "var(--f-bg)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
