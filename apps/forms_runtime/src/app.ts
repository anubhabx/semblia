import { createHash } from "node:crypto";
import { migrateFormDoc, publishFormDefinition } from "@workspace/forms-core/schema";
import {
  renderFormStubFragmentHtml,
  renderFormStubPageHtml,
  renderPublishedFormFragment,
  renderPublishedFormPage,
} from "@workspace/forms-core/render";
import { Hono } from "hono";
import type { Context } from "hono";
import { createApiRuntimeServices } from "./api-services.js";
import type { FormsRuntimeEnv } from "./env.js";
import { createMockRuntimeServices } from "./mock-services.js";
import {
  resolveRequestContext,
  toEmbeddedFormPath,
  toSubmittedFormPath,
  toUploadFormPath,
} from "./request-context.js";
import type { FormsRuntimeServices } from "./types.js";

type RuntimeVariables = { formScriptSrc?: string; formConnectSrc?: string };

const maxBodyBytes = 64 * 1024;
const maxUploadIntentBytes = 4 * 1024;

/** CSP `'sha256-…'` source for an inline script, so it executes without `'unsafe-inline'`. */
function scriptHash(script: string): string {
  return `'sha256-${createHash("sha256").update(script, "utf8").digest("base64")}'`;
}

/** All inline runtime scripts the page ships → one CSP `script-src` allowance. */
function scriptSrcFor(scripts: string[]): string {
  if (scripts.length === 0) return "script-src 'none'";
  return `script-src ${scripts.map(scriptHash).join(" ")}`;
}

function buildSecurityHeaders(
  scriptSrc: string,
  connectSrc: string,
): Record<string, string> {
  return {
    "content-security-policy": [
      "default-src 'none'",
      "base-uri 'none'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "img-src 'self' https: data:",
      // The form's inline <style> block (incl. its @font-face) and the brand
      // font it ships as a self-contained data-URI woff2 — no external origin.
      "style-src 'unsafe-inline'",
      "font-src 'self' data:",
      scriptSrc,
      connectSrc,
    ].join("; "),
    "permissions-policy":
      "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
    "referrer-policy": "strict-origin-when-cross-origin",
    "strict-transport-security": "max-age=31536000; includeSubDomains; preload",
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
  };
}

