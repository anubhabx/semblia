"use client";

import {
  BookOpenTextIcon,
  ArrowSquareOutIcon,
  CodeIcon,
  WebhooksLogoIcon,
  type Icon as PhosphorIcon,
} from "@phosphor-icons/react";
import { PageBody } from "@/components/shared";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { DeveloperShell } from "../developer-shell";

function TopicCard({
  icon: Icon,
  title,
  description,
}: {
  icon: PhosphorIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 opacity-70">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-muted/50">
        <Icon className="size-3.5 text-muted-foreground" weight="bold" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export function DocsComingSoon({ slug }: { slug: string }) {
  return (
    <DeveloperShell slug={slug} active="docs">
      <PageBody padding="default" className="overflow-y-auto">
        <div className="px-2 py-6 sm:px-0 sm:py-10">
          <Empty className="border border-dashed py-10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <BookOpenTextIcon weight="bold" />
              </EmptyMedia>
              <EmptyTitle>API docs are on their way</EmptyTitle>
              <EmptyDescription>
                A guided reference for every endpoint, scope, and webhook event
                is being written. For now, the live OpenAPI spec is available
                for manual exploration.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
              >
                <a href="/v2/openapi" target="_blank" rel="noreferrer">
                  Open OpenAPI explorer
                  <ArrowSquareOutIcon className="size-3.5" aria-hidden />
                </a>
              </Button>
            </EmptyContent>
          </Empty>

          <div className="mt-6">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
              Coming soon
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <TopicCard
                icon={CodeIcon}
                title="Authentication & scopes"
                description="How to authenticate, scope keys to least privilege, and rotate safely."
              />
              <TopicCard
                icon={BookOpenTextIcon}
                title="Resource reference"
                description="Testimonials, submissions, widgets, forms, exports, integrations."
              />
              <TopicCard
                icon={WebhooksLogoIcon}
                title="Webhooks & events"
                description="Subscribe to delivery events, verify signatures, replay safely."
              />
            </div>
          </div>
        </div>
      </PageBody>
    </DeveloperShell>
  );
}
