"use client";

import * as React from "react";
import { ArrowRight } from "@phosphor-icons/react";
import { AuthField } from "@/components/auth/auth-field";
import { AuthPrimaryBtn } from "@/components/auth/auth-primary-btn";
import { StepFrame } from "../_step-frame";
import { stepDescriptor } from "./constants";

interface ProfileStepProps {
  firstName: string;
  lastName: string;
  setFirstName: (v: string) => void;
  setLastName: (v: string) => void;
  loading: boolean;
  onContinue: () => void;
}

const descriptor = stepDescriptor("profile");

export function ProfileStep({
  firstName,
  lastName,
  setFirstName,
  setLastName,
  loading,
  onContinue,
}: ProfileStepProps) {
  const firstNameRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const t = setTimeout(() => {
      if (!firstName.trim()) firstNameRef.current?.focus();
    }, 300);
    return () => clearTimeout(t);
  }, [firstName]);

  const greeting = firstName.trim()
    ? `Glad you're here, ${firstName.trim().split(/\s+/)[0]}.`
    : "Glad you're here.";

  return (
    <StepFrame
      ordinal={descriptor.ordinal}
      title={greeting}
      description="Your name shows up on the work you share and how teammates recognize you later."
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
    </StepFrame>
  );
}
