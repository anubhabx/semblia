"use client";

import * as React from "react";
import {
  apiGetApiKeys,
  apiGetApiKeyById,
  apiGetApiKeyEvents,
  apiCreateApiKey,
  apiRevokeApiKey,
  apiRotateApiKey,
  apiUpdateApiKey,
  type CreateApiKeyDraft,
  type ApiKeyPatch,
} from "@/lib/api";
import type { MockApiKey, MockApiKeyEvent, ApiKeyType } from "@/lib/mock-data";

// ── useApiKeys — list for a project ──────────────────────────────────────────

export function useApiKeys(projectId: string) {
  const [keys, setKeys] = React.useState<MockApiKey[]>([]);
  const [loading, setLoading] = React.useState(true);

  const reload = React.useCallback(() => {
    setLoading(true);
    apiGetApiKeys(projectId).then((data) => {
      setKeys(data);
      setLoading(false);
    });
  }, [projectId]);

  React.useEffect(() => {
    reload();
  }, [reload]);

  const publishable = keys.filter((k) => k.type === "publishable");
  const secret = keys.filter((k) => k.type === "secret");

  const create = React.useCallback(
    async (
      draft: CreateApiKeyDraft,
    ): Promise<{ key: MockApiKey; plaintext: string }> => {
      const result = await apiCreateApiKey(projectId, draft);
      setKeys((prev) => [...prev, result.key]);
      return result;
    },
    [projectId],
  );

  const revoke = React.useCallback(async (keyId: string) => {
    await apiRevokeApiKey(keyId);
    setKeys((prev) =>
      prev.map((k) => (k.id === keyId ? { ...k, isActive: false } : k)),
    );
  }, []);

  const rotate = React.useCallback(
    async (keyId: string): Promise<{ plaintext: string }> => {
      const result = await apiRotateApiKey(keyId);
      setKeys((prev) =>
        prev.map((k) =>
          k.id === keyId
            ? {
                ...k,
                keyPrefix: k.keyPrefix,
                lastFourPlaintext: result.plaintext.slice(-4),
                isActive: true,
              }
            : k,
        ),
      );
      return result;
    },
    [],
  );

  const update = React.useCallback(
    async (keyId: string, patch: ApiKeyPatch) => {
      const updated = await apiUpdateApiKey(keyId, patch);
      setKeys((prev) => prev.map((k) => (k.id === keyId ? updated : k)));
      return updated;
    },
    [],
  );

  return {
    keys,
    publishable,
    secret,
    loading,
    reload,
    create,
    revoke,
    rotate,
    update,
  };
}

// ── useApiKey — single key detail ─────────────────────────────────────────────

export function useApiKey(keyId: string) {
  const [key, setKey] = React.useState<MockApiKey | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    apiGetApiKeyById(keyId).then((data) => {
      setKey(data);
      setLoading(false);
    });
  }, [keyId]);

  const update = React.useCallback(
    async (patch: ApiKeyPatch) => {
      const updated = await apiUpdateApiKey(keyId, patch);
      setKey(updated);
      return updated;
    },
    [keyId],
  );

  const revoke = React.useCallback(async () => {
    await apiRevokeApiKey(keyId);
    setKey((prev) => (prev ? { ...prev, isActive: false } : prev));
  }, [keyId]);

  const rotate = React.useCallback(async (): Promise<{ plaintext: string }> => {
    const result = await apiRotateApiKey(keyId);
    setKey((prev) =>
      prev
        ? {
            ...prev,
            lastFourPlaintext: result.plaintext.slice(-4),
            isActive: true,
          }
        : prev,
    );
    return result;
  }, [keyId]);

  return { key, loading, update, revoke, rotate };
}

// ── useApiKeyEvents ───────────────────────────────────────────────────────────

export type EventFilter = "all" | "used" | "limit_hit" | "lifecycle";

export function useApiKeyEvents(keyId: string) {
  const [events, setEvents] = React.useState<MockApiKeyEvent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<EventFilter>("all");

  React.useEffect(() => {
    setLoading(true);
    apiGetApiKeyEvents(keyId).then((data) => {
      setEvents(data);
      setLoading(false);
    });
  }, [keyId]);

  const filtered = React.useMemo(() => {
    if (filter === "all") return events;
    if (filter === "used") return events.filter((e) => e.type === "used");
    if (filter === "limit_hit")
      return events.filter((e) => e.type === "limit_hit");
    return events.filter((e) =>
      ["created", "revoked", "rotated"].includes(e.type),
    );
  }, [events, filter]);

  return { events: filtered, allEvents: events, loading, filter, setFilter };
}

// Re-export types for convenience
export type {
  MockApiKey,
  MockApiKeyEvent,
  ApiKeyType,
  CreateApiKeyDraft,
  ApiKeyPatch,
};
