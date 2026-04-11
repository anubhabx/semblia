"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  ArrowRight,
  Sparkles,
  MessageSquareText,
  PuzzleIcon,
  BarChart3,
  Check,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthField } from "@/components/auth/auth-field";
import { AuthPrimaryBtn } from "@/components/auth/auth-primary-btn";
import { AuthBackBtn } from "@/components/auth/auth-back-btn";
import { ProgressDots } from "@/components/onboarding/progress-dots";
import { useAnimatedStep } from "@/hooks/use-animated-step";

type OnboardStep = "name" | "welcome" | "project" | "ready";
const TOTAL_STEPS = 4;

const VALUE_PROPS = [
  {
    icon: MessageSquareText,
    title: "Collect",
    desc: "Gather testimonials via customizable forms with automatic follow-ups.",
  },
  {
    icon: PuzzleIcon,
    title: "Curate",
    desc: "Review, moderate, and organize feedback from one clean inbox.",
  },
  {
    icon: BarChart3,
    title: "Convert",
    desc: "Embed widgets that turn social proof into measurable growth.",
  },
];

const SUGGESTIONS = ["My SaaS", "Client Work", "Agency Portfolio", "Personal Brand"];

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
      await user?.update({ firstName: firstName.trim(), lastName: lastName.trim() });
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
  const exitCls = direction === "forward" ? "onboard-exit-fwd" : "onboard-exit-rev";

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

// ── Step 0: Name collection ───────────────────────────────────────────────────

function NameStep({
  firstName,
  lastName,
  setFirstName,
  setLastName,
  loading,
  onContinue,
  onSkip,
}: {
  firstName: string;
  lastName: string;
  setFirstName: (v: string) => void;
  setLastName: (v: string) => void;
  loading: boolean;
  onContinue: () => void;
  onSkip: () => void;
}) {
  const firstNameRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const t = setTimeout(() => firstNameRef.current?.focus(), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div>
      <div className="mb-8">
        <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-brand/10">
          <User className="size-5 text-brand" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Let&apos;s personalize your experience
        </h1>
        <p className="mt-2 text-[14px] text-muted-foreground leading-relaxed max-w-[360px]">
          Tell us your name so we know what to call you across Tresta.
        </p>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); onContinue(); }}
        className="space-y-4"
      >
        <div className="grid grid-cols-2 gap-2.5">
          <AuthField
            id="onboard-firstname"
            label="First name"
            value={firstName}
            onChange={setFirstName}
            placeholder="Ada"
            required
            autoComplete="given-name"
            inputRef={firstNameRef}
          />
          <AuthField
            id="onboard-lastname"
            label="Last name"
            value={lastName}
            onChange={setLastName}
            placeholder="Lovelace"
            autoComplete="family-name"
          />
        </div>

        <AuthPrimaryBtn
          type="submit"
          loading={loading}
          loadingLabel="Saving…"
          disabled={!firstName.trim() || loading}
        >
          Continue
          <ArrowRight className="size-4" />
        </AuthPrimaryBtn>
      </form>

      <button
        onClick={onSkip}
        className="w-full mt-4 text-center text-[13px] text-muted-foreground hover:text-foreground transition-colors duration-150 py-1"
      >
        I&apos;ll do this later
      </button>

      <ProgressDots current={0} total={TOTAL_STEPS} />
    </div>
  );
}

// ── Step 1: Welcome ───────────────────────────────────────────────────────────

