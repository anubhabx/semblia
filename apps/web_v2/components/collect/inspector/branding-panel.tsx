"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Label } from "@/components/ui/label";
import { Section, SectionDivider } from "./primitives/section";
import { ToggleRow } from "./primitives/toggle-row";
import { ColorInput } from "./primitives/color-input";
import { LogoUpload } from "./primitives/logo-upload";
import { useCollectStore } from "@/lib/collect/form-config-store";
import type {
  CornerRadius,
  DisplayMode,
  FontFamily,
  FormConfig,
  WatermarkPosition,
} from "@/lib/collect/types";

export function BrandingPanel({
  slug,
  config,
}: {
  slug: string;
  config: FormConfig;
}) {
  const update = useCollectStore((s) => s.update);
  const b = config.branding;

  return (
    <div data-slot="branding-panel" className="divide-y divide-border/60">
      <Section title="Logo" description="Shown above the form header.">
        <LogoUpload
          value={b.logoUrl}
          onChange={(url) =>
            update(slug, { branding: { logoUrl: url } })
          }
        />
      </Section>

      <SectionDivider />

      <Section title="Colors">
        <ColorInput
          testId="color-primary"
          label="Primary"
          value={b.colors.primary}
          onChange={(v) =>
            update(slug, { branding: { colors: { primary: v } } })
          }
        />
        <ColorInput
          label="Background"
          value={b.colors.background}
          onChange={(v) =>
            update(slug, { branding: { colors: { background: v } } })
          }
        />
        <ColorInput
          label="Foreground"
          value={b.colors.foreground}
          onChange={(v) =>
            update(slug, { branding: { colors: { foreground: v } } })
          }
        />
        <ColorInput
          label="Accent"
          value={b.colors.accent}
          onChange={(v) =>
            update(slug, { branding: { colors: { accent: v } } })
          }
        />
      </Section>

      <SectionDivider />

      <Section title="Typography">
        <div className="flex flex-col gap-1">
          <Label className="text-[11px]">Font family</Label>
          <Select
            value={b.fontFamily}
            onValueChange={(v: FontFamily) =>
              update(slug, { branding: { fontFamily: v } })
            }
          >
            <SelectTrigger size="sm" className="w-full text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inter">Inter (default)</SelectItem>
              <SelectItem value="geist">Geist Mono</SelectItem>
              <SelectItem value="system">System UI</SelectItem>
              <SelectItem value="serif">Serif</SelectItem>
              <SelectItem value="mono">Monospace</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Section>

      <SectionDivider />

      <Section title="Shape">
        <div className="flex items-center justify-between">
          <Label className="text-[11px]">Corner radius</Label>
          <ToggleGroup
            type="single"
            size="sm"
            value={b.cornerRadius}
            onValueChange={(v) => {
              if (!v) return;
              update(slug, {
                branding: { cornerRadius: v as CornerRadius },
              });
            }}
          >
            <ToggleGroupItem value="sharp" className="h-7 text-[10px]">
              Sharp
            </ToggleGroupItem>
            <ToggleGroupItem value="subtle" className="h-7 text-[10px]">
              Subtle
            </ToggleGroupItem>
            <ToggleGroupItem value="rounded" className="h-7 text-[10px]">
              Rounded
            </ToggleGroupItem>
            <ToggleGroupItem value="pill" className="h-7 text-[10px]">
              Pill
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-[11px]">Color mode</Label>
          <ToggleGroup
            type="single"
            size="sm"
            value={b.mode}
            onValueChange={(v) => {
              if (!v) return;
              update(slug, { branding: { mode: v as DisplayMode } });
            }}
          >
            <ToggleGroupItem value="light" className="h-7 text-[10px]">
              Light
            </ToggleGroupItem>
            <ToggleGroupItem value="dark" className="h-7 text-[10px]">
              Dark
            </ToggleGroupItem>
            <ToggleGroupItem value="system" className="h-7 text-[10px]">
              System
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </Section>

      <SectionDivider />

      <Section
        title="Watermark"
        description="Shows a small 'Powered by Tresta' badge. Removable on paid plans (coming soon)."
      >
        <ToggleRow
          testId="watermark-toggle"
          label="Show badge"
          checked={config.watermark.show}
          onCheckedChange={(v) =>
            update(slug, { watermark: { show: v } })
          }
        >
          <div className="flex items-center justify-between">
            <Label className="text-[10px] text-muted-foreground">
              Position
            </Label>
            <ToggleGroup
              type="single"
              size="sm"
              value={config.watermark.position}
              onValueChange={(v) => {
                if (!v) return;
                update(slug, {
                  watermark: { position: v as WatermarkPosition },
                });
              }}
            >
              <ToggleGroupItem
                value="bottom-left"
                className="h-6 px-2 text-[10px]"
              >
                Left
              </ToggleGroupItem>
              <ToggleGroupItem
                value="bottom-center"
                className="h-6 px-2 text-[10px]"
              >
                Center
              </ToggleGroupItem>
              <ToggleGroupItem
                value="bottom-right"
                className="h-6 px-2 text-[10px]"
              >
                Right
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </ToggleRow>
      </Section>
    </div>
  );
}
