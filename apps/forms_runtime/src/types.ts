import type { HostedFormRequestContext } from "./request-context.js";

export interface HostedFormResolveResult {
  project: {
    id: string;
    slug: string;
    name: string;
    publicSlug: string;
    brandColorPrimary: string | null;
  };
  form: {
    id: string;
    slug: string | null;
    name: string;
    description: string | null;
    /** Persisted form config; brought to the v4 envelope via migrateFormDoc at render time. */
    config: unknown;
    publishedAt: string | null;
  };
}

export interface HostedFormSubmitResult {
  redirectTo: string | null;
}

/** Browser-facing presigned upload intent for a submission attachment. */
export interface HostedFormUploadIntentResult {
  assetId: string;
  uploadUrl: string;
  requiredHeaders: Record<string, string>;
  expiresAt: string;
}

export interface HostedFormRequestMetadata {
  userAgent?: string;
  forwardedFor?: string;
}

export interface FormsRuntimeServices {
  resolveForm(
    context: HostedFormRequestContext,
    metadata?: HostedFormRequestMetadata,
  ): Promise<HostedFormResolveResult>;
  submitForm(input: {
    context: HostedFormRequestContext;
    contentType: string;
    body: string;
    metadata?: HostedFormRequestMetadata;
  }): Promise<HostedFormSubmitResult>;
  createUploadIntent(input: {
    context: HostedFormRequestContext;
    contentType: string;
    byteSize: number;
    checksumSha256?: string;
    metadata?: HostedFormRequestMetadata;
  }): Promise<HostedFormUploadIntentResult>;
}
