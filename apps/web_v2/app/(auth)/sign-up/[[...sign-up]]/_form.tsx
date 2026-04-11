"use client";

import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Eye, EyeOff, ArrowLeft, AlertCircle, CheckCircle2, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

// ─── Helpers ─────────────────────────────────────────────────────────────────

type ClerkErr = { longMessage?: string; message: string } | null | undefined;

function errMsg(err: ClerkErr): string {
  if (!err) return "Something went wrong. Please try again.";
  return err.longMessage ?? err.message;
}

// ─── Password strength ────────────────────────────────────────────────────────

function passwordStrength(pwd: string): 0 | 1 | 2 | 3 {
  if (pwd.length === 0) return 0;
  if (pwd.length < 8) return 1;
  if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) return 3;
  return 2;
}

const STRENGTH_LABEL = { 1: "Weak", 2: "Fair", 3: "Strong" } as const;
const STRENGTH_COLOR = {
  1: "bg-destructive",
  2: "bg-warning",
  3: "bg-success",
} as const;
const STRENGTH_TEXT_COLOR = {
  1: "text-destructive",
  2: "text-warning",
  3: "text-success",
} as const;

// ─── Field primitives ─────────────────────────────────────────────────────────

const inputCls = cn(
  "w-full h-10 px-3.5 rounded-lg border border-input bg-card",
  "text-sm text-foreground placeholder:text-muted-foreground/60",
  "focus:outline-none focus:ring-2 focus:ring-brand/15 focus:border-brand/40",
  "transition-all duration-150",
  "auth-input-focus"
);

const primaryBtnCls = cn(
  "w-full h-10 rounded-lg bg-primary text-primary-foreground",
  "text-sm font-medium",
  "hover:opacity-90",
  "transition-all duration-150",
  "disabled:opacity-50 disabled:cursor-not-allowed",
  "auth-btn"
);

const socialBtnCls = cn(
  "flex items-center justify-center gap-2.5 h-10 rounded-lg",
  "border border-border bg-card text-foreground",
  "text-sm font-medium",
  "hover:bg-muted/70 hover:border-border/80",
  "transition-all duration-150",
  "disabled:opacity-60 disabled:cursor-not-allowed",
  "auth-btn"
);

// ─── Verify step ──────────────────────────────────────────────────────────────

interface VerifyStepProps {
  email: string;
  otp: string;
  setOtp: (v: string) => void;
  loading: boolean;
  error: string | null;
  resendCooldown: boolean;
  resendTimer: number;
  onSubmit: (e: React.FormEvent) => void;
  onResend: () => void;
  onBack: () => void;
}

