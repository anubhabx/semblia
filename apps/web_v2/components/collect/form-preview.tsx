"use client";

import * as React from "react";
import { StarIcon, UploadIcon, VideoIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  FIELD_ORDER,
  isFieldEnabled,
  isFieldRequired,
  type FieldKey,
  type FormConfig,
} from "@/lib/collect/types";
import { Watermark } from "@/components/collect/watermark";

const FONT_MAP: Record<FormConfig["branding"]["fontFamily"], string> = {
  inter: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
  geist: "var(--font-geist-mono), ui-monospace, monospace",
  system: "ui-sans-serif, system-ui, sans-serif",
  serif: "ui-serif, Georgia, serif",
  mono: "var(--font-geist-mono), ui-monospace, monospace",
};

const RADIUS_MAP: Record<FormConfig["branding"]["cornerRadius"], string> = {
  sharp: "0px",
  subtle: "4px",
  rounded: "10px",
  pill: "9999px",
};

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required: boolean;
}) {
  return (
    <span className="flex items-center gap-1 text-[11px] font-medium">
      <span>{children}</span>
      {required && <span className="text-rose-500">*</span>}
    </span>
  );
}

function FieldSlot({
  label,
  required,
  children,
  hint,
}: {
  label: string;
  required: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <FieldLabel required={required}>{label}</FieldLabel>
      {children}
      {hint && (
        <span className="text-[10px] text-[color:var(--form-fg)]/60">
          {hint}
        </span>
      )}
    </label>
  );
}

function TextInputPlaceholder({ placeholder }: { placeholder: string }) {
  return (
    <div
      className="flex h-9 items-center px-3 text-[11px]"
      style={{
        backgroundColor: "var(--form-accent)",
        border: "1px solid color-mix(in srgb, var(--form-fg) 12%, transparent)",
        borderRadius: "var(--form-radius)",
        color: "color-mix(in srgb, var(--form-fg) 55%, transparent)",
      }}
    >
      {placeholder}
    </div>
  );
}

function TextareaPlaceholder({ placeholder }: { placeholder: string }) {
  return (
    <div
      className="min-h-[76px] px-3 py-2 text-[11px] leading-relaxed"
      style={{
        backgroundColor: "var(--form-accent)",
        border: "1px solid color-mix(in srgb, var(--form-fg) 12%, transparent)",
        borderRadius: "var(--form-radius)",
        color: "color-mix(in srgb, var(--form-fg) 55%, transparent)",
      }}
    >
      {placeholder}
    </div>
  );
}

function RatingPlaceholder({ scale }: { scale: 5 | 10 }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: scale }).map((_, i) => (
        <StarIcon
          key={i}
          className="size-4"
          style={{
            color:
              i < 4
                ? "var(--form-primary)"
                : "color-mix(in srgb, var(--form-fg) 20%, transparent)",
          }}
          fill={i < 4 ? "var(--form-primary)" : "transparent"}
        />
      ))}
    </div>
  );
}

function AvatarPlaceholder() {
  return (
    <div
      className="flex items-center gap-2 px-3 py-2 text-[11px]"
      style={{
        backgroundColor: "var(--form-accent)",
        border:
          "1px dashed color-mix(in srgb, var(--form-fg) 20%, transparent)",
        borderRadius: "var(--form-radius)",
        color: "color-mix(in srgb, var(--form-fg) 60%, transparent)",
      }}
    >
      <UploadIcon className="size-3.5" />
      Drop image or click to upload
    </div>
  );
}

function VideoUrlPlaceholder() {
  return (
    <div
      className="flex items-center gap-2 px-3 py-2 text-[11px]"
      style={{
        backgroundColor: "var(--form-accent)",
        border:
          "1px solid color-mix(in srgb, var(--form-fg) 12%, transparent)",
        borderRadius: "var(--form-radius)",
        color: "color-mix(in srgb, var(--form-fg) 55%, transparent)",
      }}
    >
      <VideoIcon className="size-3.5" />
      https://… (Loom, YouTube, Vimeo)
    </div>
  );
}

function renderField(key: FieldKey, config: FormConfig): React.ReactNode {
  const required = isFieldRequired(config, key);
  switch (key) {
    case "name":
      return (
        <FieldSlot key={key} label="Full name" required>
          <TextInputPlaceholder placeholder="Ada Lovelace" />
        </FieldSlot>
      );
    case "email":
      return (
        <FieldSlot key={key} label="Email" required={required}>
          <TextInputPlaceholder placeholder="you@company.com" />
        </FieldSlot>
      );
    case "content":
      return (
        <FieldSlot key={key} label="Your testimonial" required>
          <TextareaPlaceholder placeholder="What did you love most?" />
        </FieldSlot>
      );
    case "rating":
      return (
        <FieldSlot key={key} label="Rating" required={required}>
          <RatingPlaceholder scale={config.fields.rating.scale} />
        </FieldSlot>
      );
    case "jobTitle":
      return (
        <FieldSlot key={key} label="Job title" required={required}>
          <TextInputPlaceholder placeholder="Product designer" />
        </FieldSlot>
      );
    case "company":
      return (
        <FieldSlot key={key} label="Company" required={required}>
          <TextInputPlaceholder placeholder="Acme Inc." />
        </FieldSlot>
      );
    case "avatar":
      return (
        <FieldSlot key={key} label="Profile photo" required={required}>
          <AvatarPlaceholder />
        </FieldSlot>
      );
    case "videoUrl":
      return (
        <FieldSlot key={key} label="Video URL" required={required}>
          <VideoUrlPlaceholder />
        </FieldSlot>
      );
    case "consent":
      return (
        <label
          key={key}
          className="flex items-start gap-2 text-[10px] leading-relaxed"
          style={{ color: "color-mix(in srgb, var(--form-fg) 75%, transparent)" }}
        >
          <span
            className="mt-0.5 inline-block size-3 shrink-0"
            style={{
              border:
                "1px solid color-mix(in srgb, var(--form-fg) 30%, transparent)",
              borderRadius: "calc(var(--form-radius) * 0.3)",
            }}
          />
          <span>{config.fields.consent.label}</span>
        </label>
      );
    default:
      return null;
  }
}

