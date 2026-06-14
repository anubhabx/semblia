import { z } from "zod";

const envSchema = z
  .object({
    PORT: z.coerce.number().int().positive().default(3007),
    FORMS_RUNTIME_MODE: z.enum(["api", "mock"]).default("api"),
    FORMS_RUNTIME_API_BASE_URL: z.string().url().optional(),
    FORMS_RUNTIME_SIGNING_SECRET: z.string().min(32).optional(),
    FORMS_RUNTIME_PUBLIC_BASE_DOMAIN: z.string().default("collect.semblia.com"),
    FORMS_RUNTIME_ASSET_BASE_URL: z.string().url().optional(),
    /**
     * Space-separated CSP `connect-src` origins the browser may PUT a presigned
     * attachment to (the storage bucket host). Only applied to forms that have a
     * file question. Defaults to `https:` so uploads work out of the box; tighten
     * to the exact bucket origin in production.
     */
    FORMS_RUNTIME_UPLOAD_CONNECT_SRC: z.string().default("https:"),
    FORMS_RUNTIME_API_TIMEOUT_MS: z.coerce
      .number()
      .int()
      .positive()
      .default(5000),
  })
  .superRefine((env, ctx) => {
    if (env.FORMS_RUNTIME_MODE === "mock") return;
    if (!env.FORMS_RUNTIME_API_BASE_URL) {
      ctx.addIssue({
        code: "custom",
        path: ["FORMS_RUNTIME_API_BASE_URL"],
        message: "FORMS_RUNTIME_API_BASE_URL is required in api mode",
      });
    }
    if (!env.FORMS_RUNTIME_SIGNING_SECRET) {
      ctx.addIssue({
        code: "custom",
        path: ["FORMS_RUNTIME_SIGNING_SECRET"],
        message: "FORMS_RUNTIME_SIGNING_SECRET is required in api mode",
      });
    }
  });

export type FormsRuntimeEnv = z.infer<typeof envSchema>;

export function loadEnv(source: NodeJS.ProcessEnv): FormsRuntimeEnv {
  return envSchema.parse(source);
}