function VerifyStep({
  email,
  otp,
  setOtp,
  loading,
  error,
  resendCooldown,
  resendTimer,
  onSubmit,
  onResend,
  onBack,
}: VerifyStepProps) {
  return (
    <div className="w-full max-w-[22rem] auth-step-enter">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors duration-150 mb-8 auth-btn"
      >
        <ArrowLeft size={13} />
        Back
      </button>

      {/* Inbox illustration */}
      <div className="mb-7">
        <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-brand/10">
          <Mail className="size-5 text-brand" />
        </div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Check your inbox
        </h1>
        <p className="mt-1.5 text-[13px] text-muted-foreground leading-relaxed">
          We sent a 6-digit code to{" "}
          <span className="font-medium text-foreground">{email}</span>
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2.5">
          <label className="text-[13px] font-medium text-foreground">
            Verification code
          </label>
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={setOtp}
            autoFocus
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} className="size-11 text-base" />
              <InputOTPSlot index={1} className="size-11 text-base" />
              <InputOTPSlot index={2} className="size-11 text-base" />
              <InputOTPSlot index={3} className="size-11 text-base" />
              <InputOTPSlot index={4} className="size-11 text-base" />
              <InputOTPSlot index={5} className="size-11 text-base" />
            </InputOTPGroup>
          </InputOTP>
        </div>

        {error && (
          <div className="auth-notice-in flex items-start gap-2 rounded-lg bg-destructive/8 border border-destructive/15 p-3">
            <AlertCircle className="size-3.5 shrink-0 text-destructive mt-0.5" />
            <p className="text-xs text-destructive leading-relaxed">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className={primaryBtnCls}
          id="signup-verify-submit"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Spinner />
              Verifying…
            </span>
          ) : (
            "Verify email"
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-[13px] text-muted-foreground">
        Didn&apos;t receive it?{" "}
        <button
          type="button"
          onClick={onResend}
          disabled={resendCooldown}
          className="text-foreground font-medium hover:text-brand transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {resendCooldown ? (
            <span className="tabular-nums">Resend in {resendTimer}s</span>
          ) : (
            "Resend code"
          )}
        </button>
      </p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type Step = "details" | "verify";

export function SignUpForm() {
  const { signUp, fetchStatus } = useSignUp();
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("details");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const [otp, setOtp] = useState("");
  const [resendCooldown, setResendCooldown] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const busy = loading || !!oauthLoading || fetchStatus === "fetching";
  const strength = passwordStrength(password);

  // Focus email input on mount
  useEffect(() => {
    const t = setTimeout(() => emailRef.current?.focus(), 200);
    return () => clearTimeout(t);
  }, []);

  // Resend countdown timer
  useEffect(() => {
    if (!resendCooldown) return;
    setResendTimer(30);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setResendCooldown(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Clerk v7: signUp.password({ emailAddress, password })
  // → signUp.verifications.sendEmailCode()
  // → signUp.verifications.verifyEmailCode({ code })
  // → signUp.finalize({ navigate })
  async function handleDetails(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setLoading(true);
    setError(null);

    const { error: createErr } = await signUp.password({
      emailAddress: email,
      password,
    });
    if (createErr) {
      setError(errMsg(createErr));
      setLoading(false);
      return;
    }

    const { error: sendErr } = await signUp.verifications.sendEmailCode();
    if (sendErr) {
      setError(errMsg(sendErr));
      setLoading(false);
      return;
    }

    setLoading(false);
    setStep("verify");
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (loading || otp.length !== 6) return;
    setLoading(true);
    setError(null);

    const { error: verifyErr } = await signUp.verifications.verifyEmailCode({
      code: otp,
    });
    if (verifyErr) {
      setError(errMsg(verifyErr));
      setLoading(false);
      return;
    }

    if (signUp.status === "complete") {
      const { error: finalErr } = await signUp.finalize({
        navigate: () => router.push("/welcome"),
      });
      if (finalErr) {
        setError(errMsg(finalErr));
        setLoading(false);
      }
      // navigate was called — component unmounts
    } else {
      setError("Verification incomplete. Please try again.");
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendCooldown) return;
    setError(null);
    const { error: sendErr } = await signUp.verifications.sendEmailCode();
    if (sendErr) {
      setError(errMsg(sendErr));
      return;
    }
    setResendCooldown(true);
  }

  async function handleOAuth(strategy: "oauth_google" | "oauth_github") {
    if (busy) return;
    const key = strategy === "oauth_google" ? "google" : "github";
    setOauthLoading(key);
    setError(null);

    const { error: ssoErr } = await signUp.sso({
      strategy,
      redirectUrl: "/welcome",
      redirectCallbackUrl: `${window.location.origin}/sso-callback`,
    });

    if (ssoErr) {
      setError(errMsg(ssoErr));
      setOauthLoading(null);
    }
  }

  function handleBack() {
    setStep("details");
    setError(null);
    setOtp("");
  }

  if (step === "verify") {
    return (
      <VerifyStep
        email={email}
        otp={otp}
        setOtp={setOtp}
        loading={loading}
        error={error}
        resendCooldown={resendCooldown}
        resendTimer={resendTimer}
        onSubmit={handleVerify}
        onResend={handleResend}
        onBack={handleBack}
      />
    );
  }

  return (
    <div className="w-full max-w-[22rem] auth-form-enter">
      {/* ── Header ── */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Create your account
        </h1>
        <p className="mt-1.5 text-[13px] text-muted-foreground leading-relaxed">
          Start collecting testimonials in minutes.
        </p>
      </div>

      {/* ── Social auth ── */}
      <div className="grid grid-cols-2 gap-2.5 mb-6">
        <button
          type="button"
          disabled={busy}
          onClick={() => handleOAuth("oauth_google")}
          className={socialBtnCls}
          id="signup-oauth-google"
        >
          {oauthLoading === "google" ? <Spinner /> : <GoogleIcon />}
          <span>Google</span>
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => handleOAuth("oauth_github")}
          className={socialBtnCls}
          id="signup-oauth-github"
        >
          {oauthLoading === "github" ? <Spinner /> : <GithubIcon />}
          <span>GitHub</span>
        </button>
      </div>

      {/* ── Divider ── */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-3 text-[11px] tracking-wide text-muted-foreground/70">
            or continue with email
          </span>
        </div>
      </div>

      {/* ── Details form ── */}
      <form onSubmit={handleDetails} noValidate className="space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <label
            htmlFor="signup-email"
            className="text-[13px] font-medium text-foreground"
          >
            Email
          </label>
          <input
            ref={emailRef}
            id="signup-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ada@company.com"
            required
            autoComplete="email"
            className={inputCls}
          />
        </div>

        {/* Password + strength */}
        <div className="space-y-1.5">
          <label
            htmlFor="signup-password"
            className="text-[13px] font-medium text-foreground"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="signup-password"
              type={showPwd ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              required
              autoComplete="new-password"
              className={cn(inputCls, "pr-10")}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPwd((v) => !v)}
              aria-label={showPwd ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors p-0.5"
            >
              {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {/* Strength meter */}
          {password.length > 0 && (
            <div className="space-y-1 pt-1">
              <div className="flex gap-1">
                {([1, 2, 3] as const).map((level) => (
                  <div
                    key={level}
                    className={cn(
                      "h-[3px] flex-1 rounded-full transition-all duration-300",
                      strength >= level ? STRENGTH_COLOR[level] : "bg-border"
                    )}
                  />
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                {strength === 3 && (
                  <CheckCircle2 className="size-3 text-success" />
                )}
                <p
                  className={cn(
                    "text-[11px]",
                    strength > 0
                      ? STRENGTH_TEXT_COLOR[strength as 1 | 2 | 3]
                      : "text-muted-foreground"
                  )}
                >
                  {STRENGTH_LABEL[strength as 1 | 2 | 3]}
                </p>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="auth-notice-in flex items-start gap-2 rounded-lg bg-destructive/8 border border-destructive/15 p-3">
            <AlertCircle className="size-3.5 shrink-0 text-destructive mt-0.5" />
            <p className="text-xs text-destructive leading-relaxed">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className={primaryBtnCls}
          id="signup-submit"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Spinner />
              Creating account…
            </span>
          ) : (
            "Create account"
          )}
        </button>
      </form>

      {/* ── Captcha for bot protection ── */}
      <div id="clerk-captcha" />

      {/* ── Terms ── */}
      <p className="mt-4 text-center text-[11px] text-muted-foreground/60 leading-relaxed">
        By creating an account you agree to our{" "}
        <Link href="#" className="underline underline-offset-2 hover:text-muted-foreground transition-colors">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="#" className="underline underline-offset-2 hover:text-muted-foreground transition-colors">
          Privacy Policy
        </Link>
      </p>

      {/* ── Footer ── */}
      <p className="mt-5 text-center text-[13px] text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="text-foreground font-medium hover:text-brand transition-colors duration-150"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

// ─── Icons ───────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg
      className="animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      width={14}
      height={14}
      aria-hidden
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        className="opacity-20"
      />
      <path
        className="opacity-70"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      aria-hidden
      fill="currentColor"
    >
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}
