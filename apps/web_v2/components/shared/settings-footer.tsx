"use client";

import { Button } from "@/components/ui/button";

// ── Sticky settings save/discard footer ───────────────────────────────────────

export interface SettingsFooterProps {
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onDiscard: () => void;
  canSave?: boolean;
}

export function SettingsFooter({
  dirty,
  saving,
  onSave,
  onDiscard,
  canSave,
}: SettingsFooterProps) {
  const saveEnabled = (canSave ?? dirty) && !saving;
  return (
    <div
      className="sticky bottom-0 z-10 border-t border-border bg-background/90 px-4 py-3 backdrop-blur-md sm:px-6"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center justify-end gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onDiscard}
          className="text-muted-foreground"
          disabled={!dirty || saving}
        >
          Discard
        </Button>
        <Button
          size="sm"
          disabled={!saveEnabled}
          onClick={onSave}
          className="min-w-[7rem] tactile"
        >
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
