"use client";

/**
 * FormsEmptyState — first-run hero for a project with no forms. Leads to the
 * intent picker, with the supported intents previewed as a quick visual cue.
 */

import { PlusIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { INTENT_ORDER, intentMeta } from "@/lib/forms/intents";

export function FormsEmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 px-6 py-20 text-center">
      <div className="flex items-center -space-x-2">
        {INTENT_ORDER.slice(0, 4).map((intent) => {
          const meta = intentMeta(intent);
          const Icon = meta.icon;
          return (
            <span
              key={intent}
              className={cn(
                "flex size-10 items-center justify-center rounded-xl border border-background shadow-sm",
                meta.accent,
              )}
            >
              <Icon className="size-5" weight="bold" aria-hidden />
            </span>
          );
        })}
      </div>

      <div className="space-y-1.5">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          Collect your first response
        </h2>
        <p className="mx-auto max-w-sm text-xs leading-relaxed text-muted-foreground">
          Forms are how you gather testimonials, reviews, and feedback. Pick an
          intent and we&rsquo;ll set up the fields, copy, and layout — ready to
          share or embed in minutes.
        </p>
      </div>

      <Button size="sm" className="gap-1.5 text-xs" onClick={onCreate}>
        <PlusIcon className="size-3.5" weight="bold" aria-hidden />
        Create a form
      </Button>
    </div>
  );
}
