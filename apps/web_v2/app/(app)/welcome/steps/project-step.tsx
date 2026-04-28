"use client";

import * as React from "react";
import { ArrowRight, Folder } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { AuthField } from "@/components/auth/auth-field";
import { AuthPrimaryBtn } from "@/components/auth/auth-primary-btn";
import { ProgressDots } from "@/components/onboarding/progress-dots";
import { TOTAL_STEPS, STEP_INDEX, SUGGESTIONS } from "./constants";

interface ProjectStepProps {
  projectName: string;
  setProjectName: (v: string) => void;
  loading: boolean;
  onContinue: () => void;
  onSkip: () => void;
}

export function ProjectStep({
  projectName,
  setProjectName,
  loading,
  onContinue,
  onSkip,
}: ProjectStepProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div>
      <div className="mb-8">
        <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-brand/10">
          <Folder className="size-5 text-brand" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Create your first project
        </h1>
        <p className="mt-2 text-[14px] text-muted-foreground leading-relaxed max-w-[360px]">
          A project organizes your testimonials. Name it after your product,
          service, or brand.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onContinue();
        }}
        className="space-y-4"
      >
        <AuthField
          id="onboard-project"
          label="Project name"
          value={projectName}
          onChange={setProjectName}
          placeholder="e.g. Acme SaaS"
          required
          maxLength={48}
          inputRef={inputRef}
        />

        {/* Quick suggestions */}
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setProjectName(s)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150",
                "ring-1",
                projectName === s
                  ? "ring-brand/40 bg-brand/5 text-foreground"
                  : "ring-foreground/[0.06] bg-card text-muted-foreground hover:ring-foreground/[0.12] hover:bg-muted/40",
              )}
            >
              {s}
            </button>
          ))}
        </div>

        <AuthPrimaryBtn
          type="submit"
          loading={loading}
          loadingLabel="Creating project…"
          disabled={!projectName.trim() || loading}
        >
          Create project
          <ArrowRight className="size-4" />
        </AuthPrimaryBtn>
      </form>

      <button
        onClick={onSkip}
        className="w-full mt-4 text-center text-[13px] text-muted-foreground hover:text-foreground transition-colors duration-150 py-1"
      >
        I&apos;ll do this later
      </button>

      <ProgressDots current={STEP_INDEX.project} total={TOTAL_STEPS} />
    </div>
  );
}
