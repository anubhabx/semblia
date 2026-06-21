import { describe, expect, it } from "vitest";
import type { FormsRuntimeEnv } from "./env.js";
import {
  assertFormSlug,
  normalizeOrigin,
  resolveRequestContext,
  resolveRuntimeHost,
} from "./request-context.js";

const env: FormsRuntimeEnv = {
  FORMS_RUNTIME_MODE: "api",
  FORMS_RUNTIME_API_BASE_URL: "https://api.semblia.test/v2",
  FORMS_RUNTIME_SIGNING_SECRET: "s".repeat(32),
  FORMS_RUNTIME_PUBLIC_BASE_DOMAIN: "forms.semblia.test",
  FORMS_RUNTIME_PROJECT_ID: "project_default",
  FORMS_RUNTIME_PROJECT_ID_BY_HOST: {
    "forms.customer.example": "project_from_host",
  },
  FORMS_RUNTIME_UPLOAD_CONNECT_SRC: "https:",
  FORMS_RUNTIME_API_TIMEOUT_MS: 5000,
  FORMS_RUNTIME_EDGE_RATE_WINDOW_MS: 60_000,
  PORT: 3007,
};

describe("resolveRequestContext", () => {
  it("uses explicit projectId query as the current api_v2 bridge", () => {
    const url = new URL(
      "https://forms.semblia.test/f/customer-feedback?projectId=project_query",
    );

    expect(
      resolveRequestContext({
        env,
        host: "forms.semblia.test",
        origin: "https://forms.semblia.test/path",
        slug: "customer-feedback",
        url,
        surface: "hosted",
      }),
    ).toEqual({
      host: "forms.semblia.test",
      origin: "https://forms.semblia.test",
      projectId: "project_query",
      slug: "customer-feedback",
      path: "/f/customer-feedback",
      surface: "hosted",
    });
  });

  it("falls back to host map and then env default project id", () => {
    const mappedUrl = new URL("https://forms.customer.example/f/customer-feedback");
    const defaultUrl = new URL("https://forms.semblia.test/f/customer-feedback");

    expect(
      resolveRequestContext({
        env,
        host: "forms.customer.example",
        slug: "customer-feedback",
        url: mappedUrl,
        surface: "hosted",
      }).projectId,
    ).toBe("project_from_host");
    expect(
      resolveRequestContext({
        env,
        host: "forms.semblia.test",
        slug: "customer-feedback",
        url: defaultUrl,
        surface: "hosted",
      }).projectId,
    ).toBe("project_default");
  });

  it("rejects invalid form slugs", () => {
    expect(() => assertFormSlug("Bad Slug")).toThrow("Invalid form slug");
    expect(assertFormSlug("customer-feedback")).toBe("customer-feedback");
  });

  it("normalizes origins and resolves the CloudFront original host", () => {
    expect(normalizeOrigin("https://customer.example/path?q=1")).toBe(
      "https://customer.example",
    );
    expect(
      resolveRuntimeHost({
        originalHost: "Forms.Customer.Example",
        headerHost: "lambda-url.example",
        url: new URL("https://lambda-url.example/f/customer-feedback"),
        env,
      }),
    ).toBe("forms.customer.example");
  });
});
