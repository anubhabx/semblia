/**
 * Typed API client for `api_v2`.
 *
 * - Handles Clerk bearer tokens.
 * - Unwraps the `{ success, data, meta }` response envelope.
 * - Parses typed errors from `AllExceptionsFilter`.
 * - All date fields arrive as ISO strings — no auto-parsing.
 */

import type {
  V2ApiEnvelope,
  V2ApiMeta,
  V2ErrorResponse,
  V2PaginatedResponse,
  V2UserDTO,
  V2ProjectDTO,
  V2ProjectMemberDTO,
  V2TestimonialDTO,
  V2SubmissionDTO,
  V2SubmissionAnnotationDTO,
  V2TestimonialDisplayRevisionDTO,
  V2CollectionFormDTO,
  V2WidgetDTO,
  V2WidgetListEntry,
  V2StudioDraftDTO,
  V2ApiKeyDTO,
  V2CreatedApiKeyDTO,
  V2ApiKeyEventDTO,
  V2AgentAccessOverviewDTO,
  V2CurrentOrganizationDTO,
} from "@workspace/types";

// ── Config ──────────────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8100";

// ── Error ───────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: V2ErrorResponse | null,
  ) {
    const msg = body?.message
      ? Array.isArray(body.message)
        ? body.message.join("; ")
        : body.message
      : `API error ${status}`;
    super(msg);
    this.name = "ApiError";
  }
}

// ── Core fetch ──────────────────────────────────────────────────────────────

interface RequestOptions extends Omit<RequestInit, "headers"> {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined>;
}

async function apiRaw<T>(
  path: string,
  token: string | null,
  options: RequestOptions = {},
): Promise<{ data: T; meta: V2ApiMeta }> {
  const { params, ...fetchOpts } = options;

  let url = `${API_BASE}/v2${path}`;
  if (params) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined) qs.set(k, String(v));
    }
    const search = qs.toString();
    if (search) url += `?${search}`;
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  };

  const res = await fetch(url, { ...fetchOpts, headers });

  if (!res.ok) {
    let body: V2ErrorResponse | null = null;
    try {
      body = (await res.json()) as V2ErrorResponse;
    } catch {
      // non-JSON error body
    }
    throw new ApiError(res.status, body);
  }

  // 204 No Content
  if (res.status === 204) {
    return { data: undefined as unknown as T, meta: { timestamp: new Date().toISOString() } };
  }

  const envelope = (await res.json()) as V2ApiEnvelope<T>;
  return { data: envelope.data, meta: envelope.meta };
}

