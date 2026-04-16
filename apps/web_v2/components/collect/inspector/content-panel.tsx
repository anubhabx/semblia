"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Section, SectionDivider } from "./primitives/section";
import { useCollectStore } from "@/lib/collect/form-config-store";
import type { FormConfig } from "@/lib/collect/types";

export function ContentPanel({
  slug,
  config,
}: {
  slug: string;
  config: FormConfig;
}) {
  const update = useCollectStore((s) => s.update);

  return (
    <div data-slot="content-panel" className="divide-y divide-border/60">
      <Section title="Header" description="Top of the form — what people see first.">
        <div className="flex flex-col gap-1">
          <Label htmlFor="headerTitle" className="text-[11px]">
            Title
          </Label>
          <Input
            id="headerTitle"
            value={config.content.headerTitle}
            onChange={(e) =>
              update(slug, { content: { headerTitle: e.target.value } })
            }
            className="h-8 text-xs"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="headerDescription" className="text-[11px]">
            Description
          </Label>
          <Textarea
            id="headerDescription"
            value={config.content.headerDescription}
            onChange={(e) =>
              update(slug, {
                content: { headerDescription: e.target.value },
              })
            }
            className="min-h-[56px] text-xs"
          />
        </div>
      </Section>

      <SectionDivider />

      <Section title="Submit button">
        <div className="flex flex-col gap-1">
          <Label htmlFor="submitButtonLabel" className="text-[11px]">
            Button label
          </Label>
          <Input
            id="submitButtonLabel"
            value={config.content.submitButtonLabel}
            onChange={(e) =>
              update(slug, {
                content: { submitButtonLabel: e.target.value },
              })
            }
            className="h-8 text-xs"
          />
        </div>
      </Section>

      <SectionDivider />

      <Section
        title="After submission"
        description="What the user sees once they've hit submit."
      >
        <RadioGroup
          value={config.content.successAction.kind}
          onValueChange={(v) =>
            update(slug, {
              content: {
                successAction:
                  v === "redirect"
                    ? {
                        kind: "redirect",
                        url:
                          config.content.successAction.kind === "redirect"
                            ? config.content.successAction.url
                            : "https://",
                      }
                    : { kind: "message" },
              },
            })
          }
          className="gap-1.5"
        >
          <label className="flex items-start gap-2 rounded-md border border-border/70 px-3 py-2 text-xs">
            <RadioGroupItem value="message" id="action-message" />
            <div className="flex-1">
              <span className="font-medium text-foreground">
                Show a thank-you message
              </span>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                Display confirmation text in-place.
              </p>
            </div>
          </label>
          <label className="flex items-start gap-2 rounded-md border border-border/70 px-3 py-2 text-xs">
            <RadioGroupItem value="redirect" id="action-redirect" />
            <div className="flex-1">
              <span className="font-medium text-foreground">
                Redirect to a URL
              </span>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                Send the user somewhere after submit.
              </p>
            </div>
          </label>
        </RadioGroup>

        {config.content.successAction.kind === "message" ? (
          <>
            <div className="flex flex-col gap-1">
              <Label htmlFor="thankYouTitle" className="text-[11px]">
                Thank-you title
              </Label>
              <Input
                id="thankYouTitle"
                value={config.content.thankYouTitle}
                onChange={(e) =>
                  update(slug, {
                    content: { thankYouTitle: e.target.value },
                  })
                }
                className="h-8 text-xs"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="thankYouMessage" className="text-[11px]">
                Thank-you message
              </Label>
              <Textarea
                id="thankYouMessage"
                value={config.content.thankYouMessage}
                onChange={(e) =>
                  update(slug, {
                    content: { thankYouMessage: e.target.value },
                  })
                }
                className="min-h-[56px] text-xs"
              />
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-1">
            <Label htmlFor="redirectUrl" className="text-[11px]">
              Redirect URL
            </Label>
            <Input
              id="redirectUrl"
              type="url"
              value={
                config.content.successAction.kind === "redirect"
                  ? config.content.successAction.url
                  : ""
              }
              onChange={(e) =>
                update(slug, {
                  content: {
                    successAction: { kind: "redirect", url: e.target.value },
                  },
                })
              }
              placeholder="https://example.com/thanks"
              className="h-8 text-xs"
            />
          </div>
        )}
      </Section>
    </div>
  );
}
