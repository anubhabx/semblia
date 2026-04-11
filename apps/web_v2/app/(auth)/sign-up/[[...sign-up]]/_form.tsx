"use client";

import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { errMsg } from "@/components/auth/clerk-error";
import { AuthField } from "@/components/auth/auth-field";
import { AuthPasswordField } from "@/components/auth/auth-password-field";
import { AuthPrimaryBtn } from "@/components/auth/auth-primary-btn";
import { AuthSocialButtons } from "@/components/auth/auth-social-buttons";
import { AuthDivider } from "@/components/auth/auth-divider";
import { AuthNotice } from "@/components/auth/auth-notice";
import { AuthBackBtn } from "@/components/auth/auth-back-btn";
import { useAnimatedStep } from "@/hooks/use-animated-step";

type Step = "details" | "verify";

export function SignUpForm() {
  const { signUp, fetchStatus } = useSignUp();
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);
  const { activeStep, isLeaving, direction, go, isFirstRender } =
    useAnimatedStep<Step>("details");

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

  useEffect(() => {
    const t = setTimeout(() => emailRef.current?.focus(), 200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!resendCooldown) return;
    setResendTimer(30);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) { clearInterval(interval); setResendCooldown(false); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  async function handleDetails(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setLoading(true);
    setError(null);
    const { error: createErr } = await signUp.password({ emailAddress: email, password });
    if (createErr) { setError(errMsg(createErr)); setLoading(false); return; }
    const { error: sendErr } = await signUp.verifications.sendEmailCode();
    if (sendErr) { setError(errMsg(sendErr)); setLoading(false); return; }
    setLoading(false);
    go("verify", "forward");
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (loading || otp.length !== 6) return;
    setLoading(true);
    setError(null);
    const { error: verifyErr } = await signUp.verifications.verifyEmailCode({ code: otp });
    if (verifyErr) { setError(errMsg(verifyErr)); setLoading(false); return; }
    if (signUp.status === "complete") {
      const { error: finalErr } = await signUp.finalize({
        navigate: () => router.push("/welcome"),
      });
      if (finalErr) { setError(errMsg(finalErr)); setLoading(false); }
    } else {
      setError("Verification incomplete. Please try again.");
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendCooldown) return;
    setError(null);
    const { error: sendErr } = await signUp.verifications.sendEmailCode();
    if (sendErr) { setError(errMsg(sendErr)); return; }
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
    if (ssoErr) { setError(errMsg(ssoErr)); setOauthLoading(null); }
  }

  function handleBack() {
    setError(null);
    setOtp("");
    go("details", "back");
  }

  const enterCls = isFirstRender
    ? "auth-form-enter"
    : direction === "forward"
      ? "step-enter-forward"
      : "step-enter-back";
  const exitCls =
    direction === "forward" ? "step-exit-forward" : "step-exit-back";

  return (
    <div
      key={activeStep}
      className={cn("w-full", isLeaving ? exitCls : enterCls)}
    >
      {activeStep === "verify" ? (
        /* ── Verify step ── */
        <>
          <AuthBackBtn onClick={handleBack} className="mb-8" />

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

          <form onSubmit={handleVerify} className="space-y-5">
            <div className="space-y-2.5">
              <label className="text-[13px] font-medium text-foreground">
                Verification code
              </label>
              <InputOTP maxLength={6} value={otp} onChange={setOtp} autoFocus>
                <InputOTPGroup>
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <InputOTPSlot key={i} index={i} className="size-11 text-base" />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            <AuthNotice error={error} />
            <AuthPrimaryBtn
              type="submit"
              loading={loading}
              loadingLabel="Verifying…"
              disabled={loading || otp.length !== 6}
            >
              Verify email
            </AuthPrimaryBtn>
          </form>

          <p className="mt-6 text-center text-[13px] text-muted-foreground">
            Didn&apos;t receive it?{" "}
            <button
              type="button"
              onClick={handleResend}
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
        </>
      ) : (
        /* ── Details step ── */
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
            onGoogle={() => handleOAuth("oauth_google")}
            onGithub={() => handleOAuth("oauth_github")}
            loadingProvider={oauthLoading}
            disabled={busy}
          />

          <AuthDivider />

          <form onSubmit={handleDetails} noValidate className="space-y-4">
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
              onToggleShow={() => setShowPwd((v) => !v)}
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
      )}
    </div>
  );
}
