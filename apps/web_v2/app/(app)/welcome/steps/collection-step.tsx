"use client";

import { useState, useCallback } from "react";
import {
  ArrowRight,
  Check,
  Copy,
  Link as LinkIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { AuthPrimaryBtn } from "@/components/auth/auth-primary-btn";
import { ProgressDots } from "@/components/onboarding/progress-dots";
import { TOTAL_STEPS, STEP_INDEX } from "./constants";

interface CollectionStepProps {
  projectName: string;
  collectionUrl: string;
  onGoToProject: () => void;
}

export function CollectionStep({
  projectName,
  collectionUrl,
  onGoToProject,
}: CollectionStepProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(collectionUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for insecure contexts
      const textarea = document.createElement("textarea");
      textarea.value = collectionUrl;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }, [collectionUrl]);

  return (
    <div className="text-center">
      {/* Success checkmark */}
      <div className="mb-6 flex justify-center">
        <div className="check-pop flex size-14 items-center justify-center rounded-full bg-success/10">
          <Check className="size-7 text-success" weight="bold" />
        </div>
      </div>

      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        You&apos;re all set
      </h1>
      <p className="mt-2 mx-auto text-[14px] text-muted-foreground leading-relaxed max-w-[320px]">
        <span className="font-medium text-foreground">{projectName}</span> is
        ready. Here&apos;s your hosted collection URL — share it with customers
        to start gathering testimonials.
      </p>

      {/* Collection URL card */}
      <div className="mt-6 rounded-xl ring-1 ring-foreground/[0.06] bg-card p-4 text-left onboard-fade-in">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand/8">
            <LinkIcon className="size-3.5 text-brand" />
          </div>
          <p className="text-[12px] font-medium text-muted-foreground">
            Collection URL
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0 px-3 py-2.5 rounded-lg bg-muted/60 border border-border">
            <p className="text-[13px] font-mono text-foreground truncate">
              {collectionUrl}
            </p>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className={cn(
              "flex items-center justify-center size-10 rounded-lg border transition-all duration-200",
              "auth-btn",
              copied
                ? "bg-success/10 border-success/30 text-success"
                : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-foreground/20",
            )}
            aria-label={copied ? "Copied" : "Copy URL"}
          >
            {copied ? (
              <Check size={16} weight="bold" className="copy-success" />
            ) : (
              <Copy size={16} />
            )}
          </button>
        </div>

        {copied && (
          <p className="mt-2 text-[11px] text-success auth-notice-in">
            Copied to clipboard
          </p>
        )}
      </div>

      <AuthPrimaryBtn onClick={onGoToProject} className="mt-7">
        Go to your project
        <ArrowRight className="size-4" />
      </AuthPrimaryBtn>

      <ProgressDots current={STEP_INDEX.collection} total={TOTAL_STEPS} />
    </div>
  );
}
