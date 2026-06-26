"use client";

import { RouteError } from "@/components/shared";

/**
 * Finer boundary scoped to a single project. Project views are the most
 * data-heavy surfaces, so containing a failure here lets "Try again" re-render
 * just this subtree rather than the whole app.
 */
export default function ProjectError({
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
      homeHref="/projects"
      homeLabel="Back to projects"
    />
  );
}
