"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/use-current-user";

const WELCOME_PATH = "/welcome";
const FALLBACK_PATH = "/projects";

export function OnboardingGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const currentUser = useCurrentUser();

  React.useEffect(() => {
    const user = currentUser.data;
    if (!user) return;

    const isWelcome = pathname === WELCOME_PATH;
    if (!user.onboardingCompletedAt && !isWelcome) {
      router.replace(WELCOME_PATH);
      return;
    }

    if (user.onboardingCompletedAt && isWelcome) {
      router.replace(FALLBACK_PATH);
    }
  }, [currentUser.data, pathname, router]);

  return <>{children}</>;
}