export function FormPreview({
  config,
  density = "cozy",
  className,
}: {
  config: FormConfig;
  density?: "cozy" | "compact";
  className?: string;
}) {
  const isDark =
    config.branding.mode === "dark" ||
    (config.branding.mode === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-color-scheme: dark)").matches);

  const bg = isDark ? "#0f172a" : config.branding.colors.background;
  const fg = isDark ? "#f8fafc" : config.branding.colors.foreground;
  const accent = isDark ? "#1e293b" : config.branding.colors.accent;

  const visibleFields = FIELD_ORDER.filter((k) => isFieldEnabled(config, k));

  const style = {
    "--form-primary": config.branding.colors.primary,
    "--form-bg": bg,
    "--form-fg": fg,
    "--form-accent": accent,
    "--form-radius": RADIUS_MAP[config.branding.cornerRadius],
    fontFamily: FONT_MAP[config.branding.fontFamily],
    backgroundColor: bg,
    color: fg,
  } as React.CSSProperties;

  return (
    <div
      data-slot="form-preview"
      data-density={density}
      className={cn(
        "relative flex min-h-full flex-col",
        density === "cozy" ? "px-5 py-6" : "px-4 py-4",
        className
      )}
      style={style}
    >
      <header className="mb-4 flex flex-col items-start gap-3">
        {config.branding.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={config.branding.logoUrl}
            alt="Logo"
            className="h-8 w-auto object-contain"
          />
        ) : (
          <div
            className="flex size-8 items-center justify-center text-[10px] font-bold"
            style={{
              backgroundColor: "var(--form-primary)",
              color: "#fff",
              borderRadius: "calc(var(--form-radius) * 0.6)",
            }}
          >
            T
          </div>
        )}
        <div>
          <h2
            className="text-[15px] font-semibold leading-tight"
            style={{ color: fg }}
          >
            {config.content.headerTitle}
          </h2>
          <p
            className="mt-1 text-[11px] leading-relaxed"
            style={{ color: "color-mix(in srgb, var(--form-fg) 70%, transparent)" }}
          >
            {config.content.headerDescription}
          </p>
        </div>
      </header>

      {config.behavior.oauthProviders.length > 0 && (
        <div className="mb-4 flex flex-col gap-2">
          {config.behavior.oauthProviders.map((p) => (
            <button
              key={p}
              type="button"
              className="flex h-8 items-center justify-center gap-2 text-[11px] font-medium"
              style={{
                backgroundColor: "var(--form-accent)",
                color: "var(--form-fg)",
                border:
                  "1px solid color-mix(in srgb, var(--form-fg) 12%, transparent)",
                borderRadius: "var(--form-radius)",
              }}
            >
              {p === "google" ? "Continue with Google" : "Continue with GitHub"}
            </button>
          ))}
          <div className="flex items-center gap-2 py-1">
            <div
              className="h-px flex-1"
              style={{
                backgroundColor:
                  "color-mix(in srgb, var(--form-fg) 10%, transparent)",
              }}
            />
            <span
              className="text-[9px] uppercase tracking-widest"
              style={{
                color: "color-mix(in srgb, var(--form-fg) 50%, transparent)",
              }}
            >
              or
            </span>
            <div
              className="h-px flex-1"
              style={{
                backgroundColor:
                  "color-mix(in srgb, var(--form-fg) 10%, transparent)",
              }}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {visibleFields.map((k) => renderField(k, config))}
      </div>

      <button
        type="button"
        className="mt-5 flex h-9 items-center justify-center text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
        style={{
          backgroundColor: "var(--form-primary)",
          borderRadius: "var(--form-radius)",
        }}
      >
        {config.content.submitButtonLabel}
      </button>

      <p
        className="mt-3 text-center text-[9px]"
        style={{
          color: "color-mix(in srgb, var(--form-fg) 45%, transparent)",
        }}
      >
        {config.content.successAction.kind === "redirect"
          ? `You'll be redirected after submit.`
          : config.content.thankYouMessage}
      </p>

      {config.watermark.show && <Watermark position={config.watermark.position} />}
    </div>
  );
}
