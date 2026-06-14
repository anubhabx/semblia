import { runtimeApiPost } from "./api-client.js";
import type { FormsRuntimeEnv } from "./env.js";
import type {
  FormsRuntimeServices,
  HostedFormRequestMetadata,
  HostedFormResolveResult,
  HostedFormUploadIntentResult,
} from "./types.js";

function toApiContext(context: {
  projectPublicSlug: string;
  formSlug: string | null;
  path: string;
}) {
  return {
    projectPublicSlug: context.projectPublicSlug,
    formSlug: context.formSlug,
    path: context.path,
  };
}

function runtimeForwardHeaders(
  metadata: HostedFormRequestMetadata | undefined,
): Record<string, string> {
  return {
    ...(metadata?.userAgent
      ? { "x-semblia-original-user-agent": metadata.userAgent }
      : {}),
    ...(metadata?.forwardedFor
      ? { "x-semblia-original-forwarded-for": metadata.forwardedFor }
      : {}),
  };
}

export function createApiRuntimeServices(
  env: FormsRuntimeEnv,
): FormsRuntimeServices {
  return {
    resolveForm(context, metadata) {
      return runtimeApiPost<HostedFormResolveResult>(
        env,
        "/runtime/forms/resolve",
        toApiContext(context),
        {
          "x-semblia-original-host": context.host,
          "x-semblia-original-path": context.path,
          ...runtimeForwardHeaders(metadata),
        },
      );
    },
    submitForm(input) {
      return runtimeApiPost<{ redirectTo: string | null }>(
        env,
        "/runtime/forms/submit",
        {
          context: toApiContext(input.context),
          contentType: input.contentType,
          body: input.body,
        },
        {
          "x-semblia-original-host": input.context.host,
          "x-semblia-original-path": input.context.path,
          ...runtimeForwardHeaders(input.metadata),
        },
      );
    },
    async createUploadIntent(input) {
      const intent = await runtimeApiPost<
        HostedFormUploadIntentResult & { storageKey?: string }
      >(
        env,
        "/runtime/forms/upload-intent",
        {
          context: toApiContext(input.context),
          contentType: input.contentType,
          byteSize: input.byteSize,
          ...(input.checksumSha256
            ? { checksumSha256: input.checksumSha256 }
            : {}),
        },
        {
          "x-semblia-original-host": input.context.host,
          "x-semblia-original-path": input.context.path,
          ...runtimeForwardHeaders(input.metadata),
        },
      );
      // The internal storage key never reaches the browser.
      return {
        assetId: intent.assetId,
        uploadUrl: intent.uploadUrl,
        requiredHeaders: intent.requiredHeaders ?? {},
        expiresAt: intent.expiresAt,
      };
    },
  };
}
