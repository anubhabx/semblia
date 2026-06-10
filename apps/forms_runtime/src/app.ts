import {
  createFormViewModel,
  normalizeFormConfig,
} from "@workspace/forms-core";
import {
  HOSTED_RUNTIME_SHA256,
  renderHostedFormHtml,
} from "@workspace/forms-core/html";
import { Hono } from "hono";
import type { Context } from "hono";
import { createApiRuntimeServices } from "./api-services.js";
import type { FormsRuntimeEnv } from "./env.js";
import { createMockRuntimeServices } from "./mock-services.js";
import {
  resolveRequestContext,
  toSubmitPath,
  toSubmittedFormPath,
} from "./request-context.js";
import type { FormsRuntimeServices } from "./types.js";

const maxBodyBytes = 64 * 1024;
const securityHeaders = {
  "content-security-policy": [
    "default-src 'none'",
    "base-uri 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "img-src 'self' https: data:",
    // Inline token CSS + the Google Fonts stylesheet the renderer links.
    "style-src 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https: data:",
    // Only the exact inline client runtime shipped by forms-core may run.
    `script-src 'sha256-${HOSTED_RUNTIME_SHA256}'`,
    "connect-src 'none'",
  ].join("; "),
  "permissions-policy":
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  "referrer-policy": "strict-origin-when-cross-origin",
  "strict-transport-security": "max-age=31536000; includeSubDomains; preload",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
};

function applySecurityHeaders(c: Context): void {
  for (const [name, value] of Object.entries(securityHeaders)) {
    c.header(name, value);
  }
}

function isLocalDevHost(host: string): boolean {
  if (host.startsWith("[::1]")) return true;
  const hostname = host.split(":")[0]?.toLowerCase();
  return hostname === "localhost" || hostname === "127.0.0.1";
}

function resolveRuntimeHost(
  originalHost: string | undefined,
  headerHost: string | undefined,
  url: URL,
  env: FormsRuntimeEnv,
): string {
  const host = originalHost ?? headerHost ?? url.host;
  if (env.FORMS_RUNTIME_MODE === "mock" && isLocalDevHost(host)) {
    return `demo.${env.FORMS_RUNTIME_PUBLIC_BASE_DOMAIN}`;
  }

  return host;
}

export function createFormsRuntimeApp(
  env: FormsRuntimeEnv,
  services: FormsRuntimeServices = env.FORMS_RUNTIME_MODE === "mock"
    ? createMockRuntimeServices()
    : createApiRuntimeServices(env),
) {
  const app = new Hono();

  app.use("*", async (c, next) => {
    await next();
    applySecurityHeaders(c);
  });

  app.onError((error, c) => {
    applySecurityHeaders(c);
    console.error("forms_runtime request failed", error);
    return c.text("Hosted form is temporarily unavailable", 503);
  });

  app.get("/health", (c) => c.json({ ok: true }));

  app.post("*", async (c, next) => {
    const url = new URL(c.req.url);
    const host = resolveRuntimeHost(
      c.req.header("x-tresta-original-host"),
      c.req.header("host"),
      url,
      env,
    );
    if (!url.pathname.endsWith("/__submit")) {
      await next();
      return;
    }

    const formPath = toSubmittedFormPath(url.pathname);
    const context = resolveRequestContext({
      host,
      url: formPath,
      baseDomain: env.FORMS_RUNTIME_PUBLIC_BASE_DOMAIN,
    });
    const body = await c.req.text();
    if (new TextEncoder().encode(body).byteLength > maxBodyBytes) {
      return c.text("Request body too large", 413);
    }

    const result = await services.submitForm({
      context,
      contentType: c.req.header("content-type") ?? "",
      body,
      metadata: {
        userAgent: c.req.header("user-agent"),
        forwardedFor: c.req.header("x-forwarded-for"),
      },
    });

    return c.redirect(result.redirectTo ?? `${formPath}?submitted=1`, 303);
  });

  app.get("*", async (c) => {
    const url = new URL(c.req.url);
    const host = resolveRuntimeHost(
      c.req.header("x-tresta-original-host"),
      c.req.header("host"),
      url,
      env,
    );
    const submitted = url.searchParams.get("submitted") === "1";
    const context = resolveRequestContext({
      host,
      url: `${url.pathname}${url.search}`,
      baseDomain: env.FORMS_RUNTIME_PUBLIC_BASE_DOMAIN,
    });
    const resolved = await services.resolveForm(context, {
      userAgent: c.req.header("user-agent"),
      forwardedFor: c.req.header("x-forwarded-for"),
    });
    const model = createFormViewModel(
      normalizeFormConfig(resolved.form.config),
    );
    const html = renderHostedFormHtml({
      model: {
        ...model,
        brandName: model.brandName || resolved.project.name,
      },
      actionPath: toSubmitPath(context.path),
      submitted,
    });

    return c.html(html, 200, {
      "cache-control": "public, s-maxage=60, stale-while-revalidate=300",
    });
  });

  app.notFound((c) => c.text("Not found", 404));

  return app;
}
