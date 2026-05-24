"use client";

import * as React from "react";
import { ArrowRight } from "@phosphor-icons/react";
import { AuthField, authInputCls } from "@/components/auth/auth-field";
import { AuthPrimaryBtn } from "@/components/auth/auth-primary-btn";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { StepFrame, StepSkipButton } from "../_step-frame";
import {
  JOB_TITLE_OPTIONS,
  JOB_TITLE_OTHER,
  stepDescriptor,
} from "./constants";

interface ProfileStepProps {
  firstName: string;
  lastName: string;
  jobTitle: string;
  setFirstName: (v: string) => void;
  setLastName: (v: string) => void;
  setJobTitle: (v: string) => void;
  loading: boolean;
  onContinue: () => void;
  onSkip: () => void;
}

const descriptor = stepDescriptor("profile");
const PRESET_JOB_IDS = new Set(JOB_TITLE_OPTIONS.map((o) => o.id));

export function ProfileStep({
  firstName,
  lastName,
  jobTitle,
  setFirstName,
  setLastName,
  setJobTitle,
  loading,
  onContinue,
  onSkip,
}: ProfileStepProps) {
  const firstNameRef = React.useRef<HTMLInputElement>(null);
  const jobOtherRef = React.useRef<HTMLInputElement>(null);

  // If the stored job title doesn't match a preset, land on "Other" with the
  // existing text preserved in the free-text input.
  const [jobSelection, setJobSelection] = React.useState<string>(() => {
    if (!jobTitle.trim()) return "";
    return PRESET_JOB_IDS.has(jobTitle) ? jobTitle : JOB_TITLE_OTHER;
  });

  React.useEffect(() => {
    const t = setTimeout(() => {
      if (!firstName.trim()) firstNameRef.current?.focus();
    }, 300);
    return () => clearTimeout(t);
  }, [firstName]);

  function handleSelectChange(next: string) {
    setJobSelection(next);
    if (next === JOB_TITLE_OTHER) {
      // Don't carry a preset label into the free-text input.
      if (PRESET_JOB_IDS.has(jobTitle)) setJobTitle("");
      // Defer focus until the input has mounted.
      setTimeout(() => jobOtherRef.current?.focus(), 0);
    } else {
      setJobTitle(next);
    }
  }

  const greeting = firstName.trim()
    ? `Glad you're here, ${firstName.trim().split(/\s+/)[0]}.`
    : "Glad you're here.";

  return (
    <StepFrame
      ordinal={descriptor.ordinal}
      title={greeting}
      description="A name and a role help us personalize what you see and how teammates recognize your work later."
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onContinue();
        }}
        className="space-y-4"
      >
        <div className="grid grid-cols-2 gap-2.5">
          <AuthField
            id="onboard-firstname"
            label="First name"
            value={firstName}
            onChange={setFirstName}
            placeholder="Ada"
            required
            autoComplete="given-name"
            inputRef={firstNameRef}
          />
          <AuthField
            id="onboard-lastname"
            label="Last name"
            value={lastName}
            onChange={setLastName}
            placeholder="Lovelace"
            autoComplete="family-name"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="onboard-jobtitle"
            className="text-[13px] font-medium text-foreground"
          >
            What you do
          </label>
          <Select value={jobSelection} onValueChange={handleSelectChange}>
            <SelectTrigger
              id="onboard-jobtitle"
              className={cn(
                authInputCls,
                "h-10 py-0 pr-3 font-normal data-[size=default]:h-10",
              )}
            >
              <SelectValue placeholder="Pick the closest role…" />
            </SelectTrigger>
            <SelectContent>
              {JOB_TITLE_OPTIONS.map((opt) => (
                <SelectItem key={opt.id} value={opt.id}>
                  {opt.label}
                </SelectItem>
              ))}
              <SelectItem value={JOB_TITLE_OTHER}>Something else</SelectItem>
            </SelectContent>
          </Select>
          {jobSelection === JOB_TITLE_OTHER ? (
            <div className="auth-notice-in pt-1.5">
              <input
                ref={jobOtherRef}
                id="onboard-jobtitle-other"
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="What should we call your role?"
                autoComplete="organization-title"
                maxLength={80}
                className={authInputCls}
                aria-label="Custom role"
              />
            </div>
          ) : (
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Optional. Helps us tune the defaults to your workflow.
            </p>
          )}
        </div>

        <AuthPrimaryBtn
          type="submit"
          loading={loading}
          loadingLabel="Saving…"
          disabled={!firstName.trim() || loading}
        >
          Continue
          <ArrowRight className="size-4" />
        </AuthPrimaryBtn>
      </form>

      <StepSkipButton onClick={onSkip} label="I'll come back to this" />
    </StepFrame>
  );
}
