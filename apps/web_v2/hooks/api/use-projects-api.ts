"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import {
  fetchProjects,
  fetchProjectBySlug,
  createProject,
  updateProject,
  deleteProject,
  fetchProjectMembers,
  fetchAllowedOrigins,
  replaceAllowedOrigins,
  generateSigningSecret,
  clearSigningSecret,
} from "@/lib/tresta-api";
import { queryKeys } from "./keys";
import { liveQueryOptions, type ApiQueryOptions } from "./query-options";

export function useProjectsList(
  params?: { page?: number; pageSize?: number },
  options?: ApiQueryOptions,
) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: queryKeys.projects.list(params),
    queryFn: async () => {
      const token = await getToken();
      return fetchProjects(token, params);
    },
    enabled: isSignedIn === true,
    ...liveQueryOptions(options),
  });
}

export function useProject(slug: string, options?: ApiQueryOptions) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: queryKeys.projects.detail(slug),
    queryFn: async () => {
      const token = await getToken();
      return fetchProjectBySlug(token, slug);
    },
    enabled: isSignedIn === true && !!slug,
    ...liveQueryOptions(options),
  });
}

export function useCreateProject() {
  const { getToken } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (body: {
      name: string;
      slug: string;
      projectType?: string;
      shortDescription?: string;
      websiteUrl?: string;
    }) => {
      const token = await getToken();
      return createProject(token, body);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
}

export function useUpdateProject(slug: string) {
  const { getToken } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const token = await getToken();
      return updateProject(token, slug, body);
    },
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.projects.detail(slug), data);
      qc.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
}

export function useDeleteProject(slug: string) {
  const { getToken } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const token = await getToken();
      return deleteProject(token, slug);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.projects.all });
      qc.removeQueries({ queryKey: queryKeys.projects.detail(slug) });
    },
  });
}

export function useProjectMembers(slug: string, options?: ApiQueryOptions) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: queryKeys.projects.members(slug),
    queryFn: async () => {
      const token = await getToken();
      return fetchProjectMembers(token, slug);
    },
    enabled: isSignedIn === true && !!slug,
    ...liveQueryOptions(options),
  });
}

export function useAllowedOrigins(slug: string, options?: ApiQueryOptions) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: queryKeys.projects.allowedOrigins(slug),
    queryFn: async () => {
      const token = await getToken();
      const result = await fetchAllowedOrigins(token, slug);
      return result.origins;
    },
    enabled: isSignedIn === true && !!slug,
    ...liveQueryOptions(options),
  });
}

export function useReplaceAllowedOrigins(slug: string) {
  const { getToken } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (origins: string[]) => {
      const token = await getToken();
      return replaceAllowedOrigins(token, slug, origins);
    },
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.projects.allowedOrigins(slug), data.origins);
    },
  });
}

export function useGenerateSigningSecret(slug: string) {
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async () => {
      const token = await getToken();
      return generateSigningSecret(token, slug);
    },
  });
}

export function useClearSigningSecret(slug: string) {
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async () => {
      const token = await getToken();
      return clearSigningSecret(token, slug);
    },
  });
}
