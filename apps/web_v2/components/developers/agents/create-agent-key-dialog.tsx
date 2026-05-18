"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import type {
  V2AgentAccessPresetDTO,
  V2AgentAccessPresetId,
} from "@workspace/types";
import { CheckCircleIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useCreateAgentKey } from "@/hooks/api";
import {
  RevealStep,
  ConfirmCloseDialog,
} from "@/components/developers/shared/reveal-step";

interface DraftState {
  name: string;
  preset: V2AgentAccessPresetId | null;
}

function PresetPicker({
  presets,
  selected,
  onSelect,
}: {
  presets: V2AgentAccessPresetDTO[];
  selected: V2AgentAccessPresetId | null;
  onSelect: (id: V2AgentAccessPresetId) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>
        Preset role <span className="text-destructive">*</span>
      </Label>
      <div
        role="radiogroup"
        aria-label="Agent preset"
        className="grid grid-cols-1 gap-2 sm:grid-cols-2"
      >
        {presets.map((preset) => {
          const on = selected === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onSelect(preset.id)}
              className={cn(
                "group flex flex-col gap-1 rounded-lg border px-3 py-2.5 text-left transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
                on
                  ? "border-brand bg-brand-muted/40"
                  : "border-border bg-card hover:border-brand/40 hover:bg-muted/40",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={cn(
                    "font-mono text-[11px] font-semibold uppercase tracking-[0.12em]",
                    on ? "text-brand" : "text-foreground",
                  )}
                >
                  {preset.label}
                </span>
                {on && (
                  <CheckCircleIcon
                    className="size-3.5 text-brand"
                    weight="fill"
                    aria-hidden
                  />
                )}
              </div>
              <p className="text-[11px] leading-snug text-muted-foreground">
                {preset.description}
              </p>
              <p className="mt-0.5 font-mono text-[10px] text-muted-foreground/70">
                {preset.scopes.length} scope
                {preset.scopes.length === 1 ? "" : "s"}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const EMPTY_DRAFT: DraftState = { name: "", preset: null };

export function CreateAgentKeyDialog({
  open,
  slug,
  presets,
  onOpenChange,
}: {
  open: boolean;
  slug: string;
  presets: V2AgentAccessPresetDTO[];
  onOpenChange: (open: boolean) => void;
}) {
  const createMutation = useCreateAgentKey(slug);
  const [draft, setDraft] = React.useState<DraftState>(EMPTY_DRAFT);
  const [submitting, setSubmitting] = React.useState(false);
  const [plaintext, setPlaintext] = React.useState<string | null>(null);
  const [confirmClose, setConfirmClose] = React.useState(false);

  const step = plaintext != null ? "reveal" : "draft";
  const valid = draft.name.trim().length >= 3 && draft.preset != null;

  function reset() {
    setDraft(EMPTY_DRAFT);
    setPlaintext(null);
    setSubmitting(false);
    setConfirmClose(false);
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      if (step === "reveal") {
        setConfirmClose(true);
        return;
      }
      reset();
      onOpenChange(false);
    } else {
      onOpenChange(true);
    }
  }

  function handleConfirmClose() {
    reset();
    onOpenChange(false);
  }

  async function handleSubmit() {
    if (!draft.preset) return;
    setSubmitting(true);
    try {
      const result = await createMutation.mutateAsync({
        name: draft.name.trim(),
        preset: draft.preset,
      });
      setPlaintext(result.secret ?? result.key ?? "");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {step === "reveal" ? "Agent key created" : "New agent key"}
            </DialogTitle>
            {step === "draft" && (
              <DialogDescription>
                Mint a scoped key for an AI agent or the local MCP adapter. Each
                preset maps to a fixed capability bundle — no custom scopes for
                agent keys.
              </DialogDescription>
            )}
          </DialogHeader>

          <AnimatePresence mode="wait" initial={false}>
            {step === "draft" ? (
              <motion.div
                key="draft"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
              >
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (valid) handleSubmit();
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <Label htmlFor="agent-key-name">
                      Key name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="agent-key-name"
                      value={draft.name}
                      onChange={(e) =>
                        setDraft((p) => ({ ...p, name: e.target.value }))
                      }
                      placeholder="e.g. Claude support bot"
                      maxLength={80}
                      autoFocus
                    />
                    <p className="text-[11px] text-muted-foreground">
                      {draft.name.length}/80 characters
                    </p>
                  </div>

                  <PresetPicker
                    presets={presets}
                    selected={draft.preset}
                    onSelect={(id) => setDraft((p) => ({ ...p, preset: id }))}
                  />

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenChange(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={!valid || submitting}
                      className="gap-1.5"
                    >
                      {submitting ? "Creating…" : "Create agent key"}
                    </Button>
                  </DialogFooter>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="reveal"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                <RevealStep
                  plaintext={plaintext!}
                  onClose={handleConfirmClose}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      <ConfirmCloseDialog
        open={confirmClose}
        onOpenChange={setConfirmClose}
        onConfirm={handleConfirmClose}
      />
    </>
  );
}
