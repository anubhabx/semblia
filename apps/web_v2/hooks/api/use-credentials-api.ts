"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import {
  fetchApiKeys,
  createApiKey,
  rotateApiKey,
  revokeApiKey,
  fetchApiKeyEvents,
  fetchAgentAccessOverview,
  createAgentKey,
  revokeAgentKey,
  fetchAgentActions,
} from "@/lib/tresta-api";
import { queryKeys } from "./keys";

// ── Private API keys ────────────────────────────────────────────────────────

export function useApiKeysList(slug: string) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: queryKeys.apiKeys.list(slug),
    queryFn: async () => {
      const token = await getToken();
      return fetchApiKeys(token, slug);
    },
    enabled: isSignedIn === true && !!slug,
  });
}

export function useCreateApiKey(slug: string) {
  const { getToken } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (body: {
      name: string;
      scopes?: string[];
      expiresAt?: string;
    }) => {
      const token = await getToken();
      return createApiKey(token, slug, body);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.apiKeys.list(slug) });
    },
  });
}

export function useRotateApiKey(slug: string) {
  const { getToken } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (keyId: string) => {
      const token = await getToken();
      return rotateApiKey(token, slug, keyId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.apiKeys.list(slug) });
    },
  });
}

export function useRevokeApiKey(slug: string) {
  const { getToken } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (keyId: string) => {
      const token = await getToken();
      return revokeApiKey(token, slug, keyId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.apiKeys.list(slug) });
    },
  });
}

export function useApiKeyEvents(slug: string, keyId: string) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: queryKeys.apiKeys.events(slug, keyId),
    queryFn: async () => {
      const token = await getToken();
      return fetchApiKeyEvents(token, slug, keyId);
    },
    enabled: isSignedIn === true && !!slug && !!keyId,
  });
}

// ── Agent access ────────────────────────────────────────────────────────────

export function useAgentAccessOverview(slug: string) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: queryKeys.agentAccess.overview(slug),
    queryFn: async () => {
      const token = await getToken();
      return fetchAgentAccessOverview(token, slug);
    },
    enabled: isSignedIn === true && !!slug,
  });
}

export function useCreateAgentKey(slug: string) {
  const { getToken } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (body: { name: string; presetId: string }) => {
      const token = await getToken();
      return createAgentKey(token, slug, body);
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: queryKeys.agentAccess.overview(slug),
      });
    },
  });
}

export function useRevokeAgentKey(slug: string) {
  const { getToken } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (keyId: string) => {
      const token = await getToken();
      return revokeAgentKey(token, slug, keyId);
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: queryKeys.agentAccess.overview(slug),
      });
    },
  });
}

export function useAgentActions(slug: string) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: queryKeys.agentAccess.actions(slug),
    queryFn: async () => {
      const token = await getToken();
      return fetchAgentActions(token, slug);
    },
    enabled: isSignedIn === true && !!slug,
  });
}
