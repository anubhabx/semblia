"use client";

import { RouteError } from "@/components/shared";

/** Error boundary for pre-auth pages (sign in / up, password reset). */
export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteError
      error={error}
      reset={reset}
      title="We couldn't load this page"
      description="Something went wrong on our end. Try again, or head back to sign in."
      homeHref="/sign-in"
      homeLabel="Back to sign in"
    />
  );
}
