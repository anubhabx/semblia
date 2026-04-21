"use client";

import * as React from "react";
import { ArrowRight, User } from "@phosphor-icons/react";
import { AuthField } from "@/components/auth/auth-field";
import { AuthPrimaryBtn } from "@/components/auth/auth-primary-btn";
import { ProgressDots } from "@/components/onboarding/progress-dots";
import { TOTAL_STEPS } from "./constants";

interface NameStepProps {
  firstName: string;
  lastName: string;
  setFirstName: (v: string) => void;
  setLastName: (v: string) => void;
  loading: boolean;
  onContinue: () => void;
  onSkip: () => void;
}

export function NameStep({
  firstName,
  lastName,
  setFirstName,
  setLastName,
  loading,
  onContinue,
  onSkip,
}: NameStepProps) {
  const firstNameRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const t = setTimeout(() => firstNameRef.current?.focus(), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div>
      <div className="mb-8">
        <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-brand/10">
          <User className="size-5 text-brand" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Let&apos;s personalize your experience
        </h1>
        <p className="mt-2 text-[14px] text-muted-foreground leading-relaxed max-w-[360px]">
          Tell us your name so we know what to call you across Tresta.
        </p>
      </div>

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

      <button
        onClick={onSkip}
        className="w-full mt-4 text-center text-[13px] text-muted-foreground hover:text-foreground transition-colors duration-150 py-1"
      >
        I&apos;ll do this later
      </button>

      <ProgressDots current={0} total={TOTAL_STEPS} />
    </div>
  );
}
