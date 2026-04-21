"use client";

import Link from "next/link";
import { AuthField } from "@/components/auth/auth-field";
import { AuthPasswordField } from "@/components/auth/auth-password-field";
import { AuthPrimaryBtn } from "@/components/auth/auth-primary-btn";
import { AuthSocialButtons } from "@/components/auth/auth-social-buttons";
import { AuthDivider } from "@/components/auth/auth-divider";
import { AuthNotice } from "@/components/auth/auth-notice";

interface DetailsStepProps {
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  showPwd: boolean;
  setShowPwd: (v: boolean) => void;
  loading: boolean;
  busy: boolean;
  error: string | null;
  oauthLoading: "google" | "github" | null;
  emailRef: React.RefObject<HTMLInputElement | null>;
  onSubmit: (e: React.FormEvent) => void;
  onOAuth: (strategy: "oauth_google" | "oauth_github") => void;
}

export function DetailsStep({
  email,
  setEmail,
  password,
  setPassword,
  showPwd,
  setShowPwd,
  loading,
  busy,
  error,
  oauthLoading,
  emailRef,
  onSubmit,
  onOAuth,
}: DetailsStepProps) {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Create your account
        </h1>
        <p className="mt-1.5 text-[13px] text-muted-foreground leading-relaxed">
          Start collecting testimonials in minutes.
        </p>
      </div>

      <AuthSocialButtons
        onGoogle={() => onOAuth("oauth_google")}
        onGithub={() => onOAuth("oauth_github")}
        loadingProvider={oauthLoading}
        disabled={busy}
      />

      <AuthDivider />

      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <AuthField
          id="signup-email"
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="ada@company.com"
          autoComplete="email"
          required
          inputRef={emailRef}
        />
        <AuthPasswordField
          id="signup-password"
          value={password}
          onChange={setPassword}
          showPwd={showPwd}
          onToggleShow={() => setShowPwd(!showPwd)}
          autoComplete="new-password"
          required
          showStrength
          placeholder="Min. 8 characters"
        />
        <AuthNotice error={error} />
        <AuthPrimaryBtn
          type="submit"
          loading={loading}
          loadingLabel="Creating account…"
          disabled={busy}
        >
          Create account
        </AuthPrimaryBtn>
      </form>

      <div id="clerk-captcha" />

      <p className="mt-4 text-center text-[11px] text-muted-foreground/60 leading-relaxed">
        By creating an account you agree to our{" "}
        <Link
          href="#"
          className="underline underline-offset-2 hover:text-muted-foreground transition-colors"
        >
          Terms
        </Link>{" "}
        and{" "}
        <Link
          href="#"
          className="underline underline-offset-2 hover:text-muted-foreground transition-colors"
        >
          Privacy Policy
        </Link>
      </p>

      <p className="mt-5 text-center text-[13px] text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="text-foreground font-medium hover:text-brand transition-colors duration-150"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
