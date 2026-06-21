import type { FormsRuntimeEnv } from "./env.js";
import type { RuntimeRequestContext, RuntimeSurface } from "./types.js";

const FORM_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function normalizeHost(host: string | undefined): string | null {
  const normalized = host?.split(":")[0]?.trim().toLowerCase();
  return normalized ? normalized.replace(/\.+$/, "") : null;
}

export function normalizeOrigin(origin: string | undefined): string | null {
  if (!origin?.trim()) return null;
  try {
    return new URL(origin).origin;
  } catch {
    return origin.trim();
  }
}

export function isLocalDevHost(host: string): boolean {
  if (host.startsWith("[::1]")) return true;
  const hostname = host.split(":")[0]?.toLowerCase();
  return hostname === "localhost" || hostname === "127.0.0.1";
}

export function assertFormSlug(slug: string): string {
  const normalized = slug.trim().toLowerCase();
  if (normalized.length < 3 || normalized.length > 64 || !FORM_SLUG_PATTERN.test(normalized)) {
    throw new Error("Invalid form slug");
  }
  return normalized;
}

export function resolveRuntimeHost(input: {
  originalHost?: string;
  headerHost?: string;
  url: URL;
  env: FormsRuntimeEnv;
}): string {
  const host = normalizeHost(input.originalHost) ?? normalizeHost(input.headerHost) ?? input.url.host;
  if (input.env.FORMS_RUNTIME_MODE === "mock" && isLocalDevHost(host)) {
    return input.env.FORMS_RUNTIME_PUBLIC_BASE_DOMAIN;
  }
  return host;
}

export function resolveRuntimeProjectId(input: {
  env: FormsRuntimeEnv;
  host: string;
  queryProjectId?: string | null;
}): string {
  const queryProjectId = input.queryProjectId?.trim();
  if (queryProjectId) return queryProjectId;

  const mapped = input.env.FORMS_RUNTIME_PROJECT_ID_BY_HOST[input.host];
  if (mapped) return mapped;

  if (input.env.FORMS_RUNTIME_PROJECT_ID) {
    return input.env.FORMS_RUNTIME_PROJECT_ID;
  }

  if (input.env.FORMS_RUNTIME_MODE === "mock") {
    return "project_mock";
  }

  throw new Error("Forms runtime project routing is not configured");
}

export function resolveRequestContext(input: {
  env: FormsRuntimeEnv;
  host: string;
  origin?: string;
  slug: string;
  url: URL;
  surface: RuntimeSurface;
}): RuntimeRequestContext {
  return {
    host: input.host,
    origin: normalizeOrigin(input.origin) ?? undefined,
    projectId: resolveRuntimeProjectId({
      env: input.env,
      host: input.host,
      queryProjectId: input.url.searchParams.get("projectId"),
    }),
    slug: assertFormSlug(input.slug),
    path: input.url.pathname,
    surface: input.surface,
  };
}
