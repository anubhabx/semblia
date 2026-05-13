"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useLiveQueryState } from "@/hooks/use-live-query-state";
import { Spinner } from "@/components/ui/spinner";

const WELCOME_PATH = "/welcome";
const FALLBACK_PATH = "/projects";

export function OnboardingGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const currentUser = useCurrentUser({ freshOnMount: true });
  const liveState = useLiveQueryState(currentUser, {
    requireFreshOnMount: true,
  });

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

  if (liveState.isWaitingForLiveData) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        <Spinner className="size-4" />
      </div>
    );
  }

  return <>{children}</>;
}
