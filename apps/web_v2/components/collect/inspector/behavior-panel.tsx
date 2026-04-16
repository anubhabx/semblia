"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Section, SectionDivider } from "./primitives/section";
import { ToggleRow } from "./primitives/toggle-row";
import { useCollectStore } from "@/lib/collect/form-config-store";
import type {
  FormConfig,
  ModerationMode,
  OAuthProvider,
} from "@/lib/collect/types";
import { cn } from "@/lib/utils";

const PROVIDERS: { id: OAuthProvider; label: string }[] = [
  { id: "google", label: "Google" },
  { id: "github", label: "GitHub" },
];

export function BehaviorPanel({
  slug,
  config,
}: {
  slug: string;
  config: FormConfig;
}) {
  const update = useCollectStore((s) => s.update);
  const b = config.behavior;

  const toggleProvider = (id: OAuthProvider) => {
    const next = b.oauthProviders.includes(id)
      ? b.oauthProviders.filter((p) => p !== id)
      : [...b.oauthProviders, id];
    useCollectStore.getState().replaceDraft(slug, {
      ...config,
      behavior: { ...b, oauthProviders: next },
    });
  };

  return (
    <div data-slot="behavior-panel" className="divide-y divide-border/60">
      <Section title="Submission rules">
        <ToggleRow
          label="Allow anonymous submissions"
          description="Don't require login before submitting."
          checked={b.allowAnonymous}
          onCheckedChange={(v) =>
            update(slug, { behavior: { allowAnonymous: v } })
          }
        />

        <div className="flex flex-col gap-1.5 rounded-md border border-border/70 bg-muted/30 px-3 py-2.5">
          <Label className="text-xs font-medium text-foreground">
            Social verification
          </Label>
          <p className="text-[10px] leading-snug text-muted-foreground">
            Let respondents prove identity with a provider login.
          </p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {PROVIDERS.map((p) => {
              const active = b.oauthProviders.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggleProvider(p.id)}
                  data-testid={`provider-${p.id}`}
                  aria-pressed={active}
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-[10px] font-medium transition-colors",
                    active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:bg-muted"
                  )}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        <ToggleRow
          label="Fingerprint opt-out"
          description="Let respondents disable anti-duplicate fingerprinting."
          checked={b.allowFingerprintOptOut}
          onCheckedChange={(v) =>
            update(slug, { behavior: { allowFingerprintOptOut: v } })
          }
        />
      </Section>

      <SectionDivider />

      <Section title="Notifications">
        <ToggleRow
          label="Notify on submission"
          description="Email you when a testimonial arrives."
          checked={b.notifyOnSubmission}
          onCheckedChange={(v) =>
            update(slug, { behavior: { notifyOnSubmission: v } })
          }
        />
      </Section>

      <SectionDivider />

      <Section
        title="Moderation"
        description="How incoming testimonials are reviewed."
      >
        <RadioGroup
          value={b.moderation}
          onValueChange={(v) =>
            update(slug, {
              behavior: { moderation: v as ModerationMode },
            })
          }
          className="gap-1.5"
        >
          <label className="flex items-start gap-2 rounded-md border border-border/70 px-3 py-2 text-xs">
            <RadioGroupItem value="auto" id="mod-auto" />
            <div className="flex-1">
              <span className="font-medium text-foreground">
                Auto-approve
              </span>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                Publish clean submissions instantly.
              </p>
            </div>
          </label>
          <label className="flex items-start gap-2 rounded-md border border-border/70 px-3 py-2 text-xs">
            <RadioGroupItem value="manual" id="mod-manual" />
            <div className="flex-1">
              <span className="font-medium text-foreground">
                Manual review
              </span>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                Hold every submission until you approve it.
              </p>
            </div>
          </label>
        </RadioGroup>
      </Section>
    </div>
  );
}
