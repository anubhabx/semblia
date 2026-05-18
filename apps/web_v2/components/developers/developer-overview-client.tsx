"use client";

/**
 * DeveloperOverviewClient — landing page for /projects/[slug]/developers.
 *
 * Surfaces counts for the three credential surfaces and quick links into the
 * relevant sub-sections. Pattern-matches the density of testimonials/analytics
 * overview tiles.
 */

import * as React from "react";
import Link from "next/link";
import {
  KeyIcon,
  RobotIcon,
  BookOpenTextIcon,
  ArrowRightIcon,
  LightningIcon,
  type Icon as PhosphorIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { fmtNum } from "@/lib/format";
import { PageBody } from "@/components/shared";
import { Skeleton } from "@/components/ui/skeleton";
import { useApiKeysList, useAgentAccessOverview } from "@/hooks/api";
import { DeveloperShell } from "./developer-shell";

interface OverviewCardSpec {
  href: string;
  icon: PhosphorIcon;
  title: string;
  description: string;
  count: number | null;
  countLabel: string;
  cta: string;
}

function OverviewCard({ spec }: { spec: OverviewCardSpec }) {
  const Icon = spec.icon;
  return (
    <Link
      href={spec.href}
      className={cn(
        "group flex flex-col gap-3 rounded-xl border border-border bg-card p-4",
        "transition-colors hover:border-brand/40 hover:bg-muted/40",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
      )}
    >
      <div className="flex items-center gap-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-muted/50">
          <Icon className="size-3.5 text-muted-foreground" weight="bold" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {spec.title}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {spec.description}
          </p>
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div className="flex items-baseline gap-1.5 font-mono tabular-nums">
          {spec.count == null ? (
            <Skeleton className="h-6 w-10 animate-shimmer" />
          ) : (
            <span className="text-xl font-semibold text-foreground">
              {fmtNum(spec.count)}
            </span>
          )}
          <span className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            {spec.countLabel}
          </span>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors group-hover:text-foreground">
          {spec.cta}
          <ArrowRightIcon className="size-3" weight="bold" aria-hidden />
        </span>
      </div>
    </Link>
  );
}

function GettingStarted({ slug }: { slug: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <LightningIcon
          className="size-3.5 text-brand"
          weight="fill"
          aria-hidden
        />
        <p className="text-sm font-semibold text-foreground">Getting started</p>
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">
        Three steps from zero to programmatic feedback.
      </p>
      <ol className="mt-3 space-y-2 text-xs text-foreground/90">
        <li className="flex gap-2">
          <span className="font-mono text-[10px] text-muted-foreground">
            01
          </span>
          <span>
            Create a{" "}
            <Link
              href={`/projects/${slug}/developers/keys`}
              className="font-medium text-foreground underline-offset-2 hover:underline"
            >
              private API key
            </Link>{" "}
            with the scopes your integration needs.
          </span>
        </li>
        <li className="flex gap-2">
          <span className="font-mono text-[10px] text-muted-foreground">
            02
          </span>
          <span>
            For AI agents, mint a scoped{" "}
            <Link
              href={`/projects/${slug}/developers/agents`}
              className="font-medium text-foreground underline-offset-2 hover:underline"
            >
              agent key
            </Link>{" "}
            from a preset role.
          </span>
        </li>
        <li className="flex gap-2">
          <span className="font-mono text-[10px] text-muted-foreground">
            03
          </span>
          <span>
            Call{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10.5px]">
              GET /v2/projects/{slug}/testimonials
            </code>{" "}
            with{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10.5px]">
              Authorization: Bearer
            </code>
            .
          </span>
        </li>
      </ol>
    </div>
  );
}

export function DeveloperOverviewClient({ slug }: { slug: string }) {
  const { data: keys, isLoading: keysLoading } = useApiKeysList(slug);
  const { data: agentOverview, isLoading: agentsLoading } =
    useAgentAccessOverview(slug);

  const activeKeys =
    keys?.filter((k) => k.isActive && k.status === "ACTIVE").length ?? null;
  const activeAgents =
    agentOverview?.keys.filter((k) => k.isActive && k.status === "ACTIVE")
      .length ?? null;

  const cards: OverviewCardSpec[] = [
    {
      href: `/projects/${slug}/developers/keys`,
      icon: KeyIcon,
      title: "API keys",
      description:
        "Private credentials for your servers and trusted integrations.",
      count: keysLoading ? null : (activeKeys ?? 0),
      countLabel: "active",
      cta: "Manage keys",
    },
    {
      href: `/projects/${slug}/developers/agents`,
      icon: RobotIcon,
      title: "Agent access",
      description:
        "Scoped, preset-based keys for AI agents and the MCP server.",
      count: agentsLoading ? null : (activeAgents ?? 0),
      countLabel: "active",
      cta: "Manage agents",
    },
    {
      href: `/projects/${slug}/developers/docs`,
      icon: BookOpenTextIcon,
      title: "API docs",
      description: "Reference for endpoints, scopes, and webhook events.",
      count: 0,
      countLabel: "soon",
      cta: "Read docs",
    },
  ];

  return (
    <DeveloperShell slug={slug} active="overview">
      <PageBody padding="default" className="overflow-y-auto">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <OverviewCard key={c.href} spec={c} />
          ))}
        </div>

        <div className="mt-6">
          <GettingStarted slug={slug} />
        </div>
      </PageBody>
    </DeveloperShell>
  );
}
