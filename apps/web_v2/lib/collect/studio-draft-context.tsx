"use client";

import * as React from "react";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useFormDraft } from "@/hooks/api";
import { queryKeys } from "@/hooks/api/keys";
import { saveFormDraft } from "@/lib/tresta-api";
import type {
  DesignTokens,
  FormConfig,
  StudioDevice,
} from "@/lib/collect/studio-types";
import {
  ALL_PRESETS,
  buildDefaultFormConfig,
  randomTokens,
} from "@/lib/collect/studio-presets";

interface StudioDraftCtxValue {
  ready: boolean;
  draft: FormConfig;
  device: StudioDevice;
  dirty: boolean;
  isSaving: boolean;
  setToken: <K extends keyof DesignTokens>(
    key: K,
    value: DesignTokens[K],
  ) => void;
  setTokens: (tokens: DesignTokens) => void;
  applyStylePreset: (presetId: string) => void;
  setHeadline: (headline: string) => void;
  setSubhead: (subhead: string) => void;
  setBrandName: (name: string) => void;
  randomize: () => void;
  setDevice: (device: StudioDevice) => void;
  save: () => Promise<void>;
  reset: () => void;
}

const StudioDraftContext = React.createContext<StudioDraftCtxValue | null>(
  null,
);

export function useStudioDraft(): StudioDraftCtxValue {
  const ctx = React.useContext(StudioDraftContext);
  if (!ctx) {
    throw new Error("useStudioDraft must be used inside <StudioDraftProvider>");
  }
  return ctx;
}

function coerceFormConfig(raw: unknown): FormConfig | null {
  if (!raw || typeof raw !== "object") return null;
  const candidate = raw as Partial<FormConfig>;
  if (!candidate.tokens || typeof candidate.tokens !== "object") return null;
  return candidate as FormConfig;
}

export function StudioDraftProvider({
  slug,
  formId,
  children,
}: {
  slug: string;
  formId: string;
  children: React.ReactNode;
}) {
  const formQuery = useForm(slug, formId);
  const draftQuery = useFormDraft(slug, formId);
  const { getToken } = useAuth();
  const qc = useQueryClient();

  const publishedConfig = React.useMemo<FormConfig | null>(() => {
    const data = formQuery.data;
    if (!data) return null;
    return coerceFormConfig(data.config) ?? buildDefaultFormConfig();
  }, [formQuery.data]);

  const remoteDraft = React.useMemo<FormConfig | null>(() => {
    const data = draftQuery.data;
    if (!data?.draft) return null;
    return coerceFormConfig(data.draft);
  }, [draftQuery.data]);

  const initialDraft = React.useMemo<FormConfig | null>(() => {
    if (remoteDraft) return remoteDraft;
    return publishedConfig;
  }, [publishedConfig, remoteDraft]);

  const [draft, setDraft] = React.useState<FormConfig | null>(null);
  const [savedBaseline, setSavedBaseline] = React.useState<FormConfig | null>(
    null,
  );
  const [device, setDevice] = React.useState<StudioDevice>("desktop");
  const seededRef = React.useRef(false);

  React.useEffect(() => {
    if (seededRef.current) return;
    if (!initialDraft) return;
    seededRef.current = true;
    setDraft(initialDraft);
    setSavedBaseline(initialDraft);
  }, [initialDraft]);

  const saveMutation = useMutation({
    mutationFn: async (body: FormConfig) => {
      const token = await getToken();
      const expectedVersion = draftQuery.data?.version ?? 0;
      return saveFormDraft(token, slug, formId, {
        draft: body as unknown as Record<string, unknown>,
        expectedVersion,
      });
    },
    onSuccess: (data, body) => {
      qc.setQueryData(queryKeys.forms.draft(slug, formId), data);
      setSavedBaseline(body);
    },
  });

  const dirty = React.useMemo(() => {
    if (!draft || !savedBaseline) return false;
    return JSON.stringify(draft) !== JSON.stringify(savedBaseline);
  }, [draft, savedBaseline]);

  const value = React.useMemo<StudioDraftCtxValue | null>(() => {
    if (!draft) return null;

    const patch = (fn: (d: FormConfig) => FormConfig) =>
      setDraft((prev) => (prev ? fn(prev) : prev));

    return {
      ready: true,
      draft,
      device,
      dirty,
      isSaving: saveMutation.isPending,
      setToken: (key, value) =>
        patch((d) => ({
          ...d,
          tokens: { ...d.tokens, [key]: value },
          preset: "custom",
        })),
      setTokens: (tokens) => patch((d) => ({ ...d, tokens })),
      applyStylePreset: (presetId) => {
        const preset = ALL_PRESETS[presetId];
        if (!preset) return;
        patch((d) => ({
          ...d,
          tokens: { ...preset.tokens },
          brandName: preset.tokens.brandName,
          preset: presetId,
        }));
      },
      setHeadline: (headline) => patch((d) => ({ ...d, headline })),
      setSubhead: (subhead) => patch((d) => ({ ...d, subhead })),
      setBrandName: (brandName) => patch((d) => ({ ...d, brandName })),
      randomize: () => {
        const tokens = randomTokens();
        patch((d) => ({
          ...d,
          tokens,
          brandName: tokens.brandName,
          preset: "custom",
        }));
      },
      setDevice,
      save: async () => {
        if (!draft) return;
        await saveMutation.mutateAsync(draft);
      },
      reset: () => {
        if (savedBaseline) setDraft(savedBaseline);
      },
    };
  }, [draft, device, dirty, saveMutation, savedBaseline]);

  if (!value) return null;

  return (
    <StudioDraftContext.Provider value={value}>
      {children}
    </StudioDraftContext.Provider>
  );
}
