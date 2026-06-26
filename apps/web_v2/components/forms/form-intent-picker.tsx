"use client";

/**
 * FormIntentPicker — modal for creating a new form.
 *
 * One step: pick an intent. The intent seeds the form's fields, copy, layout,
 * flow, and consent (forms-core `createFormTemplate`), so the author always
 * starts from a strong default — never a blank document (spec §3, §4).
 */

import type { V2FormIntent } from "@workspace/types";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { INTENT_ORDER, intentMeta } from "@/lib/forms/intents";

interface FormIntentPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (intent: V2FormIntent) => void;
  /** Disables the options while a create request is in flight. */
  pending?: boolean;
}

export function FormIntentPicker({
  open,
  onOpenChange,
  onCreate,
  pending = false,
}: FormIntentPickerProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[calc(100%-2rem)] gap-0 p-0 sm:max-w-lg"
        showCloseButton
      >
        <DialogHeader className="border-b border-border/60 px-6 py-4">
          <DialogTitle className="text-base font-semibold tracking-tight">
            Create a form
          </DialogTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            Pick what you&rsquo;re collecting. We&rsquo;ll set up the fields,
            copy, and layout — edit everything after.
          </p>
        </DialogHeader>

        <div
          className="grid grid-cols-1 gap-2.5 p-5"
          role="radiogroup"
          aria-label="Form intent"
        >
          {INTENT_ORDER.map((intent) => (
            <IntentOption
              key={intent}
              intent={intent}
              disabled={pending}
              onPick={onCreate}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function IntentOption({
  intent,
  disabled,
  onPick,
}: {
  intent: V2FormIntent;
  disabled: boolean;
  onPick: (intent: V2FormIntent) => void;
}) {
  const meta = intentMeta(intent);
  const Icon = meta.icon;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={false}
      disabled={disabled}
      onClick={() => onPick(intent)}
      className={cn(
        "group flex items-center gap-3.5 rounded-xl border border-border bg-card p-3.5 text-left",
        "transition-[border-color,transform] duration-150 ease-out",
        "hover:-translate-y-px hover:border-foreground/25 active:translate-y-0",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
        "disabled:pointer-events-none disabled:opacity-60",
      )}
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg",
          meta.accent,
        )}
      >
        <Icon className="size-4.5" weight="bold" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold tracking-tight text-foreground">
          {meta.label}
        </span>
        <span className="mt-0.5 block text-[11.5px] leading-snug text-muted-foreground">
          {meta.blurb}
        </span>
      </span>
    </button>
  );
}
