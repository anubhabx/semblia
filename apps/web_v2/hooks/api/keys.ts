/**
 * Centralised React Query key factory.
 * Every hook references these so invalidation stays consistent.
 */
export const queryKeys = {
  currentUser: ["currentUser"] as const,
  organization: ["organization", "current"] as const,

  projects: {
    all: ["projects"] as const,
    list: (params?: Record<string, unknown>) =>
      ["projects", "list", params ?? {}] as const,
    detail: (slug: string) => ["projects", slug] as const,
    members: (slug: string) => ["projects", slug, "members"] as const,
    allowedOrigins: (slug: string) =>
      ["projects", slug, "allowed-origins"] as const,
  },

  testimonials: {
    list: (slug: string, params?: Record<string, unknown>) =>
      ["projects", slug, "testimonials", params ?? {}] as const,
    detail: (slug: string, id: string) =>
      ["projects", slug, "testimonials", id] as const,
  },

  submissions: {
    list: (slug: string, params?: Record<string, unknown>) =>
      ["projects", slug, "submissions", params ?? {}] as const,
    detail: (slug: string, id: string) =>
      ["projects", slug, "submissions", id] as const,
  },

  forms: {
    list: (slug: string) => ["projects", slug, "forms"] as const,
    detail: (slug: string, formId: string) =>
      ["projects", slug, "forms", formId] as const,
    draft: (slug: string, formId: string) =>
      ["projects", slug, "forms", formId, "draft"] as const,
  },

  widgets: {
    list: (slug: string) => ["projects", slug, "widgets"] as const,
    detail: (slug: string, widgetId: string) =>
      ["projects", slug, "widgets", widgetId] as const,
    draft: (slug: string, widgetId: string) =>
      ["projects", slug, "widgets", widgetId, "draft"] as const,
  },

  apiKeys: {
    list: (slug: string) => ["projects", slug, "api-keys"] as const,
    events: (slug: string, keyId: string) =>
      ["projects", slug, "api-keys", keyId, "events"] as const,
  },

  agentAccess: {
    overview: (slug: string) => ["projects", slug, "agent-access"] as const,
    actions: (slug: string) =>
      ["projects", slug, "agent-access", "actions"] as const,
  },
} as const;