function applySecurityHeaders(
  c: Context,
  scriptSrc?: string,
  connectSrc?: string,
): void {
  const headers = buildSecurityHeaders(
    scriptSrc ?? "script-src 'none'",
    connectSrc ?? "connect-src 'none'",
  );
  for (const [name, value] of Object.entries(headers)) {
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
  const app = new Hono<{ Variables: RuntimeVariables }>();

  app.use("*", async (c, next) => {
    await next();
    applySecurityHeaders(c, c.get("formScriptSrc"), c.get("formConnectSrc"));
  });

  app.onError((error, c) => {
    applySecurityHeaders(c);
    console.error("forms_runtime request failed", error);
    return c.text("Hosted form is temporarily unavailable", 503);
  });

  app.get("/health", (c) => c.json({ ok: true }));

  // Local-dev attachment sink: the mock upload intent points file PUTs here so
  // the end-to-end flow works without S3. Never matched in api mode.
  app.put("/__mock-upload", (c) => c.body(null, 200));

  // Presigned upload intent for a submission attachment — same-origin POST from
  // the hosted page runtime. Proxies (signed) to api_v2, which scopes the asset
  // to the resolved form's project + the forwarded browser IP (the submit
  // principal), then the browser PUTs the file straight to the returned URL.
  app.post("*", async (c, next) => {
    const url = new URL(c.req.url);
    if (!url.pathname.endsWith("/__upload")) {
      await next();
      return;
    }
    const host = resolveRuntimeHost(
      c.req.header("x-semblia-original-host"),
      c.req.header("host"),
      url,
      env,
    );
    const formPath = toUploadFormPath(url.pathname);
    const context = resolveRequestContext({
      host,
      url: formPath,
      baseDomain: env.FORMS_RUNTIME_PUBLIC_BASE_DOMAIN,
    });
    const raw = await c.req.text();
    if (new TextEncoder().encode(raw).byteLength > maxUploadIntentBytes) {
      return c.text("Request body too large", 413);
    }
    let parsed: { contentType?: unknown; byteSize?: unknown; checksumSha256?: unknown };
    try {
      parsed = JSON.parse(raw || "{}");
    } catch {
      return c.json({ error: "invalid_body" }, 400);
    }
    if (
      typeof parsed.contentType !== "string" ||
      typeof parsed.byteSize !== "number" ||
      !Number.isFinite(parsed.byteSize) ||
      parsed.byteSize <= 0
    ) {
      return c.json({ error: "invalid_body" }, 400);
    }
    try {
      const intent = await services.createUploadIntent({
        context,
        contentType: parsed.contentType,
        byteSize: parsed.byteSize,
        ...(typeof parsed.checksumSha256 === "string"
          ? { checksumSha256: parsed.checksumSha256 }
          : {}),
        metadata: {
          userAgent: c.req.header("user-agent"),
          forwardedFor: c.req.header("x-forwarded-for"),
        },
      });
      return c.json(intent, 200);
    } catch (error) {
      console.error("forms_runtime upload intent failed", error);
      return c.json({ error: "upload_intent_failed" }, 502);
    }
  });

  // Form submission — native POST from the hosted page (303 redirect) or a
  // cross-origin fetch from the embed loader (`?embed=1` → JSON + CORS).
  app.post("*", async (c, next) => {
    const url = new URL(c.req.url);
    if (!url.pathname.endsWith("/__submit")) {
      await next();
      return;
    }
    const host = resolveRuntimeHost(
      c.req.header("x-semblia-original-host"),
      c.req.header("host"),
      url,
      env,
    );
    const isEmbed = url.searchParams.get("embed") === "1";

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

    if (isEmbed) {
      // The loader handles success in-place; never navigate the host page.
      return c.json(
        { ok: true, redirectTo: result.redirectTo ?? null },
        200,
        { "access-control-allow-origin": "*" },
      );
    }
    return c.redirect(result.redirectTo ?? `${formPath}?submitted=1`, 303);
  });

  // Embed fragment — fetched cross-origin by the <semblia-form> loader and
  // mounted into a Shadow DOM root. One round trip: markup, scoped styles, and
  // derived theme travel together. No executable script (it would not run in a
  // shadow root); the loader owns submit interception.
  app.get("*", async (c, next) => {
    const url = new URL(c.req.url);
    if (!url.pathname.endsWith("/__embed")) {
      await next();
      return;
    }
    const host = resolveRuntimeHost(
      c.req.header("x-semblia-original-host"),
      c.req.header("host"),
      url,
      env,
    );
    const embeddedPath = toEmbeddedFormPath(url.pathname);
    const context = resolveRequestContext({
      host,
      url: embeddedPath,
      baseDomain: env.FORMS_RUNTIME_PUBLIC_BASE_DOMAIN,
    });
    const resolved = await services.resolveForm(context, {
      userAgent: c.req.header("user-agent"),
      forwardedFor: c.req.header("x-forwarded-for"),
    });

    const submitted = url.searchParams.get("submitted") === "1";
    const pathBase = embeddedPath === "/" ? "" : embeddedPath;
    let fragmentHtml: string;
    try {
      const doc = publishFormDefinition(migrateFormDoc(resolved.form.config));
      fragmentHtml = renderPublishedFormFragment(doc, {
        brandFallback: resolved.project.name,
        actionUrl: `https://${host}${pathBase}/__submit?embed=1`,
        submitted,
      }).html;
    } catch (error) {
      console.error("forms_runtime embed render failed", error);
      fragmentHtml = renderFormStubFragmentHtml({
        brandName: resolved.project.name,
      });
    }

    return c.html(fragmentHtml, 200, {
      // Public embed surface: any site may fetch it; the edge may cache it.
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET",
      "cache-control": "public, s-maxage=60, stale-while-revalidate=300",
      vary: "accept-encoding",
    });
  });

  // Hosted page — the full document served at the collect host.
  app.get("*", async (c) => {
    const url = new URL(c.req.url);
    const host = resolveRuntimeHost(
      c.req.header("x-semblia-original-host"),
      c.req.header("host"),
      url,
      env,
    );
    const context = resolveRequestContext({
      host,
      url: `${url.pathname}${url.search}`,
      baseDomain: env.FORMS_RUNTIME_PUBLIC_BASE_DOMAIN,
    });
    const resolved = await services.resolveForm(context, {
      userAgent: c.req.header("user-agent"),
      forwardedFor: c.req.header("x-forwarded-for"),
    });

    const submitted = url.searchParams.get("submitted") === "1";
    let html: string;
    let scripts: string[];
    let requiresUpload = false;
    try {
      // Config flows through migrate + publish so an unmigratable row fails
      // loudly here rather than rendering an unstyled form.
      const doc = publishFormDefinition(migrateFormDoc(resolved.form.config));
      const rendered = renderPublishedFormPage(doc, {
        formPath: context.path,
        brandFallback: resolved.project.name,
        submitted,
      });
      html = rendered.html;
      scripts = rendered.inlineScripts;
      requiresUpload = rendered.requiresUpload;
    } catch (error) {
      console.error("forms_runtime page render failed", error);
      html = renderFormStubPageHtml({ brandName: resolved.project.name });
      scripts = [];
    }

    c.set("formScriptSrc", scriptSrcFor(scripts));
    // Open connect-src only for forms that upload: 'self' for the upload-intent
    // proxy, the configured storage origin for the presigned PUT.
    if (requiresUpload) {
      c.set(
        "formConnectSrc",
        `connect-src 'self' ${env.FORMS_RUNTIME_UPLOAD_CONNECT_SRC}`,
      );
    }
    return c.html(html, 200, {
      "cache-control": submitted
        ? "no-store"
        : "public, s-maxage=60, stale-while-revalidate=300",
    });
  });

  app.notFound((c) => c.text("Not found", 404));

  return app;
}
