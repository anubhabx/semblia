"use client";

import { useQuery } from "@tanstack/react-query";
import {
  apiGetBillingProfile,
  apiGetInvoices,
  apiGetPaymentMethods,
  apiGetSubscription,
} from "@/lib/api";
import { liveQueryOptions, type ApiQueryOptions } from "./query-options";

export const billingQueryKeys = {
  subscription: ["subscription"] as const,
  invoices: ["invoices"] as const,
  paymentMethods: ["payment-methods"] as const,
  profile: ["billing-profile"] as const,
};

export function useSubscription(options?: ApiQueryOptions) {
  return useQuery({
    queryKey: billingQueryKeys.subscription,
    queryFn: apiGetSubscription,
    ...liveQueryOptions(options),
  });
}

export function useInvoices(options?: ApiQueryOptions) {
  return useQuery({
    queryKey: billingQueryKeys.invoices,
    queryFn: apiGetInvoices,
    ...liveQueryOptions(options),
  });
}

export function usePaymentMethods(options?: ApiQueryOptions) {
  return useQuery({
    queryKey: billingQueryKeys.paymentMethods,
    queryFn: apiGetPaymentMethods,
    ...liveQueryOptions(options),
  });
}

export function useBillingProfile(options?: ApiQueryOptions) {
  return useQuery({
    queryKey: billingQueryKeys.profile,
    queryFn: apiGetBillingProfile,
    ...liveQueryOptions(options),
  });
}
