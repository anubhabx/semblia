import * as React from "react";
import { AppTopbar } from "@/components/nav/app-topbar";
import { OnboardingGate } from "@/components/onboarding/onboarding-gate";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <AppTopbar />
      <div className="flex flex-1 flex-col">
        <OnboardingGate>{children}</OnboardingGate>
      </div>
    </div>
  );
}
