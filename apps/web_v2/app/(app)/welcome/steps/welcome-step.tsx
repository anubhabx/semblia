"use client";

import { ArrowRight, Sparkle as Sparkles } from "@phosphor-icons/react";
import { AuthPrimaryBtn } from "@/components/auth/auth-primary-btn";
import { ProgressDots } from "@/components/onboarding/progress-dots";
import { VALUE_PROPS, TOTAL_STEPS } from "./constants";

interface WelcomeStepProps {
  firstName: string;
  onContinue: () => void;
  onSkip: () => void;
}

export function WelcomeStep({ firstName, onContinue, onSkip }: WelcomeStepProps) {
  return (
    <div>
      <div className="mb-8">
        <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-brand/10">
          <Sparkles className="size-5 text-brand" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Welcome, {firstName}
        </h1>
        <p className="mt-2 text-[14px] text-muted-foreground leading-relaxed max-w-[360px]">
          You&apos;re a few steps away from collecting testimonials that build
          trust and drive growth.
        </p>
      </div>

      <div className="space-y-3 mb-8">
        {VALUE_PROPS.map((prop, i) => (
          <div
            key={prop.title}
            className="flex items-start gap-3.5 rounded-xl p-3.5 ring-1 ring-foreground/[0.06] bg-card onboard-fade-in"
            style={{ animationDelay: `${200 + i * 100}ms` }}
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <prop.icon className="size-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-foreground">
                {prop.title}
              </p>
              <p className="text-[12px] text-muted-foreground leading-relaxed mt-0.5">
                {prop.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <AuthPrimaryBtn onClick={onContinue}>
          Get started
          <ArrowRight className="size-4" />
        </AuthPrimaryBtn>
        <button
          onClick={onSkip}
          className="w-full text-center text-[13px] text-muted-foreground hover:text-foreground transition-colors duration-150 py-1"
        >
          I&apos;ll explore on my own
        </button>
      </div>

      <ProgressDots current={1} total={TOTAL_STEPS} />
    </div>
  );
}
