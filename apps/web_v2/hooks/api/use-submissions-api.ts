"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import {
  fetchSubmissions,
  fetchSubmission,
  createSubmissionAnnotation,
  moderateSubmission,
} from "@/lib/tresta-api";
import { queryKeys } from "./keys";

export function useSubmissionsList(
  slug: string,
  params?: {
    page?: number;
    pageSize?: number;
    moderationStatus?: string;
    formId?: string;
  },
) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: queryKeys.submissions.list(slug, params),
    queryFn: async () => {
      const token = await getToken();
      return fetchSubmissions(token, slug, params);
    },
    enabled: isSignedIn === true && !!slug,
  });
}

export function useSubmission(slug: string, submissionId: string) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: queryKeys.submissions.detail(slug, submissionId),
    queryFn: async () => {
      const token = await getToken();
      return fetchSubmission(token, slug, submissionId);
    },
    enabled: isSignedIn === true && !!slug && !!submissionId,
  });
}

export function useCreateAnnotation(slug: string) {
  const { getToken } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      submissionId,
      ...body
    }: {
      submissionId: string;
      note?: string;
      labels?: string[];
      sentiment?: string;
      metadata?: Record<string, unknown>;
    }) => {
      const token = await getToken();
      return createSubmissionAnnotation(token, slug, submissionId, body);
    },
    onSuccess: (_data, { submissionId }) => {
      qc.invalidateQueries({
        queryKey: queryKeys.submissions.detail(slug, submissionId),
      });
    },
  });
}

export function useModerateSubmission(slug: string) {
  const { getToken } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      submissionId,
      ...body
    }: {
      submissionId: string;
      moderationStatus: string;
      reason?: string;
    }) => {
      const token = await getToken();
      return moderateSubmission(token, slug, submissionId, body);
    },
    onSuccess: (_data, { submissionId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.submissions.list(slug) });
      qc.invalidateQueries({
        queryKey: queryKeys.submissions.detail(slug, submissionId),
      });
    },
  });
}
