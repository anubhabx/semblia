"use client";

import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Helpers ─────────────────────────────────────────────────────────────────

type ClerkErr = { longMessage?: string; message: string } | null | undefined;

function errMsg(err: ClerkErr): string {
  if (!err) return "Something went wrong. Please try again.";
  return err.longMessage ?? err.message;
}

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

// ─── Component ────────────────────────────────────────────────────────────────

export function SignInForm() {
  const { signIn, fetchStatus } = useSignIn();
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const busy = loading || !!oauthLoading || fetchStatus === "fetching";

  // Focus email input on mount
  useEffect(() => {
    const t = setTimeout(() => emailRef.current?.focus(), 200);
    return () => clearTimeout(t);
  }, []);

  // Clerk v7: signIn.password({ identifier, password })
  // → signIn.finalize({ navigate })
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
          // Handle session tasks
          if (session?.currentTask) {
            console.log(session?.currentTask);
            return;
          }

          const url = decorateUrl("/projects");
          if (url.startsWith("http")) {
            window.location.href = url;
          } else {
            router.push(url);
          }
        },
      });
      if (finalErr) {
        setError(errMsg(finalErr));
        setLoading(false);
      }
      // navigate was called — component unmounts
    } else if (signIn.status === "needs_second_factor") {
      // MFA flow — future enhancement
      setError("Multi-factor authentication is not yet supported.");
      setLoading(false);
    } else if (signIn.status === "needs_client_trust") {
      // Client trust flow — future enhancement
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

    // Only runs if redirect didn't happen (i.e., there was an error)
    if (ssoErr) {
      setError(errMsg(ssoErr));
      setOauthLoading(null);
    }
  }

  return (
    <div className="w-full max-w-[22rem] auth-form-enter">
      {/* ── Header ── */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Welcome back
        </h1>
        <p className="mt-1.5 text-[13px] text-muted-foreground leading-relaxed">
          Sign in to continue to your projects.
        </p>
      </div>

      {/* ── Social auth ── */}
      <div className="grid grid-cols-2 gap-2.5 mb-6">
        <button
          type="button"
          disabled={busy}
          onClick={() => handleOAuth("oauth_google")}
          className={socialBtnCls}
          id="signin-oauth-google"
        >
          {oauthLoading === "google" ? <Spinner /> : <GoogleIcon />}
          <span>Google</span>
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => handleOAuth("oauth_github")}
          className={socialBtnCls}
          id="signin-oauth-github"
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

      {/* ── Form ── */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="signin-email"
            className="text-[13px] font-medium text-foreground"
          >
            Email
          </label>
          <input
            ref={emailRef}
            id="signin-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            required
            autoComplete="email"
            className={inputCls}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="signin-password"
              className="text-[13px] font-medium text-foreground"
            >
              Password
            </label>
            <Link
              href="#"
              tabIndex={-1}
              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors duration-150"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="signin-password"
              type={showPwd ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
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
          id="signin-submit"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Spinner />
              Signing in…
            </span>
          ) : (
            "Sign in"
          )}
        </button>
      </form>

      {/* ── Footer ── */}
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
