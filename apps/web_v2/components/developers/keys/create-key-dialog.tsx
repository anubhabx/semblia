"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import type { V2ApiKeyScope } from "@workspace/types";
type ApiKeyType = "PUBLISHABLE" | "SECRET";
import { XIcon, WarningIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useCreateApiKey } from "@/hooks/api";
import {
  RevealStep,
  ConfirmCloseDialog,
} from "@/components/developers/shared/reveal-step";

/* ─── Chip input ──────────────────────────────────────────────────────────── */

function ChipInput({
  values,
  onChange,
  placeholder,
  validate,
  className,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  validate?: (v: string) => boolean;
  className?: string;
}) {
  const [input, setInput] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  function commit() {
    const val = input.trim();
    if (!val) return;
    if (validate && !validate(val)) return;
    if (!values.includes(val)) onChange([...values, val]);
    setInput("");
  }

  return (
    <div
      className={cn(
        "flex min-h-9 flex-wrap gap-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm focus-within:ring-1 focus-within:ring-ring",
        className,
      )}
      onClick={() => inputRef.current?.focus()}
    >
      {values.map((v) => (
        <span
          key={v}
          className="flex items-center gap-1 rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[11px]"
        >
          {v}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange(values.filter((x) => x !== v));
            }}
            className="ml-0.5 text-muted-foreground hover:text-foreground"
            aria-label={`Remove ${v}`}
          >
            <XIcon className="size-2.5" />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commit();
          }
          if (e.key === "Backspace" && !input && values.length) {
            onChange(values.slice(0, -1));
          }
        }}
        onBlur={commit}
        placeholder={values.length === 0 ? placeholder : undefined}
        className="min-w-[120px] flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}

/* ─── Expiry presets ──────────────────────────────────────────────────────── */

type ExpiryPreset = "30d" | "90d" | "1y" | "never";

const EXPIRY_OPTS: { id: ExpiryPreset; label: string }[] = [
  { id: "never", label: "Never" },
  { id: "30d", label: "30 days" },
  { id: "90d", label: "90 days" },
  { id: "1y", label: "1 year" },
];

function expiryToDate(preset: ExpiryPreset): Date | null {
  const now = Date.now();
  if (preset === "never") return null;
  if (preset === "30d") return new Date(now + 30 * 86400_000);
  if (preset === "90d") return new Date(now + 90 * 86400_000);
  return new Date(now + 365 * 86400_000);
}

/* ─── Scope catalog ───────────────────────────────────────────────────────── */

/**
 * Scope catalog — grouped for legibility. Mirrors the V2ApiKeyScope union in
 * @workspace/types and the backend zod enum in api-keys.dto.ts. If the
 * backend gains a new scope, add it here too.
 */
interface ScopeGroup {
  label: string;
  /**
   * Visual tone — `danger` groups are rendered behind a "show sensitive scopes"
   * disclosure with explicit copy. Used for credentials:write today because a
   * key with that scope can mint more keys (privilege escalation if leaked).
   */
  tone?: "default" | "danger";
  description?: string;
  scopes: { id: V2ApiKeyScope; label: string; description: string }[];
}

