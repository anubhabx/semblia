"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

/**
 * After Google / GitHub OAuth, Clerk redirects here to exchange the token,
 * create the session, then forwards to `redirectUrlComplete` (/projects or /welcome).
 *
 * Shows a polished loading state instead of a blank screen.
 */
export default function SSOCallbackPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background">
      {/* Subtle branded loading indicator */}
      <div className="flex flex-col items-center gap-5 onboard-fade-in">
        {/* Tresta mark */}
        <div className="flex size-10 items-center justify-center rounded-xl bg-foreground text-background">
          <svg width="16" height="16" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path
              d="M7 1L13 4V10L7 13L1 10V4L7 1Z"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="0.5"
            />
          </svg>
        </div>

        {/* Spinner */}
        <div className="relative size-5">
          <svg
            className="animate-spin text-brand"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2.5"
              className="opacity-15"
            />
            <path
              className="opacity-80"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        </div>

        <p className="text-sm text-muted-foreground">
          Completing sign-in…
        </p>
      </div>

      {/* Clerk's callback handler (invisible) */}
      <AuthenticateWithRedirectCallback />
    </div>
  );
}
