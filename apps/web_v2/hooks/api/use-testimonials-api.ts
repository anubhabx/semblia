"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import {
  fetchTestimonials,
  fetchTestimonial,
  approveTestimonial,
  rejectTestimonial,
  publishTestimonial,
  createDisplaySuggestion,
  approveDisplaySuggestion,
  rejectDisplaySuggestion,
} from "@/lib/tresta-api";
import { queryKeys } from "./keys";
import { liveQueryOptions, type ApiQueryOptions } from "./query-options";

export function useTestimonialsList(
  slug: string,
  params?: {
    page?: number;
    pageSize?: number;
    status?: string;
    type?: string;
    search?: string;
    sort?: string;
  },
  options?: ApiQueryOptions,
) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: queryKeys.testimonials.list(slug, params),
    queryFn: async () => {
      const token = await getToken();
      return fetchTestimonials(token, slug, params);
    },
    enabled: isSignedIn === true && !!slug,
    ...liveQueryOptions(options),
  });
}

export function useTestimonial(
  slug: string,
  testimonialId: string,
  options?: ApiQueryOptions,
) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: queryKeys.testimonials.detail(slug, testimonialId),
    queryFn: async () => {
      const token = await getToken();
      return fetchTestimonial(token, slug, testimonialId);
    },
    enabled: isSignedIn === true && !!slug && !!testimonialId,
    ...liveQueryOptions(options),
  });
}

export function useApproveTestimonial(slug: string) {
  const { getToken } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (testimonialId: string) => {
      const token = await getToken();
      return approveTestimonial(token, slug, testimonialId);
    },
    onSuccess: (_data, testimonialId) => {
      qc.invalidateQueries({ queryKey: queryKeys.testimonials.list(slug) });
      qc.invalidateQueries({
        queryKey: queryKeys.testimonials.detail(slug, testimonialId),
      });
    },
  });
}

export function useRejectTestimonial(slug: string) {
  const { getToken } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (testimonialId: string) => {
      const token = await getToken();
      return rejectTestimonial(token, slug, testimonialId);
    },
    onSuccess: (_data, testimonialId) => {
      qc.invalidateQueries({ queryKey: queryKeys.testimonials.list(slug) });
      qc.invalidateQueries({
        queryKey: queryKeys.testimonials.detail(slug, testimonialId),
      });
    },
  });
}

export function usePublishTestimonial(slug: string) {
  const { getToken } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      testimonialId,
      published,
    }: {
      testimonialId: string;
      published: boolean;
    }) => {
      const token = await getToken();
      return publishTestimonial(token, slug, testimonialId, { published });
    },
    onSuccess: (_data, { testimonialId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.testimonials.list(slug) });
      qc.invalidateQueries({
        queryKey: queryKeys.testimonials.detail(slug, testimonialId),
      });
    },
  });
}

export function useCreateDisplaySuggestion(slug: string) {
  const { getToken } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      testimonialId,
      ...body
    }: {
      testimonialId: string;
      displayText: string;
      headline?: string;
      reason?: string;
    }) => {
      const token = await getToken();
      return createDisplaySuggestion(token, slug, testimonialId, body);
    },
    onSuccess: (_data, { testimonialId }) => {
      qc.invalidateQueries({
        queryKey: queryKeys.testimonials.detail(slug, testimonialId),
      });
    },
  });
}

export function useApproveDisplaySuggestion(slug: string) {
  const { getToken } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      testimonialId,
      revisionId,
      reason,
    }: {
      testimonialId: string;
      revisionId: string;
      reason?: string;
    }) => {
      const token = await getToken();
      return approveDisplaySuggestion(token, slug, testimonialId, revisionId, {
        reason,
      });
    },
    onSuccess: (_data, { testimonialId }) => {
      qc.invalidateQueries({
        queryKey: queryKeys.testimonials.detail(slug, testimonialId),
      });
      qc.invalidateQueries({ queryKey: queryKeys.testimonials.list(slug) });
    },
  });
}

export function useRejectDisplaySuggestion(slug: string) {
  const { getToken } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      testimonialId,
      revisionId,
      reason,
    }: {
      testimonialId: string;
      revisionId: string;
      reason?: string;
    }) => {
      const token = await getToken();
      return rejectDisplaySuggestion(token, slug, testimonialId, revisionId, {
        reason,
      });
    },
    onSuccess: (_data, { testimonialId }) => {
      qc.invalidateQueries({
        queryKey: queryKeys.testimonials.detail(slug, testimonialId),
      });
    },
  });
}
