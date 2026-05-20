"use client";

import * as React from "react";
import { toast } from "sonner";
import type { V2PaymentMethodDTO } from "@workspace/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RefreshingDataBadge } from "@/components/shared";
import {
  useDeletePaymentMethod,
  usePaymentMethods,
  useSetDefaultPaymentMethod,
} from "@/hooks/api";
import { useLiveQueryState } from "@/hooks/use-live-query-state";
import { DotsThreeIcon, PlusIcon } from "@phosphor-icons/react";

// ── Brand label ────────────────────────────────────────────────────────────────

const BRAND_LABELS: Record<V2PaymentMethodDTO["brand"], string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  rupay: "RuPay",
  amex: "Amex",
};

// ── Single payment method row ──────────────────────────────────────────────────

function PaymentRow({
  method,
  onDelete,
  onMakeDefault,
}: {
  method: V2PaymentMethodDTO;
  onDelete: () => void;
  onMakeDefault: () => void;
}) {
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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-7 shrink-0">
            <DotsThreeIcon className="size-4" />
            <span className="sr-only">Payment method options</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          {!method.isDefault && (
            <DropdownMenuItem onClick={onMakeDefault}>
              Make default
            </DropdownMenuItem>
          )}
          {!method.isDefault && <DropdownMenuSeparator />}
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={onDelete}
          >
            Remove
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// ── Payment methods section ────────────────────────────────────────────────────

export function PaymentMethodsSection() {
  const methodsQuery = usePaymentMethods({ freshOnMount: true });
  const liveState = useLiveQueryState(methodsQuery);
  const methods = methodsQuery.data;

  const [deleteTarget, setDeleteTarget] =
    React.useState<V2PaymentMethodDTO | null>(null);

  const deleteMutation = useDeletePaymentMethod();
  const deleting = deleteMutation.isPending;
  const deleteMethod = (id: string) =>
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Payment method removed.");
        setDeleteTarget(null);
      },
      onError: () => toast.error("Failed to remove payment method."),
    });

  const defaultMutation = useSetDefaultPaymentMethod();
  const makeDefault = (id: string) =>
    defaultMutation.mutate(id, {
      onSuccess: () => toast.success("Default payment method updated."),
      onError: () => toast.error("Failed to update default payment method."),
    });

  return (
    <>
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
            <TooltipContent>Available after next checkout</TooltipContent>
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
            : methods?.map((m) => (
                <PaymentRow
                  key={m.id}
                  method={m}
                  onDelete={() => setDeleteTarget(m)}
                  onMakeDefault={() => makeDefault(m.id)}
                />
              ))}

          {!methodsQuery.isPending && (!methods || methods.length === 0) && (
            <div className="px-4 py-4 text-sm text-muted-foreground text-center">
              No saved payment methods.
            </div>
          )}
        </div>
      </div>

      <ConfirmationDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        intent="danger"
        title="Remove payment method?"
        description={
          deleteTarget ? (
            <>
              Remove{" "}
              <span className="font-medium text-foreground">
                {BRAND_LABELS[deleteTarget.brand]} •••• {deleteTarget.last4}
              </span>
              ?
            </>
          ) : (
            ""
          )
        }
        confirmLabel={deleting ? "Removing…" : "Remove"}
        onConfirm={() => deleteTarget && deleteMethod(deleteTarget.id)}
      />
    </>
  );
}
