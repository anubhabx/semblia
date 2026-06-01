import { describe, expect, it } from "vitest";
import {
  resolveRequestContext,
  toSubmitPath,
  toSubmittedFormPath,
} from "./request-context.js";

describe("resolveRequestContext", () => {
  it("extracts project public slug and default path", () => {
    expect(
      resolveRequestContext({
        host: "acme.collect.tresta.app",
        url: "/",
        baseDomain: "collect.tresta.app",
      }),
    ).toEqual({
      host: "acme.collect.tresta.app",
      projectPublicSlug: "acme",
      formSlug: null,
      path: "/",
    });
  });

  it("extracts form slug from a one-segment path", () => {
    expect(
      resolveRequestContext({
        host: "acme.collect.tresta.app",
        url: "/customer-feedback?utm=x",
        baseDomain: "collect.tresta.app",
      }),
    ).toEqual({
      host: "acme.collect.tresta.app",
      projectPublicSlug: "acme",
      formSlug: "customer-feedback",
      path: "/customer-feedback",
    });
  });

  it("accepts custom hosts and preserves the viewer host for API resolution", () => {
    expect(
      resolveRequestContext({
        host: "feedback.customer.example",
        url: "/customer-feedback?utm=x",
        baseDomain: "collect.tresta.app",
      }),
    ).toEqual({
      host: "feedback.customer.example",
      projectPublicSlug: "feedback",
      formSlug: "customer-feedback",
      path: "/customer-feedback",
    });
  });

  it("rejects non collect hosts", () => {
    expect(() =>
      resolveRequestContext({
        host: "localhost",
        url: "/",
        baseDomain: "collect.tresta.app",
      }),
    ).toThrow("Unsupported hosted form host");
  });

  it("maps form paths to submit paths and back", () => {
    expect(toSubmitPath("/")).toBe("/__submit");
    expect(toSubmitPath("/customer-feedback")).toBe(
      "/customer-feedback/__submit",
    );
    expect(toSubmittedFormPath("/customer-feedback/__submit")).toBe(
      "/customer-feedback",
    );
  });
});
