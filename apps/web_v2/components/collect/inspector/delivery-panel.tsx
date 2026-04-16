"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Section, SectionDivider } from "./primitives/section";
import { ToggleRow } from "./primitives/toggle-row";
import { useCollectStore } from "@/lib/collect/form-config-store";
import type { FormConfig } from "@/lib/collect/types";

export function DeliveryPanel({
  slug,
  config,
}: {
  slug: string;
  config: FormConfig;
}) {
  const update = useCollectStore((s) => s.update);
  const d = config.delivery;

  const publicUrl = `${d.customDomain?.trim() || "https://tresta.io/t"}/${d.pathSuffix || slug}`;
  const embedSnippet = `<script src="https://tresta.io/embed.js" data-form="${d.pathSuffix || slug}"></script>`;

  return (
    <div data-slot="delivery-panel" className="divide-y divide-border/60">
      <Section
        title="Public URL"
        description="Where respondents go to submit testimonials."
      >
        <div className="flex flex-col gap-1">
          <Label htmlFor="pathSuffix" className="text-[11px]">
            Path suffix
          </Label>
          <Input
            id="pathSuffix"
            value={d.pathSuffix}
            onChange={(e) =>
              update(slug, {
                delivery: { pathSuffix: e.target.value.trim() },
              })
            }
            className="h-8 font-mono text-xs"
            placeholder={slug}
          />
        </div>
        <div className="rounded-md bg-muted/40 px-3 py-2 font-mono text-[10px] break-all text-muted-foreground">
          {publicUrl}
        </div>
      </Section>

      <SectionDivider />

      <Section
        title="Custom domain"
        description="Serve the form from your own domain."
      >
        <div className="flex flex-col gap-1">
          <Label htmlFor="customDomain" className="text-[11px]">
            Domain
          </Label>
          <Input
            id="customDomain"
            value={d.customDomain ?? ""}
            onChange={(e) => {
              const v = e.target.value.trim();
              update(slug, {
                delivery: { customDomain: v === "" ? null : v },
              });
            }}
            className="h-8 text-xs"
            placeholder="https://testimonials.yourbrand.com"
          />
        </div>
        <p className="rounded-md border border-dashed border-amber-500/40 bg-amber-500/5 px-3 py-2 text-[10px] leading-relaxed text-amber-700 dark:text-amber-300">
          Domain won't be active until DNS is verified and you publish the
          form. Verification UI lands in a later pass.
        </p>
      </Section>

      <SectionDivider />

      <Section title="Embed">
        <ToggleRow
          label="Embeddable script"
          description="Let users drop this form into their site."
          checked={d.embedScriptEnabled}
          onCheckedChange={(v) =>
            update(slug, { delivery: { embedScriptEnabled: v } })
          }
        />
        {d.embedScriptEnabled && (
          <pre className="overflow-x-auto rounded-md bg-muted/40 px-3 py-2 font-mono text-[10px] leading-relaxed text-foreground/80">
            {embedSnippet}
          </pre>
        )}
      </Section>
    </div>
  );
}
