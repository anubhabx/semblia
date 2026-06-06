"use client";

import * as React from "react";
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

/**
 * AbWeightDialog — set a form's A/B traffic weight.
 *
 * `abWeight` drives form ordering / traffic splitting on the backend
 * (`orderBy abWeight desc`). Active forms' weights are expected to sum to
 * 100% for a clean split, so the control is clamped to 0–100.
 */
export function AbWeightDialog({
  name,
  currentWeight,
  open,
  onOpenChange,
  onSubmit,
}: {
  name: string;
  currentWeight: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (weight: number) => void;
}) {
  const [value, setValue] = React.useState(String(currentWeight));

  React.useEffect(() => {
    if (open) setValue(String(currentWeight));
  }, [open, currentWeight]);

  const parsed = Number.parseInt(value, 10);
  const valid = Number.isFinite(parsed) && parsed >= 0 && parsed <= 100;

  function handleSubmit() {
    if (!valid) return;
    onSubmit(parsed);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>A/B traffic weight</DialogTitle>
          <DialogDescription>
            Set how much traffic &ldquo;{name}&rdquo; receives relative to other
            active forms. Active weights should total 100%.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-3"
        >
          <div className="space-y-1.5">
            <Label htmlFor="ab-weight-input">Weight (%)</Label>
            <Input
              id="ab-weight-input"
              type="number"
              min={0}
              max={100}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoFocus
            />
            <div className="flex items-center gap-1.5 pt-1">
              {[0, 25, 50, 75, 100].map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  variant="outline"
                  size="xs"
                  className="text-[11px]"
                  onClick={() => setValue(String(preset))}
                >
                  {preset}
                </Button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={!valid}>
              Save weight
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