/** Unwrapped fetch — returns only `data`. */
async function api<T>(
  path: string,
  token: string | null,
  options: RequestOptions = {},
): Promise<T> {
  const { data } = await apiRaw<T>(path, token, options);
  return data;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function post<T>(path: string, token: string | null, body?: unknown): Promise<T> {
  return api<T>(path, token, {
    method: "POST",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

function patch<T>(path: string, token: string | null, body?: unknown): Promise<T> {
  return api<T>(path, token, {
    method: "PATCH",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

function put<T>(path: string, token: string | null, body?: unknown): Promise<T> {
  return api<T>(path, token, {
    method: "PUT",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

function del<T = void>(path: string, token: string | null): Promise<T> {
  return api<T>(path, token, { method: "DELETE" });
}

// ── Current user ────────────────────────────────────────────────────────────

export function fetchCurrentUser(token: string | null) {
  return api<V2UserDTO>("/me", token);
}

export function updateCurrentUser(
  token: string | null,
  body: { firstName?: string | null; lastName?: string | null; avatar?: string | null },
) {
  return patch<V2UserDTO>("/me", token, body);
}

export function completeOnboarding(token: string | null) {
  return post<V2UserDTO>("/me/onboarding/complete", token);
}

// ── Organization ────────────────────────────────────────────────────────────

export function fetchCurrentOrganization(token: string | null) {
  return api<V2CurrentOrganizationDTO>("/organizations/current", token);
}

// ── Projects ────────────────────────────────────────────────────────────────

export function fetchProjects(
  token: string | null,
  params?: { page?: number; pageSize?: number },
) {
  return api<V2PaginatedResponse<V2ProjectDTO>>("/projects", token, {
    params: params as Record<string, string | number>,
  });
}

export function fetchProjectBySlug(token: string | null, slug: string) {
  return api<V2ProjectDTO>(`/projects/${encodeURIComponent(slug)}`, token);
}

export function createProject(
  token: string | null,
  body: {
    name: string;
    slug: string;
    projectType?: string;
    shortDescription?: string;
    websiteUrl?: string;
  },
) {
  return post<V2ProjectDTO>("/projects", token, body);
}

export function updateProject(
  token: string | null,
  slug: string,
  body: Record<string, unknown>,
) {
  return patch<V2ProjectDTO>(`/projects/${encodeURIComponent(slug)}`, token, body);
}

export function deleteProject(token: string | null, slug: string) {
  return del(`/projects/${encodeURIComponent(slug)}`, token);
}

// ── Project members ─────────────────────────────────────────────────────────

export function fetchProjectMembers(token: string | null, slug: string) {
  return api<V2ProjectMemberDTO[]>(`/projects/${encodeURIComponent(slug)}/members`, token);
}

export function addProjectMember(
  token: string | null,
  slug: string,
  body: { email: string; role?: string },
) {
  return post<V2ProjectMemberDTO>(
    `/projects/${encodeURIComponent(slug)}/members`,
    token,
    body,
  );
}

export function updateProjectMember(
  token: string | null,
  slug: string,
  userId: string,
  body: { role: string },
) {
  return patch<V2ProjectMemberDTO>(
    `/projects/${encodeURIComponent(slug)}/members/${encodeURIComponent(userId)}`,
    token,
    body,
  );
}

export function removeProjectMember(
  token: string | null,
  slug: string,
  userId: string,
) {
  return del(
    `/projects/${encodeURIComponent(slug)}/members/${encodeURIComponent(userId)}`,
    token,
  );
}

// ── Project allowed origins ─────────────────────────────────────────────────

export function fetchAllowedOrigins(token: string | null, slug: string) {
  return api<{ origins: string[] }>(
    `/projects/${encodeURIComponent(slug)}/allowed-origins`,
    token,
  );
}

export function replaceAllowedOrigins(
  token: string | null,
  slug: string,
  origins: string[],
) {
  return put<{ origins: string[] }>(
    `/projects/${encodeURIComponent(slug)}/allowed-origins`,
    token,
    { origins },
  );
}

// ── Project signing secret ──────────────────────────────────────────────────

export function generateSigningSecret(token: string | null, slug: string) {
  return post<{ secret: string; createdAt: string }>(
    `/projects/${encodeURIComponent(slug)}/signing-secret`,
    token,
  );
}

export function clearSigningSecret(token: string | null, slug: string) {
  return del(`/projects/${encodeURIComponent(slug)}/signing-secret`, token);
}

// ── Testimonials ────────────────────────────────────────────────────────────

export function fetchTestimonials(
  token: string | null,
  slug: string,
  params?: {
    page?: number;
    pageSize?: number;
    moderationStatus?: string;
    type?: string;
    search?: string;
    sort?: string;
  },
) {
  return api<V2PaginatedResponse<V2TestimonialDTO>>(
    `/projects/${encodeURIComponent(slug)}/testimonials`,
    token,
    { params: params as Record<string, string | number> },
  );
}

export function fetchTestimonial(
  token: string | null,
  slug: string,
  testimonialId: string,
) {
  return api<V2TestimonialDTO>(
    `/projects/${encodeURIComponent(slug)}/testimonials/${encodeURIComponent(testimonialId)}`,
    token,
  );
}

export function approveTestimonial(token: string | null, slug: string, testimonialId: string) {
  return patch<V2TestimonialDTO>(
    `/projects/${encodeURIComponent(slug)}/testimonials/${encodeURIComponent(testimonialId)}/approve`,
    token,
  );
}

export function rejectTestimonial(token: string | null, slug: string, testimonialId: string) {
  return patch<V2TestimonialDTO>(
    `/projects/${encodeURIComponent(slug)}/testimonials/${encodeURIComponent(testimonialId)}/reject`,
    token,
  );
}

export function publishTestimonial(
  token: string | null,
  slug: string,
  testimonialId: string,
  body: { isPublished: boolean },
) {
  return patch<V2TestimonialDTO>(
    `/projects/${encodeURIComponent(slug)}/testimonials/${encodeURIComponent(testimonialId)}/publish`,
    token,
    body,
  );
}

// ── Display suggestions ─────────────────────────────────────────────────────

export function createDisplaySuggestion(
  token: string | null,
  slug: string,
  testimonialId: string,
  body: { displayText: string; headline?: string; reason?: string },
) {
  return post<V2TestimonialDisplayRevisionDTO>(
    `/projects/${encodeURIComponent(slug)}/testimonials/${encodeURIComponent(testimonialId)}/display-suggestions`,
    token,
    body,
  );
}

export function approveDisplaySuggestion(
  token: string | null,
  slug: string,
  testimonialId: string,
  revisionId: string,
  body?: { reason?: string },
) {
  return post<V2TestimonialDisplayRevisionDTO>(
    `/projects/${encodeURIComponent(slug)}/testimonials/${encodeURIComponent(testimonialId)}/display-suggestions/${encodeURIComponent(revisionId)}/approve`,
    token,
    body,
  );
}

export function rejectDisplaySuggestion(
  token: string | null,
  slug: string,
  testimonialId: string,
  revisionId: string,
  body?: { reason?: string },
) {
  return post<V2TestimonialDisplayRevisionDTO>(
    `/projects/${encodeURIComponent(slug)}/testimonials/${encodeURIComponent(testimonialId)}/display-suggestions/${encodeURIComponent(revisionId)}/reject`,
    token,
    body,
  );
}

// ── Submissions ─────────────────────────────────────────────────────────────

export function fetchSubmissions(
  token: string | null,
  slug: string,
  params?: {
    page?: number;
    pageSize?: number;
    moderationStatus?: string;
    formId?: string;
  },
) {
  return api<V2PaginatedResponse<V2SubmissionDTO>>(
    `/projects/${encodeURIComponent(slug)}/submissions`,
    token,
    { params: params as Record<string, string | number> },
  );
}

export function fetchSubmission(
  token: string | null,
  slug: string,
  submissionId: string,
) {
  return api<V2SubmissionDTO>(
    `/projects/${encodeURIComponent(slug)}/submissions/${encodeURIComponent(submissionId)}`,
    token,
  );
}

export function createSubmissionAnnotation(
  token: string | null,
  slug: string,
  submissionId: string,
  body: { note?: string; labels?: string[]; sentiment?: string; metadata?: Record<string, unknown> },
) {
  return post<V2SubmissionAnnotationDTO>(
    `/projects/${encodeURIComponent(slug)}/submissions/${encodeURIComponent(submissionId)}/annotations`,
    token,
    body,
  );
}

export function moderateSubmission(
  token: string | null,
  slug: string,
  submissionId: string,
  body: { moderationStatus: string; reason?: string },
) {
  return post<V2SubmissionDTO>(
    `/projects/${encodeURIComponent(slug)}/submissions/${encodeURIComponent(submissionId)}/moderation`,
    token,
    body,
  );
}

// ── Forms ───────────────────────────────────────────────────────────────────

export function fetchForms(token: string | null, slug: string) {
  return api<V2CollectionFormDTO[]>(
    `/projects/${encodeURIComponent(slug)}/forms`,
    token,
  );
}

export function fetchForm(token: string | null, slug: string, formId: string) {
  return api<V2CollectionFormDTO>(
    `/projects/${encodeURIComponent(slug)}/forms/${encodeURIComponent(formId)}`,
    token,
  );
}

export function createForm(
  token: string | null,
  slug: string,
  body: { name: string; description?: string; config?: unknown },
) {
  return post<V2CollectionFormDTO>(
    `/projects/${encodeURIComponent(slug)}/forms`,
    token,
    body,
  );
}

export function updateForm(
  token: string | null,
  slug: string,
  formId: string,
  body: Record<string, unknown>,
) {
  return patch<V2CollectionFormDTO>(
    `/projects/${encodeURIComponent(slug)}/forms/${encodeURIComponent(formId)}`,
    token,
    body,
  );
}

export function deleteForm(token: string | null, slug: string, formId: string) {
  return del(
    `/projects/${encodeURIComponent(slug)}/forms/${encodeURIComponent(formId)}`,
    token,
  );
}

export function fetchFormDraft(token: string | null, slug: string, formId: string) {
  return api<V2StudioDraftDTO>(
    `/projects/${encodeURIComponent(slug)}/forms/${encodeURIComponent(formId)}/draft`,
    token,
  );
}

export function saveFormDraft(
  token: string | null,
  slug: string,
  formId: string,
  body: { draft: Record<string, unknown>; expectedVersion: number },
) {
  return put<V2StudioDraftDTO>(
    `/projects/${encodeURIComponent(slug)}/forms/${encodeURIComponent(formId)}/draft`,
    token,
    body,
  );
}

// ── Widgets ─────────────────────────────────────────────────────────────────

export function fetchWidgets(token: string | null, slug: string) {
  return api<V2WidgetListEntry[]>(
    `/projects/${encodeURIComponent(slug)}/widgets`,
    token,
  );
}

export function fetchWidget(token: string | null, slug: string, widgetId: string) {
  return api<V2WidgetDTO>(
    `/projects/${encodeURIComponent(slug)}/widgets/${encodeURIComponent(widgetId)}`,
    token,
  );
}

export function createWidget(
  token: string | null,
  slug: string,
  body: Record<string, unknown>,
) {
  return post<V2WidgetDTO>(
    `/projects/${encodeURIComponent(slug)}/widgets`,
    token,
    body,
  );
}

export function updateWidget(
  token: string | null,
  slug: string,
  widgetId: string,
  body: Record<string, unknown>,
) {
  return patch<V2WidgetDTO>(
    `/projects/${encodeURIComponent(slug)}/widgets/${encodeURIComponent(widgetId)}`,
    token,
    body,
  );
}

export function deleteWidget(token: string | null, slug: string, widgetId: string) {
  return del(
    `/projects/${encodeURIComponent(slug)}/widgets/${encodeURIComponent(widgetId)}`,
    token,
  );
}

export function fetchWidgetDraft(token: string | null, slug: string, widgetId: string) {
  return api<V2StudioDraftDTO>(
    `/projects/${encodeURIComponent(slug)}/widgets/${encodeURIComponent(widgetId)}/draft`,
    token,
  );
}

export function saveWidgetDraft(
  token: string | null,
  slug: string,
  widgetId: string,
  body: { draft: Record<string, unknown>; expectedVersion: number },
) {
  return put<V2StudioDraftDTO>(
    `/projects/${encodeURIComponent(slug)}/widgets/${encodeURIComponent(widgetId)}/draft`,
    token,
    body,
  );
}

// ── API keys ────────────────────────────────────────────────────────────────

export function fetchApiKeys(token: string | null, slug: string) {
  return api<V2ApiKeyDTO[]>(
    `/projects/${encodeURIComponent(slug)}/api-keys`,
    token,
  );
}

export function createApiKey(
  token: string | null,
  slug: string,
  body: { name: string; scopes?: string[]; expiresAt?: string },
) {
  return post<V2CreatedApiKeyDTO>(
    `/projects/${encodeURIComponent(slug)}/api-keys`,
    token,
    body,
  );
}

export function rotateApiKey(token: string | null, slug: string, keyId: string) {
  return post<V2CreatedApiKeyDTO>(
    `/projects/${encodeURIComponent(slug)}/api-keys/${encodeURIComponent(keyId)}/rotate`,
    token,
  );
}

export function revokeApiKey(token: string | null, slug: string, keyId: string) {
  return post<V2ApiKeyDTO>(
    `/projects/${encodeURIComponent(slug)}/api-keys/${encodeURIComponent(keyId)}/revoke`,
    token,
  );
}

export function fetchApiKeyEvents(token: string | null, slug: string, keyId: string) {
  return api<V2ApiKeyEventDTO[]>(
    `/projects/${encodeURIComponent(slug)}/api-keys/${encodeURIComponent(keyId)}/events`,
    token,
  );
}

// ── Agent access ────────────────────────────────────────────────────────────

export function fetchAgentAccessOverview(token: string | null, slug: string) {
  return api<V2AgentAccessOverviewDTO>(
    `/projects/${encodeURIComponent(slug)}/agent-access`,
    token,
  );
}

export function createAgentKey(
  token: string | null,
  slug: string,
  body: { name: string; presetId: string },
) {
  return post<V2CreatedApiKeyDTO>(
    `/projects/${encodeURIComponent(slug)}/agent-access/keys`,
    token,
    body,
  );
}

export function revokeAgentKey(token: string | null, slug: string, keyId: string) {
  return post<V2ApiKeyDTO>(
    `/projects/${encodeURIComponent(slug)}/agent-access/keys/${encodeURIComponent(keyId)}/revoke`,
    token,
  );
}

export function fetchAgentActions(token: string | null, slug: string) {
  return api<V2ApiKeyEventDTO[]>(
    `/projects/${encodeURIComponent(slug)}/agent-access/actions`,
    token,
  );
}

// ── Re-exports for convenience ──────────────────────────────────────────────

export { ApiError as TrestaApiError };
export type { V2ApiMeta, V2ApiEnvelope, V2ErrorResponse };
