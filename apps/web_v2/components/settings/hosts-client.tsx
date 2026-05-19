"use client";

/**
 * HostsClient — Public surfaces panel.
 *
 * The backend seeds two default PublicSurfaceHost rows per project on creation
 * (`<slug>.testimonials.tresta.app` for COLLECTION + `<slug>.walls.tresta.app`
 * for WALL — see `apps/api_v2/src/modules/projects/projects.service.ts`). Until
 * a dedicated authenticated list endpoint exists, this surface derives the
 * default hostnames from `project.slug` so users see their public URLs without
 * a second roundtrip.
 *
 * TODO(codex): when `GET /v2/projects/:slug/public-surface-hosts` lands, swap
 * the slug-derived rows for `usePublicSurfaceHosts(slug)` and surface the real
 * `status` / `verifiedAt` / `isDefault` fields per row.
 */

import * as React from "react";
import { toast } from "sonner";
import type { V2ProjectDTO } from "@workspace/types";
import {
  GlobeIcon,
  CopyIcon,
  ArrowSquareOutIcon,
  CheckCircleIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { PageBody, SettingsSection } from "@/components/shared";

interface HostRow {
  feature: "COLLECTION" | "WALL";
  label: string;
  description: string;
  hostname: string;
  publicHref: string;
}

function buildDefaultHosts(slug: string): HostRow[] {
  return [
    {
      feature: "COLLECTION",
      label: "Collection page",
      description:
        "Public testimonial form where customers leave new feedback.",
      hostname: `${slug}.testimonials.tresta.app`,
      publicHref: `https://${slug}.testimonials.tresta.app`,
    },
    {
      feature: "WALL",
      label: "Testimonial wall",
      description: "Public wall that surfaces approved testimonials.",
      hostname: `${slug}.walls.tresta.app`,
      publicHref: `https://${slug}.walls.tresta.app`,
    },
  ];
}

function HostCard({ row }: { row: HostRow }) {
  const [copied, setCopied] = React.useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(row.publicHref);
      setCopied(true);
      toast.success("URL copied");
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy — check clipboard permissions");
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border/70 bg-muted/50">
              <GlobeIcon
                className="size-3.5 text-muted-foreground"
                weight="bold"
                aria-hidden
              />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {row.label}
              </p>
              <p className="text-xs text-muted-foreground">{row.description}</p>
            </div>
          </div>
          <p className="mt-3 truncate font-mono text-[12.5px] text-foreground">
            {row.hostname}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-1.5 text-xs"
          >
            {copied ? (
              <CheckCircleIcon className="size-3.5 text-emerald-500" />
            ) : (
              <CopyIcon className="size-3.5" />
            )}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button
            asChild
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
          >
            <a href={row.publicHref} target="_blank" rel="noreferrer noopener">
              Open
              <ArrowSquareOutIcon className="size-3" aria-hidden />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function HostsClient({ project }: { project: V2ProjectDTO }) {
  const hosts = React.useMemo(
    () => buildDefaultHosts(project.slug),
    [project.slug],
  );

  return (
    <PageBody padding="default">
      <div className="space-y-8 pb-8">
        <SettingsSection
          id="default-hosts"
          title="Default hosts"
          description="Every project ships with these public surfaces under tresta.app subdomains."
        >
          <div className="space-y-3">
            {hosts.map((row) => (
              <HostCard key={row.feature} row={row} />
            ))}
          </div>
        </SettingsSection>

        <SettingsSection
          id="custom-domain"
          title="Custom domain"
          description="Use your own domain (e.g. testimonials.yourcompany.com) for the public collection page."
        >
          <div className="flex items-start gap-3 rounded-lg border border-dashed border-border bg-muted/30 p-4">
            <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Coming soon
            </span>
            <div className="text-[13px] leading-relaxed text-muted-foreground">
              Self-serve domain verification with automated TLS is on the v1
              roadmap. Reach out if you need it now and we&apos;ll set it up
              manually.
            </div>
          </div>
        </SettingsSection>
      </div>
    </PageBody>
  );
}
