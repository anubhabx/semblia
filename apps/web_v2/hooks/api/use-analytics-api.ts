"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import {
  fetchAnalyticsDashboard,
  fetchAnalyticsSummary,
  recordFormViewEvent,
  recordHostedPageViewEvent,
  recordTestimonialImpressionEvent,
  recordWidgetLoadEvent,
  type AnalyticsDashboardParams,
  type AnalyticsSummaryParams,
  type FormViewEventBody,
  type HostedPageViewEventBody,
  type TestimonialImpressionEventBody,
  type WidgetLoadEventBody,
} from "@/lib/tresta-api";
import { queryKeys } from "./keys";
import { liveQueryOptions, type ApiQueryOptions } from "./query-options";

export function useAnalyticsSummary(
  slug: string,
  params?: AnalyticsSummaryParams,
  options?: ApiQueryOptions,
) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: queryKeys.analytics.summary(slug, params),
    queryFn: async () => {
      const token = await getToken();
      return fetchAnalyticsSummary(token, slug, params);
    },
    enabled: isSignedIn === true && !!slug,
    ...liveQueryOptions(options),
  });
}

export function useAnalyticsDashboard(
  slug: string,
  params?: AnalyticsDashboardParams,
  options?: ApiQueryOptions,
) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: queryKeys.analytics.dashboard(slug, params),
    queryFn: async () => {
      const token = await getToken();
      return fetchAnalyticsDashboard(token, slug, params);
    },
    enabled: isSignedIn === true && !!slug,
    ...liveQueryOptions(options),
  });
}

export function useRecordFormViewEvent() {
  return useMutation({
    mutationFn: (body: FormViewEventBody) => recordFormViewEvent(body),
  });
}

export function useRecordWidgetLoadEvent() {
  return useMutation({
    mutationFn: (body: WidgetLoadEventBody) => recordWidgetLoadEvent(body),
  });
}

export function useRecordTestimonialImpressionEvent() {
  return useMutation({
    mutationFn: (body: TestimonialImpressionEventBody) =>
      recordTestimonialImpressionEvent(body),
  });
}

export function useRecordHostedPageViewEvent() {
  return useMutation({
    mutationFn: (body: HostedPageViewEventBody) =>
      recordHostedPageViewEvent(body),
  });
}
