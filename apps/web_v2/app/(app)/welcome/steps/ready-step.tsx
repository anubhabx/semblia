"use client";

import {
  ArrowRight,
  ChatText as MessageSquareText,
  PuzzlePiece as PuzzleIcon,
  Check,
} from "@phosphor-icons/react";
import { AuthPrimaryBtn } from "@/components/auth/auth-primary-btn";
import { ProgressDots } from "@/components/onboarding/progress-dots";
import { TOTAL_STEPS } from "./constants";

interface ReadyStepProps {
  projectName: string;
  onGoToProject: () => void;
}

export function ReadyStep({ projectName, onGoToProject }: ReadyStepProps) {
  return (
    <div className="text-center">
      <div className="mb-6 flex justify-center">
        <div className="check-pop flex size-14 items-center justify-center rounded-full bg-success/10">
          <Check className="size-7 text-success" strokeWidth={2.5} />
        </div>
      </div>

      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        You&apos;re all set
      </h1>
      <p className="mt-2 mx-auto text-[14px] text-muted-foreground leading-relaxed max-w-[320px]">
        <span className="font-medium text-foreground">{projectName}</span> is
        ready. Your next step: set up a collection form or embed a widget.
      </p>

      <div className="mt-8 space-y-2.5 text-left">
        {[
          {
            icon: MessageSquareText,
            label: "Create a collection form",
            desc: "Share a link that collects testimonials from your customers",
          },
          {
            icon: PuzzleIcon,
            label: "Add a widget to your site",
            desc: "Embed a testimonial Wall of Love or carousel",
          },
        ].map((tip, i) => (
          <div
            key={tip.label}
            className="flex items-start gap-3 rounded-xl p-3.5 ring-1 ring-foreground/[0.06] bg-card onboard-fade-in"
            style={{ animationDelay: `${300 + i * 120}ms` }}
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand/8">
              <tip.icon className="size-4 text-brand" />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-foreground">
                {tip.label}
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                {tip.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      <AuthPrimaryBtn onClick={onGoToProject} className="mt-7">
        Go to your project
        <ArrowRight className="size-4" />
      </AuthPrimaryBtn>

      <ProgressDots current={3} total={TOTAL_STEPS} />
    </div>
  );
}