const SCOPE_GROUPS: ScopeGroup[] = [
  {
    label: "Project",
    scopes: [
      {
        id: "project:read",
        label: "project:read",
        description: "Read project metadata, settings, and access blocks.",
      },
    ],
  },
  {
    label: "Submissions",
    scopes: [
      {
        id: "submissions:read",
        label: "submissions:read",
        description: "Read collected feedback submissions.",
      },
      {
        id: "submissions:annotate",
        label: "submissions:annotate",
        description: "Add internal notes and tags to submissions.",
      },
      {
        id: "submissions:moderate",
        label: "submissions:moderate",
        description: "Approve, reject, or flag submissions.",
      },
    ],
  },
  {
    label: "Testimonials",
    scopes: [
      {
        id: "testimonials:read",
        label: "testimonials:read",
        description: "Read published and pending testimonials.",
      },
      {
        id: "testimonials:publish",
        label: "testimonials:publish",
        description: "Publish testimonials so they appear publicly.",
      },
      {
        id: "testimonials:unpublish",
        label: "testimonials:unpublish",
        description: "Unpublish previously published testimonials.",
      },
      {
        id: "testimonials:tag",
        label: "testimonials:tag",
        description: "Manage tags on testimonials.",
      },
      {
        id: "testimonials:display_suggest",
        label: "testimonials:display_suggest",
        description: "Suggest display copy edits for human review.",
      },
    ],
  },
  {
    label: "Analytics",
    scopes: [
      {
        id: "analytics:read",
        label: "analytics:read",
        description: "Read analytics summaries and event counts.",
      },
    ],
  },
  {
    label: "Exports",
    scopes: [
      {
        id: "exports:read",
        label: "exports:read",
        description: "List and download CSV / integration export deliveries.",
      },
      {
        id: "exports:write",
        label: "exports:write",
        description: "Trigger new CSV or integration exports.",
      },
    ],
  },
  {
    label: "Webhooks",
    scopes: [
      {
        id: "webhooks:read",
        label: "webhooks:read",
        description: "List outbound webhook endpoints and deliveries.",
      },
      {
        id: "webhooks:write",
        label: "webhooks:write",
        description: "Create, rotate, or revoke webhook endpoints.",
      },
    ],
  },
  {
    label: "Integrations",
    scopes: [
      {
        id: "integrations:read",
        label: "integrations:read",
        description: "Read Slack / Notion / Linear / GitHub connection state.",
      },
      {
        id: "integrations:write",
        label: "integrations:write",
        description: "Manage native integration connections and destinations.",
      },
    ],
  },
  {
    label: "Credentials",
    tone: "danger",
    description:
      "Lets a key inspect or mint other keys. A leaked credentials:write key can issue more keys — only grant for genuine automation needs.",
    scopes: [
      {
        id: "credentials:read",
        label: "credentials:read",
        description: "List API keys and agent keys (metadata only).",
      },
      {
        id: "credentials:write",
        label: "credentials:write",
        description: "Create, rotate, or revoke API and agent keys.",
      },
    ],
  },
  {
    label: "Agent",
    scopes: [
      {
        id: "agent:read",
        label: "agent:read",
        description: "Read-only agent surface for safe MCP workflows.",
      },
      {
        id: "agent:write",
        label: "agent:write",
        description: "Agent-side writes for capability-gated workflows.",
      },
    ],
  },
];

const DEFAULT_SCOPES: V2ApiKeyScope[] = [
  "project:read",
  "submissions:read",
  "testimonials:read",
];

