"use client";

import * as React from "react";
import { Image as ImageIcon, Trash as TrashIcon } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LogoUpload({
  value,
  onChange,
  className,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  className?: string;
}) {
  const [draft, setDraft] = React.useState(value ?? "");

  React.useEffect(() => {
    setDraft(value ?? "");
  }, [value]);

  return (
    <div
      data-slot="logo-upload"
      className={cn("flex flex-col gap-2", className)}
    >
      <div className="flex items-center gap-2 rounded-md border border-border/70 bg-muted/30 p-2">
        <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded border border-border bg-background">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="Logo" className="size-full object-contain" />
          ) : (
            <ImageIcon className="size-4 text-muted-foreground" />
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => onChange(draft.trim() ? draft.trim() : null)}
            placeholder="https://…/logo.png"
            className="h-7 text-[11px]"
          />
          <span className="text-[9px] text-muted-foreground">
            File upload coming soon — paste an image URL for now.
          </span>
        </div>
        {value && (
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Remove logo"
            onClick={() => {
              setDraft("");
              onChange(null);
            }}
          >
            <TrashIcon />
          </Button>
        )}
      </div>
    </div>
  );
}
