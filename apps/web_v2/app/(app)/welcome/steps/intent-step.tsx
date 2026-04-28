"use client";

import { ArrowRight, Crosshair } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { AuthField } from "@/components/auth/auth-field";
import { AuthPrimaryBtn } from "@/components/auth/auth-primary-btn";
import { ProgressDots } from "@/components/onboarding/progress-dots";
import { TOTAL_STEPS, STEP_INDEX, INTENT_OPTIONS } from "./constants";

interface IntentStepProps {
  intents: string[];
  intentOther: string;
  setIntents: (v: string[]) => void;
  setIntentOther: (v: string) => void;
  onContinue: () => void;
  onSkip: () => void;
}

export function IntentStep({
  intents,
  intentOther,
  setIntents,
  setIntentOther,
  onContinue,
  onSkip,
}: IntentStepProps) {
  function toggle(id: string) {
    setIntents(
      intents.includes(id) ? intents.filter((x) => x !== id) : [...intents, id],
    );
  }

  const hasOther = intents.includes("other");
  const isValid = intents.length > 0 && (!hasOther || intentOther.trim());

  return (
    <div>
      <div className="mb-8">
        <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-brand/10">
          <Crosshair className="size-5 text-brand" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          What will you use Tresta for?
        </h1>
        <p className="mt-2 text-[14px] text-muted-foreground leading-relaxed max-w-[360px]">
          Select all that apply — this helps us tailor your workspace.
        </p>
      </div>

      <div className="space-y-2 mb-6">
        {INTENT_OPTIONS.map(({ id, label, Icon }) => {
          const selected = intents.includes(id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => toggle(id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left",
                "transition-all duration-150",
                "ring-1",
                selected
                  ? "ring-brand/40 bg-brand/5 text-foreground"
                  : "ring-foreground/[0.06] bg-card text-muted-foreground hover:ring-foreground/[0.12] hover:bg-muted/40",
              )}
            >
              <div
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded border transition-all duration-150",
                  selected ? "bg-brand border-brand" : "bg-card border-input",
                )}
              >
                {selected && (
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 12 12"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M2.5 6L5 8.5L9.5 3.5"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <Icon
                className={cn(
                  "size-4 shrink-0",
                  selected ? "text-brand" : "text-muted-foreground",
                )}
              />
              <span className="text-[13px] font-medium">{label}</span>
            </button>
          );
        })}
      </div>

      {hasOther && (
        <div className="mb-6 auth-notice-in">
          <AuthField
            id="onboard-intent-other"
            label="Tell us more"
            value={intentOther}
            onChange={setIntentOther}
            placeholder="What do you plan to use Tresta for?"
          />
        </div>
      )}

      <AuthPrimaryBtn onClick={onContinue} disabled={!isValid}>
        Continue
        <ArrowRight className="size-4" />
      </AuthPrimaryBtn>

      <button
        onClick={onSkip}
        className="w-full mt-4 text-center text-[13px] text-muted-foreground hover:text-foreground transition-colors duration-150 py-1"
      >
        Skip this step
      </button>

      <ProgressDots current={STEP_INDEX.intent} total={TOTAL_STEPS} />
    </div>
  );
}
