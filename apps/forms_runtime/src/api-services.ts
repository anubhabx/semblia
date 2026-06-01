import { runtimeApiPost } from "./api-client.js";
import type { FormsRuntimeEnv } from "./env.js";
import type {
  FormsRuntimeServices,
  HostedFormRequestMetadata,
  HostedFormResolveResult,
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
      ? { "x-tresta-original-user-agent": metadata.userAgent }
      : {}),
    ...(metadata?.forwardedFor
      ? { "x-tresta-original-forwarded-for": metadata.forwardedFor }
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
          "x-tresta-original-host": context.host,
          "x-tresta-original-path": context.path,
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
          "x-tresta-original-host": input.context.host,
          "x-tresta-original-path": input.context.path,
          ...runtimeForwardHeaders(input.metadata),
        },
      );
    },
  };
}
