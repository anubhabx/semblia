"use client";

import { RouteError } from "@/components/shared";

/** Error boundary for the account area, rendered inside the account shell. */
export default function AccountError({
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
      homeHref="/account"
      homeLabel="Back to account"
    />
  );
}
