"use client";

/**
 * RevealStep — one-time plaintext-secret display used for newly created or
 * rotated credentials. Auto-focuses the copy button; on copy, shows a
 * transient "Copied" affordance; close is confirmed by a dedicated guard
 * dialog (see ConfirmCloseDialog) to prevent accidental loss.
 *
 * Used by both private API keys and agent keys — secrets only render once.
 */

import * as React from "react";
import { CopyIcon, CheckCircleIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export function RevealStep({
  plaintext,
  onClose,
}: {
  plaintext: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = React.useState(false);
  const copyRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    copyRef.current?.focus();
  }, []);

  function handleCopy() {
    navigator.clipboard.writeText(plaintext).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <p className="text-sm font-semibold text-foreground">
          Your new key — copy it now
        </p>
        <p className="text-xs text-muted-foreground">
          We won&apos;t show it again. If you lose it, rotate to get a new one.
        </p>
      </div>

      <div className="flex items-stretch overflow-hidden rounded-md border border-border bg-muted/50">
        <code className="flex-1 overflow-x-auto px-3 py-2.5 font-mono text-[12px] leading-relaxed tracking-tight">
          {plaintext}
        </code>
        <button
          ref={copyRef}
          onClick={handleCopy}
          aria-live="polite"
          className={cn(
            "flex shrink-0 items-center gap-1.5 border-l border-border px-3 text-xs font-medium transition-colors",
            copied
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-muted-foreground hover:bg-background hover:text-foreground",
          )}
          aria-label="Copy key"
        >
          {copied ? (
            <>
              <CheckCircleIcon className="size-3.5" /> Copied
            </>
          ) : (
            <>
              <CopyIcon className="size-3.5" /> Copy
            </>
          )}
        </button>
      </div>

      <DialogFooter>
        <Button size="sm" onClick={onClose} className="gap-1.5">
          I&apos;ve saved it
        </Button>
      </DialogFooter>
    </div>
  );
}

export function ConfirmCloseDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Close without copying?</DialogTitle>
          <DialogDescription>
            The key won&apos;t be shown again. Make sure you&apos;ve saved it
            somewhere safe.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Go back
          </Button>
          <Button variant="destructive" size="sm" onClick={onConfirm}>
            Close anyway
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
