"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { useAnimatedStep } from "@/hooks/use-animated-step";

import type { OnboardStep } from "./steps/constants";
import { NameStep } from "./steps/name-step";
import { WelcomeStep } from "./steps/welcome-step";
import { ProjectStep } from "./steps/project-step";
import { ReadyStep } from "./steps/ready-step";

export function WelcomeFlow() {
  const { user } = useUser();
  const router = useRouter();
  const { activeStep, isLeaving, direction, go, isFirstRender } =
    useAnimatedStep<OnboardStep>("name", 200);

  const [projectName, setProjectName] = React.useState("");
  const [creating, setCreating] = React.useState(false);
  const [firstName, setFirstName] = React.useState(user?.firstName ?? "");
  const [lastName, setLastName] = React.useState(user?.lastName ?? "");
  const [nameLoading, setNameLoading] = React.useState(false);

  React.useEffect(() => {
    if (user?.firstName && !firstName) setFirstName(user.firstName);
    if (user?.lastName && !lastName) setLastName(user.lastName);
  }, [user?.firstName, user?.lastName]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    const done = localStorage.getItem("tresta:onboarding:done");
    if (done === "true") router.replace("/projects");
  }, [router]);

  const displayName = firstName || user?.firstName || "there";

  function handleSkip() {
    localStorage.setItem("tresta:onboarding:done", "true");
    router.push("/projects");
  }

  async function handleSaveName() {
    if (!firstName.trim()) return;
    setNameLoading(true);
    try {
      await user?.update({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
    } catch {
      // Continue — name can be updated later
    }
    setNameLoading(false);
    go("welcome", "forward");
  }

  async function handleCreateProject() {
    if (!projectName.trim() || creating) return;
    setCreating(true);
    await new Promise((r) => setTimeout(r, 800));
    localStorage.setItem("tresta:onboarding:done", "true");
    setCreating(false);
    go("ready", "forward");
  }

  const enterCls = isFirstRender
    ? "onboard-fade-in"
    : direction === "forward"
      ? "onboard-enter-fwd"
      : "onboard-enter-rev";
  const exitCls =
    direction === "forward" ? "onboard-exit-fwd" : "onboard-exit-rev";

  return (
    <div className="flex min-h-[calc(100svh-3.5rem)] items-center justify-center px-4 py-12">
      <div
        key={activeStep}
        className={cn("w-full max-w-md", isLeaving ? exitCls : enterCls)}
      >
        {activeStep === "name" && (
          <NameStep
            firstName={firstName}
            lastName={lastName}
            setFirstName={setFirstName}
            setLastName={setLastName}
            loading={nameLoading}
            onContinue={handleSaveName}
            onSkip={() => go("welcome", "forward")}
          />
        )}
        {activeStep === "welcome" && (
          <WelcomeStep
            firstName={displayName}
            onContinue={() => go("project", "forward")}
            onSkip={handleSkip}
          />
        )}
        {activeStep === "project" && (
          <ProjectStep
            projectName={projectName}
            setProjectName={setProjectName}
            creating={creating}
            onSubmit={handleCreateProject}
            onSkip={handleSkip}
            onBack={() => go("welcome", "back")}
          />
        )}
        {activeStep === "ready" && (
          <ReadyStep
            projectName={projectName}
            onGoToProject={() => {
              localStorage.setItem("tresta:onboarding:done", "true");
              router.push("/projects");
            }}
          />
        )}
      </div>
    </div>
  );
}