function ScopeSelector({
  selected,
  onChange,
}: {
  selected: V2ApiKeyScope[];
  onChange: (next: V2ApiKeyScope[]) => void;
}) {
  // Reveal danger-tone groups (credentials, etc.) on demand so a casual
  // user can't accidentally tick "credentials:write" while scanning.
  const [showSensitive, setShowSensitive] = React.useState(() =>
    selected.some((s) => s === "credentials:read" || s === "credentials:write"),
  );

  function toggle(scope: V2ApiKeyScope) {
    if (selected.includes(scope)) {
      onChange(selected.filter((s) => s !== scope));
    } else {
      onChange([...selected, scope]);
    }
  }

  function resetDefaults() {
    onChange(DEFAULT_SCOPES);
  }

  const dangerGroups = SCOPE_GROUPS.filter((g) => g.tone === "danger");
  const safeGroups = SCOPE_GROUPS.filter((g) => g.tone !== "danger");

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <Label>
          Scopes{" "}
          <span className="font-normal text-muted-foreground">
            ({selected.length} selected)
          </span>
        </Label>
        <button
          type="button"
          onClick={resetDefaults}
          className="text-[11px] font-medium text-muted-foreground hover:text-foreground"
        >
          Reset to defaults
        </button>
      </div>

      <div className="max-h-56 overflow-y-auto rounded-md border border-border bg-muted/20 px-3 py-2">
        <ul className="space-y-3">
          {safeGroups.map((group) => (
            <li key={group.label}>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/80">
                {group.label}
              </p>
              <ul className="space-y-1">
                {group.scopes.map((scope) => {
                  const id = `scope-${scope.id}`;
                  const checked = selected.includes(scope.id);
                  return (
                    <li key={scope.id}>
                      <label
                        htmlFor={id}
                        className={cn(
                          "flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 transition-colors",
                          checked ? "bg-background" : "hover:bg-background/60",
                        )}
                      >
                        <Checkbox
                          id={id}
                          checked={checked}
                          onCheckedChange={() => toggle(scope.id)}
                          className="mt-0.5"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-mono text-[11px] font-medium text-foreground">
                            {scope.label}
                          </p>
                          <p className="text-[11px] leading-snug text-muted-foreground">
                            {scope.description}
                          </p>
                        </div>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}

          {dangerGroups.length > 0 && (
            <li>
              {!showSensitive ? (
                <button
                  type="button"
                  onClick={() => setShowSensitive(true)}
                  className="flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-destructive/40 px-2 py-1.5 text-[11px] font-medium text-destructive/80 hover:bg-destructive/5 hover:text-destructive"
                >
                  <WarningIcon className="size-3" weight="bold" aria-hidden />
                  Show sensitive scopes
                </button>
              ) : (
                <>
                  {dangerGroups.map((group) => (
                    <div key={group.label} className="space-y-1">
                      <div className="mb-1 flex items-baseline justify-between">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-destructive">
                          {group.label}
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowSensitive(false)}
                          className="text-[11px] font-normal text-muted-foreground hover:text-foreground"
                        >
                          Hide
                        </button>
                      </div>
                      {group.description && (
                        <p className="mb-1 flex items-start gap-1.5 rounded-md border border-destructive/30 bg-destructive/5 px-2 py-1.5 text-[11px] leading-snug text-destructive">
                          <WarningIcon
                            className="mt-0.5 size-3 shrink-0"
                            weight="bold"
                            aria-hidden
                          />
                          {group.description}
                        </p>
                      )}
                      <ul className="space-y-1">
                        {group.scopes.map((scope) => {
                          const id = `scope-${scope.id}`;
                          const checked = selected.includes(scope.id);
                          return (
                            <li key={scope.id}>
                              <label
                                htmlFor={id}
                                className={cn(
                                  "flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 transition-colors",
                                  checked
                                    ? "bg-background"
                                    : "hover:bg-background/60",
                                )}
                              >
                                <Checkbox
                                  id={id}
                                  checked={checked}
                                  onCheckedChange={() => toggle(scope.id)}
                                  className="mt-0.5"
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="font-mono text-[11px] font-medium text-foreground">
                                    {scope.label}
                                  </p>
                                  <p className="text-[11px] leading-snug text-muted-foreground">
                                    {scope.description}
                                  </p>
                                </div>
                              </label>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </>
              )}
            </li>
          )}
        </ul>
      </div>
      <p className="text-[11px] text-muted-foreground">
        Pick the least privilege your integration needs. You can revoke and
        recreate with different scopes at any time.
      </p>
    </div>
  );
}

/* ─── Draft step ──────────────────────────────────────────────────────────── */

interface DraftState {
  name: string;
  expiry: ExpiryPreset;
  origins: string[];
  ips: string[];
  scopes: V2ApiKeyScope[];
}

function DraftStep({
  type,
  draft,
  onChange,
  onSubmit,
  submitting,
  onCancel,
}: {
  type: ApiKeyType;
  draft: DraftState;
  onChange: (patch: Partial<DraftState>) => void;
  onSubmit: () => void;
  submitting: boolean;
  onCancel: () => void;
}) {
  const isPublishable = type === "PUBLISHABLE";
  const valid = draft.name.trim().length >= 3 && draft.scopes.length > 0;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) onSubmit();
      }}
      className="space-y-4"
    >
      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="key-name">
          Key name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="key-name"
          value={draft.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="e.g. Production embed"
          maxLength={50}
          autoFocus
        />
        <p className="text-[11px] text-muted-foreground">
          {draft.name.length}/50 characters
        </p>
      </div>

      {/* Scopes */}
      <ScopeSelector
        selected={draft.scopes}
        onChange={(next) => onChange({ scopes: next })}
      />

      {/* Expiry */}
      <div className="space-y-1.5">
        <Label>Expiry</Label>
        <div className="flex flex-wrap gap-1.5">
          {EXPIRY_OPTS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange({ expiry: opt.id })}
              className={cn(
                "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                draft.expiry === opt.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Publishable: allowed origins */}
      {isPublishable && (
        <div className="space-y-1.5">
          <Label>Allowed origins</Label>
          <ChipInput
            values={draft.origins}
            onChange={(v) => onChange({ origins: v })}
            placeholder="https://example.com — press Enter to add"
            validate={(v) => /^https?:\/\/.+/.test(v)}
          />
          <p className="text-[11px] text-muted-foreground">
            Requests from other origins will be blocked. Leave empty to allow
            all.
          </p>
        </div>
      )}

      {/* Secret: IP allowlist + warning */}
      {!isPublishable && (
        <>
          <div className="rounded-md border border-amber-500/30 bg-amber-500/8 px-3 py-2.5">
            <p className="flex items-start gap-2 text-[12px] leading-relaxed text-amber-700 dark:text-amber-400">
              <WarningIcon className="mt-0.5 size-3.5 shrink-0" weight="fill" />
              Treat like a password. Never paste in client code, repos, or chat
              messages.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label>
              IP allowlist{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <ChipInput
              values={draft.ips}
              onChange={(v) => onChange({ ips: v })}
              placeholder="203.0.113.0/24 — press Enter to add"
              validate={(v) => /^[\d.:/a-fA-F]+$/.test(v)}
            />
            <p className="text-[11px] text-muted-foreground">
              Restrict to your server IPs or CIDR blocks. Leave empty for any
              IP.
            </p>
          </div>
        </>
      )}

      <DialogFooter>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={!valid || submitting}
          className="gap-1.5"
        >
          {submitting ? "Creating…" : "Create key"}
        </Button>
      </DialogFooter>
    </form>
  );
}

/* ─── Dialog ──────────────────────────────────────────────────────────────── */

const EMPTY_DRAFT: DraftState = {
  name: "",
  expiry: "never",
  origins: [],
  ips: [],
  scopes: DEFAULT_SCOPES,
};

export function CreateKeyDialog({
  open,
  initialType,
  slug,
  onOpenChange,
}: {
  open: boolean;
  initialType: ApiKeyType;
  slug: string;
  onOpenChange: (open: boolean) => void;
}) {
  const createMutation = useCreateApiKey(slug);
  const [draft, setDraft] = React.useState<DraftState>(EMPTY_DRAFT);
  const [submitting, setSubmitting] = React.useState(false);
  const [plaintext, setPlaintext] = React.useState<string | null>(null);
  const [confirmClose, setConfirmClose] = React.useState(false);

  const step = plaintext != null ? "reveal" : "draft";

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
    setSubmitting(true);
    try {
      const expiry = expiryToDate(draft.expiry);
      const result = await createMutation.mutateAsync({
        name: draft.name.trim(),
        scopes: draft.scopes,
        expiresAt: expiry ? expiry.toISOString() : undefined,
      });
      setPlaintext(result.secret ?? result.key ?? "");
    } finally {
      setSubmitting(false);
    }
  }

  const title =
    step === "reveal"
      ? "Key created"
      : `Create ${initialType.toLowerCase()} key`;

  const description =
    step === "reveal"
      ? undefined
      : initialType === "PUBLISHABLE"
        ? "Safe for browser code. Read-only access. Locked to allowed origins."
        : "For server use only. Scoped to the permissions you choose below.";

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
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
                <DraftStep
                  type={initialType}
                  draft={draft}
                  onChange={(p) => setDraft((prev) => ({ ...prev, ...p }))}
                  onSubmit={handleSubmit}
                  submitting={submitting}
                  onCancel={() => handleOpenChange(false)}
                />
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
