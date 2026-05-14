"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import {
  createIntegrationConnection,
  createNativeIntegrationExport,
  disableIntegrationConnection,
  fetchIntegrationConnections,
  updateIntegrationConnection,
} from "@/lib/tresta-api";
import { queryKeys } from "./keys";
import { liveQueryOptions, type ApiQueryOptions } from "./query-options";

export function useIntegrationConnections(
  slug: string,
  options?: ApiQueryOptions,
) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: queryKeys.integrations.connections(slug),
    queryFn: async () => {
      const token = await getToken();
      return fetchIntegrationConnections(token, slug);
    },
    enabled: isSignedIn === true && !!slug,
    ...liveQueryOptions(options),
  });
}

export function useCreateIntegrationConnection(slug: string) {
  const { getToken } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (
      body: Parameters<typeof createIntegrationConnection>[2],
    ) => {
      const token = await getToken();
      return createIntegrationConnection(token, slug, body);
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: queryKeys.integrations.connections(slug),
      });
    },
  });
}

export function useUpdateIntegrationConnection(
  slug: string,
  connectionId: string,
) {
  const { getToken } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (
      body: Parameters<typeof updateIntegrationConnection>[3],
    ) => {
      const token = await getToken();
      return updateIntegrationConnection(token, slug, connectionId, body);
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: queryKeys.integrations.connections(slug),
      });
    },
  });
}

export function useDisableIntegrationConnection(slug: string) {
  const { getToken } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (connectionId: string) => {
      const token = await getToken();
      return disableIntegrationConnection(token, slug, connectionId);
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: queryKeys.integrations.connections(slug),
      });
    },
  });
}

export function useCreateNativeIntegrationExport(slug: string) {
  const { getToken } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      connectionId,
      body,
    }: {
      connectionId: string;
      body: Parameters<typeof createNativeIntegrationExport>[3];
    }) => {
      const token = await getToken();
      return createNativeIntegrationExport(token, slug, connectionId, body);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.exports.deliveries(slug) });
    },
  });
}
