"use client";

import { ArrowRight, Ear } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { AuthField } from "@/components/auth/auth-field";
import { AuthPrimaryBtn } from "@/components/auth/auth-primary-btn";
import { ProgressDots } from "@/components/onboarding/progress-dots";
import { TOTAL_STEPS, STEP_INDEX, REFERRAL_SOURCES } from "./constants";

interface ReferralStepProps {
  referralSource: string;
  referralOther: string;
  setReferralSource: (v: string) => void;
  setReferralOther: (v: string) => void;
  onContinue: () => void;
  onSkip: () => void;
}

export function ReferralStep({
  referralSource,
  referralOther,
  setReferralSource,
  setReferralOther,
  onContinue,
  onSkip,
}: ReferralStepProps) {
  const isValid =
    referralSource && (referralSource !== "other" || referralOther.trim());

  return (
    <div>
      <div className="mb-8">
        <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-brand/10">
          <Ear className="size-5 text-brand" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          How did you find us?
        </h1>
        <p className="mt-2 text-[14px] text-muted-foreground leading-relaxed max-w-[360px]">
          This helps us understand where our community comes from.
        </p>
      </div>

      <div className="space-y-2 mb-6">
        {REFERRAL_SOURCES.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setReferralSource(id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left",
              "transition-all duration-150",
              "ring-1",
              referralSource === id
                ? "ring-brand/40 bg-brand/5 text-foreground"
                : "ring-foreground/[0.06] bg-card text-muted-foreground hover:ring-foreground/[0.12] hover:bg-muted/40",
            )}
          >
            <Icon
              className={cn(
                "size-4 shrink-0",
                referralSource === id ? "text-brand" : "text-muted-foreground",
              )}
            />
            <span className="text-[13px] font-medium">{label}</span>
          </button>
        ))}
      </div>

      {referralSource === "other" && (
        <div className="mb-6 auth-notice-in">
          <AuthField
            id="onboard-referral-other"
            label="Tell us more"
            value={referralOther}
            onChange={setReferralOther}
            placeholder="How did you hear about Tresta?"
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

      <ProgressDots current={STEP_INDEX.referral} total={TOTAL_STEPS} />
    </div>
  );
}
