import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  buildInitialConfig,
  deepEqual,
  deepMerge,
  type DeepPartial,
  type FormConfig,
} from "@/lib/collect/types";
import type { MockProject } from "@/lib/mock-data";

export interface Snapshot {
  draft: FormConfig;
  saved: FormConfig;
  savedAt: number;
}

interface CollectStore {
  bySlug: Record<string, Snapshot>;
  ensure: (slug: string, project: MockProject) => void;
  update: (slug: string, patch: DeepPartial<FormConfig>) => void;
  replaceDraft: (slug: string, next: FormConfig) => void;
  save: (slug: string) => void;
  reset: (slug: string) => void;
  discardAll: () => void;
}

const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
} as const;

export const useCollectStore = create<CollectStore>()(
  persist(
    (set, get) => ({
      bySlug: {},

      ensure: (slug, project) => {
        const existing = get().bySlug[slug];
        if (existing) return;
        const initial = buildInitialConfig(project);
        set((state) => ({
          bySlug: {
            ...state.bySlug,
            [slug]: {
              draft: initial,
              saved: initial,
              savedAt: Date.now(),
            },
          },
        }));
      },

      update: (slug, patch) => {
        const snap = get().bySlug[slug];
        if (!snap) return;
        const nextDraft = deepMerge(snap.draft, patch);
        if (deepEqual(nextDraft, snap.draft)) return;
        set((state) => ({
          bySlug: {
            ...state.bySlug,
            [slug]: { ...snap, draft: nextDraft },
          },
        }));
      },

      replaceDraft: (slug, next) => {
        const snap = get().bySlug[slug];
        if (!snap) return;
        if (deepEqual(next, snap.draft)) return;
        set((state) => ({
          bySlug: {
            ...state.bySlug,
            [slug]: { ...snap, draft: next },
          },
        }));
      },

      save: (slug) => {
        const snap = get().bySlug[slug];
        if (!snap) return;
        set((state) => ({
          bySlug: {
            ...state.bySlug,
            [slug]: {
              draft: snap.draft,
              saved: structuredClone(snap.draft),
              savedAt: Date.now(),
            },
          },
        }));
      },

      reset: (slug) => {
        const snap = get().bySlug[slug];
        if (!snap) return;
        if (deepEqual(snap.draft, snap.saved)) return;
        set((state) => ({
          bySlug: {
            ...state.bySlug,
            [slug]: { ...snap, draft: structuredClone(snap.saved) },
          },
        }));
      },

      discardAll: () => set({ bySlug: {} }),
    }),
    {
      name: "tresta:collect-configs:v1",
      version: 1,
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : noopStorage
      ),
    }
  )
);

export function selectSnapshot(slug: string) {
  return (s: CollectStore): Snapshot | undefined => s.bySlug[slug];
}

export function isDirty(snap: Snapshot | undefined): boolean {
  if (!snap) return false;
  return !deepEqual(snap.draft, snap.saved);
}
