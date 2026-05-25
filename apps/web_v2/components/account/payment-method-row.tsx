"use client";

import type { V2PaymentMethodDTO } from "@workspace/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RefreshingDataBadge } from "@/components/shared";
import { usePaymentMethods } from "@/hooks/api";
import { useLiveQueryState } from "@/hooks/use-live-query-state";
import { PlusIcon } from "@phosphor-icons/react";

// ── Brand label ────────────────────────────────────────────────────────────────

const BRAND_LABELS: Record<V2PaymentMethodDTO["brand"], string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  rupay: "RuPay",
  amex: "Amex",
};

// ── Single payment method row ──────────────────────────────────────────────────

function PaymentRow({ method }: { method: V2PaymentMethodDTO }) {
  const expiry = `${String(method.expMonth).padStart(2, "0")}/${method.expYear % 100}`;

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted/40 text-[10px] font-bold text-muted-foreground">
          {BRAND_LABELS[method.brand]}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-foreground">
              {BRAND_LABELS[method.brand]} •••• {method.last4}
            </span>
            {method.isDefault && (
              <Badge
                variant="secondary"
                className="text-[10px] bg-brand/10 text-brand border-brand/20"
              >
                Default
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">Expires {expiry}</p>
        </div>
      </div>

      <div className="size-7 shrink-0" aria-hidden="true" />
    </div>
  );
}

// ── Payment methods section ────────────────────────────────────────────────────

export function PaymentMethodsSection() {
  const methodsQuery = usePaymentMethods({ freshOnMount: true });
  const liveState = useLiveQueryState(methodsQuery);
  const methods = methodsQuery.data;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-h-6">
          <RefreshingDataBadge show={liveState.isBackgroundRefreshing} />
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span tabIndex={0}>
                <Button variant="outline" size="sm" disabled>
                  <PlusIcon className="size-3.5 mr-1" />
                  Add card
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              Cards are saved automatically after your next paid charge.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <div className="divide-y divide-border">
          {methodsQuery.isPending && !liveState.hasData
            ? Array.from({ length: 2 }, (_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <Skeleton className="size-9 rounded-md" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))
            : methods?.map((m) => <PaymentRow key={m.id} method={m} />)}

          {!methodsQuery.isPending && (!methods || methods.length === 0) && (
            <div className="px-4 py-4 text-sm text-muted-foreground text-center">
              No saved cards yet. We&apos;ll save your card here after your
              first paid charge.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
