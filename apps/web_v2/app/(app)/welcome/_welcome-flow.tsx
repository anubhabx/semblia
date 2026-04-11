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

// ── Step types ────────────────────────────────────────────────────────────────

type OnboardStep = "name" | "welcome" | "project" | "ready";
const TOTAL_STEPS = 4;

// ── Value proposition cards ───────────────────────────────────────────────────

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

// ── Project name suggestions ──────────────────────────────────────────────────

const SUGGESTIONS = [
  "My SaaS",
  "Client Work",
  "Agency Portfolio",
  "Personal Brand",
];

// ── Main flow ─────────────────────────────────────────────────────────────────

export function WelcomeFlow() {
  const { user } = useUser();
  const router = useRouter();

  const [step, setStep] = React.useState<OnboardStep>("name");
  const [projectName, setProjectName] = React.useState("");
  const [creating, setCreating] = React.useState(false);

  // Name state — pre-fill from Clerk user data (OAuth may already have these)
  const [firstName, setFirstName] = React.useState(user?.firstName ?? "");
  const [lastName, setLastName] = React.useState(user?.lastName ?? "");
  const [nameLoading, setNameLoading] = React.useState(false);

  // Sync when user object loads
  React.useEffect(() => {
    if (user?.firstName && !firstName) setFirstName(user.firstName);
    if (user?.lastName && !lastName) setLastName(user.lastName);
  }, [user?.firstName, user?.lastName]); // eslint-disable-line react-hooks/exhaustive-deps

  const displayName = firstName || user?.firstName || "there";

  // Check if user already completed onboarding
  React.useEffect(() => {
    const done = localStorage.getItem("tresta:onboarding:done");
    if (done === "true") {
      router.replace("/projects");
    }
  }, [router]);

  function handleSkip() {
    localStorage.setItem("tresta:onboarding:done", "true");
    router.push("/projects");
  }

  async function handleSaveName() {
    if (!firstName.trim()) return;
    setNameLoading(true);

    try {
      // Update Clerk user profile via useUser hook
      await user?.update({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
    } catch (err) {
      console.error("Failed to update profile:", err);
      // Continue anyway — name can be updated later
    }

    setNameLoading(false);
    setStep("welcome");
  }

  async function handleCreateProject() {
    if (!projectName.trim() || creating) return;
    setCreating(true);

    // Simulate project creation (will be replaced with real API)
    await new Promise((r) => setTimeout(r, 800));

    localStorage.setItem("tresta:onboarding:done", "true");
    setCreating(false);
    setStep("ready");
  }

  return (
    <div className="flex min-h-[calc(100svh-3.5rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {step === "name" && (
          <NameStep
            firstName={firstName}
            lastName={lastName}
            setFirstName={setFirstName}
            setLastName={setLastName}
            loading={nameLoading}
            onContinue={handleSaveName}
            onSkip={() => setStep("welcome")}
          />
        )}

        {step === "welcome" && (
          <WelcomeStep
            firstName={displayName}
            onContinue={() => setStep("project")}
            onSkip={handleSkip}
          />
        )}

        {step === "project" && (
          <ProjectStep
            projectName={projectName}
            setProjectName={setProjectName}
            creating={creating}
            onSubmit={handleCreateProject}
            onSkip={handleSkip}
            onBack={() => setStep("welcome")}
          />
        )}

        {step === "ready" && (
          <ReadyStep
            projectName={projectName}
            onGoToProject={() => {
              localStorage.setItem("tresta:onboarding:done", "true");
              // In production, navigate to the actual project slug
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
    <div className="onboard-fade-in">
      {/* Greeting */}
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

      {/* Name form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onContinue();
        }}
        className="space-y-4"
      >
        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-1.5">
            <label
              htmlFor="onboard-firstname"
              className="text-[13px] font-medium text-foreground"
            >
              First name
            </label>
            <input
              ref={firstNameRef}
              id="onboard-firstname"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Ada"
              required
              autoComplete="given-name"
              className={cn(
                "w-full h-10 px-3.5 rounded-lg border border-input bg-card",
                "text-sm text-foreground placeholder:text-muted-foreground/60",
                "focus:outline-none focus:ring-2 focus:ring-brand/15 focus:border-brand/40",
                "transition-all duration-150",
                "auth-input-focus"
              )}
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="onboard-lastname"
              className="text-[13px] font-medium text-foreground"
            >
              Last name
            </label>
            <input
              id="onboard-lastname"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Lovelace"
              autoComplete="family-name"
              className={cn(
                "w-full h-10 px-3.5 rounded-lg border border-input bg-card",
                "text-sm text-foreground placeholder:text-muted-foreground/60",
                "focus:outline-none focus:ring-2 focus:ring-brand/15 focus:border-brand/40",
                "transition-all duration-150",
                "auth-input-focus"
              )}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!firstName.trim() || loading}
          className={cn(
            "w-full h-10 rounded-lg bg-primary text-primary-foreground",
            "text-sm font-medium",
            "hover:opacity-90 transition-all duration-150",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "auth-btn",
            "flex items-center justify-center gap-2"
          )}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Spinner />
              Saving…
            </span>
          ) : (
            <>
              Continue
              <ArrowRight className="size-4" />
            </>
          )}
        </button>
      </form>

      <button
        onClick={onSkip}
        className="w-full mt-4 text-center text-[13px] text-muted-foreground hover:text-foreground transition-colors duration-150 py-1"
      >
        I&apos;ll do this later
      </button>

      {/* Progress dots */}
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
    <div className="onboard-fade-in">
      {/* Greeting */}
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

      {/* Value props */}
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
              <p className="text-[13px] font-semibold text-foreground">
                {prop.title}
              </p>
              <p className="text-[12px] text-muted-foreground leading-relaxed mt-0.5">
                {prop.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={onContinue}
          className={cn(
            "w-full h-10 rounded-lg bg-primary text-primary-foreground",
            "text-sm font-medium",
            "hover:opacity-90 transition-all duration-150",
            "auth-btn",
            "flex items-center justify-center gap-2"
          )}
        >
          Get started
          <ArrowRight className="size-4" />
        </button>
        <button
          onClick={onSkip}
          className="w-full text-center text-[13px] text-muted-foreground hover:text-foreground transition-colors duration-150 py-1"
        >
          I&apos;ll explore on my own
        </button>
      </div>

      {/* Progress dots */}
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
    <div className="onboard-fade-in">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors duration-150 mb-7"
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back
      </button>

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
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="space-y-4"
      >
        <div className="space-y-2">
          <label
            htmlFor="onboard-project-name"
            className="text-[13px] font-medium text-foreground"
          >
            Project name
          </label>
          <input
            ref={inputRef}
            id="onboard-project-name"
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="e.g. My SaaS Product"
            required
            maxLength={60}
            className={cn(
              "w-full h-10 px-3.5 rounded-lg border border-input bg-card",
              "text-sm text-foreground placeholder:text-muted-foreground/60",
              "focus:outline-none focus:ring-2 focus:ring-brand/15 focus:border-brand/40",
              "transition-all duration-150",
              "auth-input-focus"
            )}
          />
          {/* Quick suggestions */}
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

        <button
          type="submit"
          disabled={!projectName.trim() || creating}
          className={cn(
            "w-full h-10 rounded-lg bg-primary text-primary-foreground",
            "text-sm font-medium",
            "hover:opacity-90 transition-all duration-150",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "auth-btn",
            "flex items-center justify-center gap-2"
          )}
        >
          {creating ? (
            <span className="flex items-center gap-2">
              <Spinner />
              Creating…
            </span>
          ) : (
            <>
              Create project
              <ArrowRight className="size-4" />
            </>
          )}
        </button>
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
    <div className="onboard-fade-in text-center">
      {/* Success checkmark */}
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

      {/* Quick tips */}
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
              <p className="text-[13px] font-semibold text-foreground">
                {tip.label}
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                {tip.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onGoToProject}
        className={cn(
          "w-full mt-7 h-10 rounded-lg bg-primary text-primary-foreground",
          "text-sm font-medium",
          "hover:opacity-90 transition-all duration-150",
          "auth-btn",
          "flex items-center justify-center gap-2"
        )}
      >
        Go to your project
        <ArrowRight className="size-4" />
      </button>

      <ProgressDots current={3} total={TOTAL_STEPS} />
    </div>
  );
}

// ── Progress indicator ────────────────────────────────────────────────────────

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div
      className="flex items-center justify-center gap-1.5 mt-8"
      role="progressbar"
      aria-valuenow={current + 1}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-label={`Step ${current + 1} of ${total}`}
    >
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-1 rounded-full transition-all duration-300",
            i === current
              ? "w-5 bg-brand"
              : i < current
                ? "w-1.5 bg-brand/40"
                : "w-1.5 bg-border"
          )}
        />
      ))}
    </div>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg
      className="animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      width={14}
      height={14}
      aria-hidden
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        className="opacity-20"
      />
      <path
        className="opacity-70"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
