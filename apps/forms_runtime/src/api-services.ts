import type { PublicSnapshot } from "@workspace/forms-core";
import { runtimeApiRequest } from "./api-client.js";
import type { FormsRuntimeEnv } from "./env.js";
import type {
  FormsRuntimeServices,
  RuntimeForwardMetadata,
  RuntimeSubmitResult,
  RuntimeUploadIntentResult,
} from "./types.js";

function runtimeForwardHeaders(
  metadata: RuntimeForwardMetadata | undefined,
): Record<string, string | undefined> {
  return {
    origin: metadata?.origin,
    "user-agent": metadata?.userAgent,
    "x-forwarded-for": metadata?.forwardedFor,
    "idempotency-key": metadata?.idempotencyKey,
    "x-semblia-signature": metadata?.signature,
    "x-semblia-timestamp": metadata?.timestamp,
  };
}

function snapshotPath(slug: string, projectId: string) {
  return `/runtime/forms/${encodeURIComponent(slug)}/snapshot?projectId=${encodeURIComponent(projectId)}`;
}

function submitPath(slug: string, projectId: string) {
  return `/runtime/forms/${encodeURIComponent(slug)}/submissions?projectId=${encodeURIComponent(projectId)}`;
}

function presignPath(slug: string, projectId: string) {
  return `/runtime/forms/${encodeURIComponent(slug)}/uploads/presign?projectId=${encodeURIComponent(projectId)}`;
}

function stripStorageKey(
  intent: RuntimeUploadIntentResult & { storageKey?: string },
): RuntimeUploadIntentResult {
  return {
    assetId: intent.assetId,
    uploadUrl: intent.uploadUrl,
    requiredHeaders: intent.requiredHeaders ?? {},
    expiresAt: intent.expiresAt,
  };
}

export function createApiRuntimeServices(
  env: FormsRuntimeEnv,
): FormsRuntimeServices {
  return {
    getSnapshotBySlug(context, metadata) {
      return runtimeApiRequest<PublicSnapshot>({
        env,
        method: "GET",
        path: snapshotPath(context.slug, context.projectId),
        headers: runtimeForwardHeaders({
          ...(metadata ?? {}),
          origin: metadata?.origin ?? context.origin,
        }),
      });
    },
    getSnapshotById(snapshotId, metadata) {
      return runtimeApiRequest<PublicSnapshot>({
        env,
        method: "GET",
        path: `/runtime/snapshots/${encodeURIComponent(snapshotId)}`,
        headers: runtimeForwardHeaders(metadata),
      });
    },
    submitForm(input) {
      return runtimeApiRequest<RuntimeSubmitResult>({
        env,
        method: "POST",
        path: submitPath(input.context.slug, input.context.projectId),
        rawBody: input.rawBody,
        headers: runtimeForwardHeaders({
          ...(input.metadata ?? {}),
          origin: input.metadata?.origin ?? input.context.origin,
        }),
      });
    },
    async presignUpload(input) {
      const intent = await runtimeApiRequest<
        RuntimeUploadIntentResult & { storageKey?: string }
      >({
        env,
        method: "POST",
        path: presignPath(input.context.slug, input.context.projectId),
        rawBody: input.rawBody,
        headers: runtimeForwardHeaders({
          ...(input.metadata ?? {}),
          origin: input.metadata?.origin ?? input.context.origin,
        }),
      });

      return stripStorageKey(intent);
    },
  };
}
