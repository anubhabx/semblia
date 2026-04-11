"use client";

import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { errMsg } from "@/components/auth/clerk-error";
import { AuthField } from "@/components/auth/auth-field";
import { AuthPasswordField } from "@/components/auth/auth-password-field";
import { AuthPrimaryBtn } from "@/components/auth/auth-primary-btn";
import { AuthSocialButtons } from "@/components/auth/auth-social-buttons";
import { AuthDivider } from "@/components/auth/auth-divider";
import { AuthNotice } from "@/components/auth/auth-notice";

export function SignInForm() {
  const { signIn, fetchStatus } = useSignIn();
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const busy = loading || !!oauthLoading || fetchStatus === "fetching";

  useEffect(() => {
    const t = setTimeout(() => emailRef.current?.focus(), 200);
    return () => clearTimeout(t);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setLoading(true);
    setError(null);

    const { error: signInErr } = await signIn.password({
      identifier: email,
      password,
    });
    if (signInErr) {
      setError(errMsg(signInErr));
      setLoading(false);
      return;
    }

    if (signIn.status === "complete") {
      const { error: finalErr } = await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            console.log(session.currentTask);
            return;
          }
          const url = decorateUrl("/projects");
          if (url.startsWith("http")) window.location.href = url;
          else router.push(url);
        },
      });
      if (finalErr) {
        setError(errMsg(finalErr));
        setLoading(false);
      }
    } else if (signIn.status === "needs_second_factor") {
      setError("Multi-factor authentication is not yet supported.");
      setLoading(false);
    } else if (signIn.status === "needs_client_trust") {
      setError("Additional verification required. Please try again.");
      setLoading(false);
    } else {
      setError("Sign-in step incomplete. Please check your credentials.");
      setLoading(false);
    }
  }

  async function handleOAuth(strategy: "oauth_google" | "oauth_github") {
    if (busy) return;
    const key = strategy === "oauth_google" ? "google" : "github";
    setOauthLoading(key);
    setError(null);
    const { error: ssoErr } = await signIn.sso({
      strategy,
      redirectUrl: "/projects",
      redirectCallbackUrl: `${window.location.origin}/sso-callback`,
    });
    if (ssoErr) {
      setError(errMsg(ssoErr));
      setOauthLoading(null);
    }
  }

  return (
    <div className="w-full auth-form-enter">
      {/* ── Header ── */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Welcome back
        </h1>
        <p className="mt-1.5 text-[13px] text-muted-foreground leading-relaxed">
          Sign in to continue to your projects.
        </p>
      </div>

      <AuthSocialButtons
        onGoogle={() => handleOAuth("oauth_google")}
        onGithub={() => handleOAuth("oauth_github")}
        loadingProvider={oauthLoading}
        disabled={busy}
      />

      <AuthDivider />

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <AuthField
          id="signin-email"
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@company.com"
          autoComplete="email"
          required
          inputRef={emailRef}
        />
        <AuthPasswordField
          id="signin-password"
          value={password}
          onChange={setPassword}
          showPwd={showPwd}
          onToggleShow={() => setShowPwd((v) => !v)}
          required
          labelRight={
            <Link
              href="#"
              tabIndex={-1}
              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors duration-150"
            >
              Forgot password?
            </Link>
          }
        />
        <AuthNotice error={error} />
        <AuthPrimaryBtn
          type="submit"
          loading={loading}
          loadingLabel="Signing in…"
          disabled={busy}
        >
          Sign in
        </AuthPrimaryBtn>
      </form>

      <p className="mt-7 text-center text-[13px] text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/sign-up"
          className="text-foreground font-medium hover:text-brand transition-colors duration-150"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
