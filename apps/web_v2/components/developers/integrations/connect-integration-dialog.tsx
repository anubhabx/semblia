"use client";

import * as React from "react";
import { toast } from "sonner";
import { useReverification, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useCreateIntegrationConnection,
  useIntegrationResources,
} from "@/hooks/api";
import type { V2IntegrationResourceDTO } from "@workspace/types";
import { type ProviderSpec } from "./integration-providers";

export function ConnectIntegrationDialog({
  slug,
  spec,
  open,
  onOpenChange,
}: {
  slug: string;
  spec: ProviderSpec | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const create = useCreateIntegrationConnection(slug);
  const { isLoaded, user } = useUser();
  type CreateExternalAccountParams = Parameters<
    NonNullable<typeof user>["createExternalAccount"]
  >[0];
  const createExternalAccount = useReverification(
    (params: CreateExternalAccountParams) =>
      user?.createExternalAccount(params),
  );
  const [selectedResourceId, setSelectedResourceId] = React.useState<
    string | null
  >(null);

  React.useEffect(() => {
    if (open) setSelectedResourceId(null);
  }, [open, spec]);

  const isConnected =
    isLoaded &&
    spec !== null &&
    Boolean(
      user?.externalAccounts.some(
        (account) => account.provider === spec.id.toLowerCase(),
      ),
    );
  const resourcesQuery = useIntegrationResources(
    slug,
    spec?.id ?? null,
    undefined,
    {
      enabled: open && isConnected,
    },
  );
  const resources = resourcesQuery.data?.items ?? [];
  const selectedResource =
    resources.find((resource) => resource.id === selectedResourceId) ?? null;

  if (!spec) return null;

  async function handleSubmit() {
    if (!spec || !selectedResource) return;
    try {
      await create.mutateAsync({
        provider: spec.id,
        scopes: spec.oauthScopes,
        config: selectedResource.config,
      });
      toast.success(`${spec.label} connected`, {
        description: "Responses will now be delivered to this destination.",
      });
      onOpenChange(false);
    } catch {
      // Error state is rendered inline below.
    }
  }

  async function handleAuthorize() {
    if (!spec) return;
    try {
      const result = (await createExternalAccount({
        strategy: spec.oauthStrategy,
        additionalScopes: spec.oauthScopes,
        redirectUrl: window.location.href,
      } as CreateExternalAccountParams)) as
        | {
            verification?: {
              externalVerificationRedirectURL?: { href?: string };
            };
          }
        | undefined;
      const href =
        result?.verification?.externalVerificationRedirectURL?.href ?? null;
      if (href) {
        if (window.navigator.userAgent.includes("jsdom")) return;
        try {
          window.location.assign(href);
        } catch {
          // Navigation is not implemented in jsdom; browsers still redirect.
        }
      }
    } catch {
      toast.error(`Could not authorize ${spec.label}. Please try again.`);
    }
  }

  const Icon = spec.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-md border border-border/70 bg-background text-foreground">
              <Icon className="size-3.5" />
            </span>
            Connect {spec.label}
          </DialogTitle>
          <DialogDescription>{spec.blurb}</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (selectedResource && isConnected && !create.isPending) {
              handleSubmit();
            }
          }}
          className="space-y-4"
        >
          {isConnected ? (
            <ResourceChoices
              resources={resources}
              selectedResourceId={selectedResourceId}
              isLoading={resourcesQuery.isLoading}
              onSelect={setSelectedResourceId}
            />
          ) : (
            <div className="rounded-md border border-border bg-muted/20 p-3">
              <Button
                type="button"
                size="sm"
                onClick={handleAuthorize}
                disabled={!isLoaded}
              >
                Authorize {spec.label}
              </Button>
            </div>
          )}

          {create.isError && (
            <p className="text-[11px] text-destructive">
              Could not connect. Choose another destination and try again.
            </p>
          )}
          {resourcesQuery.isError && isConnected && (
            <p className="text-[11px] text-destructive">
              Could not load destinations. Reauthorize {spec.label} and try
              again.
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!selectedResource || create.isPending || !isConnected}
            >
              {create.isPending ? "Connecting…" : `Connect ${spec.label}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ResourceChoices({
  resources,
  selectedResourceId,
  isLoading,
  onSelect,
}: {
  resources: V2IntegrationResourceDTO[];
  selectedResourceId: string | null;
  isLoading: boolean;
  onSelect: (resourceId: string) => void;
}) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="h-9 rounded-md border border-border bg-muted/40" />
        <div className="h-9 rounded-md border border-border bg-muted/20" />
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <p className="rounded-md border border-border bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
        No destinations available.
      </p>
    );
  }

  return (
    <div className="max-h-64 space-y-2 overflow-y-auto">
      {resources.map((resource) => {
        const selected = selectedResourceId === resource.id;
        return (
          <button
            key={resource.id}
            type="button"
            onClick={() => onSelect(resource.id)}
            className={[
              "flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition-colors",
              selected
                ? "border-brand/50 bg-brand/10 text-foreground"
                : "border-border bg-background hover:bg-muted/40",
            ].join(" ")}
          >
            <span className="truncate">{resource.label}</span>
            <span className="ml-3 shrink-0 font-mono text-[10px] uppercase text-muted-foreground">
              {selected ? "selected" : resource.id.slice(0, 8)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
