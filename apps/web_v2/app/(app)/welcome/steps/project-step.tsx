"use client";

import * as React from "react";
import { ArrowRight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { AuthField } from "@/components/auth/auth-field";
import { AuthPrimaryBtn } from "@/components/auth/auth-primary-btn";
import { AuthBackBtn } from "@/components/auth/auth-back-btn";
import { ProgressDots } from "@/components/onboarding/progress-dots";
import { SUGGESTIONS, TOTAL_STEPS } from "./constants";

interface ProjectStepProps {
  projectName: string;
  setProjectName: (v: string) => void;
  creating: boolean;
  onSubmit: () => void;
  onSkip: () => void;
  onBack: () => void;
}

export function ProjectStep({
  projectName,
  setProjectName,
  creating,
  onSubmit,
  onSkip,
  onBack,
}: ProjectStepProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(t);
  }, []);

  function handleSuggestion(name: string) {
    setProjectName(name);
    inputRef.current?.focus();
  }

  return (
    <div>
      <AuthBackBtn onClick={onBack} className="mb-7" />

      <div className="mb-7">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Name your first project
        </h1>
        <p className="mt-1.5 text-[13px] text-muted-foreground leading-relaxed">
          A project groups testimonials for a product, service, or brand. You
          can always rename it later.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="space-y-4"
      >
        <div className="space-y-2">
          <AuthField
            id="onboard-project-name"
            label="Project name"
            value={projectName}
            onChange={setProjectName}
            placeholder="e.g. My SaaS Product"
            required
            maxLength={60}
            inputRef={inputRef}
          />
          <div className="flex flex-wrap gap-1.5 pt-1">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleSuggestion(s)}
                className={cn(
                  "px-2 py-0.5 rounded-md text-[11px] font-medium transition-all duration-150",
                  projectName === s
                    ? "bg-brand/12 text-brand ring-1 ring-brand/20"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <AuthPrimaryBtn
          type="submit"
          loading={creating}
          loadingLabel="Creating…"
          disabled={!projectName.trim() || creating}
        >
          Create project
          <ArrowRight className="size-4" />
        </AuthPrimaryBtn>
      </form>

      <button
        onClick={onSkip}
        className="w-full mt-4 text-center text-[13px] text-muted-foreground hover:text-foreground transition-colors duration-150 py-1"
      >
        Skip for now
      </button>

      <ProgressDots current={2} total={TOTAL_STEPS} />
    </div>
  );
}
