"use client";

import * as React from "react";

/**
 * Records the currently-open project slug in a cookie so the app can land the
 * user back on it next time (Clerk-style "last organization"). Read server-side
 * in `app/page.tsx`. Renders nothing.
 */
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export function RememberLastProject({ slug }: { slug: string }) {
  React.useEffect(() => {
    document.cookie = `last_project=${encodeURIComponent(
      slug,
    )}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax`;
  }, [slug]);

  return null;
}
