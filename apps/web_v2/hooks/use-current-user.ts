"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import type {
  V2OnboardingDataDTO,
  V2OnboardingStep,
  V2UserDTO,
} from "@workspace/types";
import {
  completeOnboarding,
  fetchCurrentUser,
  updateCurrentUser,
  updateOnboardingProgress,
} from "@/lib/tresta-api";
import { queryKeys } from "@/hooks/api";

interface CurrentUserQueryOptions {
  freshOnMount?: boolean;
}

export function useCurrentUser(options?: CurrentUserQueryOptions) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery<V2UserDTO>({
    queryKey: queryKeys.currentUser,
    queryFn: async () => {
      const token = await getToken();
      return fetchCurrentUser(token);
    },
    enabled: isSignedIn === true,
    staleTime: options?.freshOnMount ? 0 : 5 * 60 * 1000,
    refetchOnMount: options?.freshOnMount ? "always" : undefined,
  });
}

export function useUpdateCurrentUser() {
  const { getToken } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (body: {
      firstName?: string | null;
      lastName?: string | null;
      avatar?: string | null;
    }) => {
      const token = await getToken();
      return updateCurrentUser(token, body);
    },
    onSuccess: (user) => {
      qc.setQueryData(queryKeys.currentUser, user);
    },
  });
}

export function useUpdateOnboardingProgress() {
  const { getToken } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (body: {
      step: Exclude<V2OnboardingStep, "COMPLETED">;
      data?: V2OnboardingDataDTO;
    }) => {
      const token = await getToken();
      return updateOnboardingProgress(token, body);
    },
    onSuccess: (user) => {
      qc.setQueryData(queryKeys.currentUser, user);
    },
  });
}

export function useCompleteOnboarding() {
  const { getToken } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const token = await getToken();
      return completeOnboarding(token);
    },
    onSuccess: (user) => {
      qc.setQueryData(queryKeys.currentUser, user);
    },
  });
}