function WelcomeStep({
  firstName,
  onContinue,
  onSkip,
}: {
  firstName: string;
  onContinue: () => void;
  onSkip: () => void;
}) {
  return (
    <div>
      <div className="mb-8">
        <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-brand/10">
          <Sparkles className="size-5 text-brand" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Welcome, {firstName}
        </h1>
        <p className="mt-2 text-[14px] text-muted-foreground leading-relaxed max-w-[360px]">
          You&apos;re a few steps away from collecting testimonials that build
          trust and drive growth.
        </p>
      </div>

      <div className="space-y-3 mb-8">
        {VALUE_PROPS.map((prop, i) => (
          <div
            key={prop.title}
            className="flex items-start gap-3.5 rounded-xl p-3.5 ring-1 ring-foreground/[0.06] bg-card onboard-fade-in"
            style={{ animationDelay: `${200 + i * 100}ms` }}
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <prop.icon className="size-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-foreground">{prop.title}</p>
              <p className="text-[12px] text-muted-foreground leading-relaxed mt-0.5">
                {prop.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <AuthPrimaryBtn onClick={onContinue}>
          Get started
          <ArrowRight className="size-4" />
        </AuthPrimaryBtn>
        <button
          onClick={onSkip}
          className="w-full text-center text-[13px] text-muted-foreground hover:text-foreground transition-colors duration-150 py-1"
        >
          I&apos;ll explore on my own
        </button>
      </div>

      <ProgressDots current={1} total={TOTAL_STEPS} />
    </div>
  );
}

// ── Step 2: Create first project ──────────────────────────────────────────────

function ProjectStep({
  projectName,
  setProjectName,
  creating,
  onSubmit,
  onSkip,
  onBack,
}: {
  projectName: string;
  setProjectName: (v: string) => void;
  creating: boolean;
  onSubmit: () => void;
  onSkip: () => void;
  onBack: () => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(t);
  }, []);

  function handleSuggestion(name: string) {
    setProjectName(name);
    inputRef.current?.focus();
  }

  return (
    <div>
      <AuthBackBtn onClick={onBack} className="mb-7" />

      <div className="mb-7">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Name your first project
        </h1>
        <p className="mt-1.5 text-[13px] text-muted-foreground leading-relaxed">
          A project groups testimonials for a product, service, or brand.
          You can always rename it later.
        </p>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
        className="space-y-4"
      >
        <div className="space-y-2">
          <AuthField
            id="onboard-project-name"
            label="Project name"
            value={projectName}
            onChange={setProjectName}
            placeholder="e.g. My SaaS Product"
            required
            maxLength={60}
            inputRef={inputRef}
          />
          <div className="flex flex-wrap gap-1.5 pt-1">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleSuggestion(s)}
                className={cn(
                  "px-2 py-0.5 rounded-md text-[11px] font-medium transition-all duration-150",
                  projectName === s
                    ? "bg-brand/12 text-brand ring-1 ring-brand/20"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <AuthPrimaryBtn
          type="submit"
          loading={creating}
          loadingLabel="Creating…"
          disabled={!projectName.trim() || creating}
        >
          Create project
          <ArrowRight className="size-4" />
        </AuthPrimaryBtn>
      </form>

      <button
        onClick={onSkip}
        className="w-full mt-4 text-center text-[13px] text-muted-foreground hover:text-foreground transition-colors duration-150 py-1"
      >
        Skip for now
      </button>

      <ProgressDots current={2} total={TOTAL_STEPS} />
    </div>
  );
}

// ── Step 3: Ready / Success ───────────────────────────────────────────────────

function ReadyStep({
  projectName,
  onGoToProject,
}: {
  projectName: string;
  onGoToProject: () => void;
}) {
  return (
    <div className="text-center">
      <div className="mb-6 flex justify-center">
        <div className="check-pop flex size-14 items-center justify-center rounded-full bg-success/10">
          <Check className="size-7 text-success" strokeWidth={2.5} />
        </div>
      </div>

      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        You&apos;re all set
      </h1>
      <p className="mt-2 mx-auto text-[14px] text-muted-foreground leading-relaxed max-w-[320px]">
        <span className="font-medium text-foreground">{projectName}</span> is
        ready. Your next step: set up a collection form or embed a widget.
      </p>

      <div className="mt-8 space-y-2.5 text-left">
        {[
          {
            icon: MessageSquareText,
            label: "Create a collection form",
            desc: "Share a link that collects testimonials from your customers",
          },
          {
            icon: PuzzleIcon,
            label: "Add a widget to your site",
            desc: "Embed a testimonial Wall of Love or carousel",
          },
        ].map((tip, i) => (
          <div
            key={tip.label}
            className="flex items-start gap-3 rounded-xl p-3.5 ring-1 ring-foreground/[0.06] bg-card onboard-fade-in"
            style={{ animationDelay: `${300 + i * 120}ms` }}
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand/8">
              <tip.icon className="size-4 text-brand" />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-foreground">{tip.label}</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                {tip.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      <AuthPrimaryBtn onClick={onGoToProject} className="mt-7">
        Go to your project
        <ArrowRight className="size-4" />
      </AuthPrimaryBtn>

      <ProgressDots current={3} total={TOTAL_STEPS} />
    </div>
  );
}
