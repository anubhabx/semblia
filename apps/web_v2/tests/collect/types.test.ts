import { describe, expect, it } from "vitest";
import {
  DEFAULT_CONFIG,
  buildInitialConfig,
  deepEqual,
  deepMerge,
  isFieldEnabled,
  isFieldRequired,
  migrateLegacy,
} from "@/lib/collect/types";
import type { LegacyFormConfig } from "@/lib/collect/types";
import { makeProject } from "../helpers/fixtures";

describe("lib/collect/types — deepMerge", () => {
  it("merges nested patches without mutating the target", () => {
    const base = structuredClone(DEFAULT_CONFIG);
    const next = deepMerge(base, {
      branding: { colors: { primary: "#ff00aa" } },
    });

    expect(next.branding.colors.primary).toBe("#ff00aa");
    expect(next.branding.colors.background).toBe(
      DEFAULT_CONFIG.branding.colors.background,
    );
    // target unchanged
    expect(base.branding.colors.primary).toBe(
      DEFAULT_CONFIG.branding.colors.primary,
    );
  });

  it("replaces arrays rather than merging them", () => {
    const base = structuredClone(DEFAULT_CONFIG);
    const next = deepMerge(base, {
      behavior: { oauthProviders: ["github"] },
    });
    expect(next.behavior.oauthProviders).toEqual(["github"]);
  });

  it("replaces discriminated union values whole", () => {
    const base = structuredClone(DEFAULT_CONFIG);
    const next = deepMerge(base, {
      content: { successAction: { kind: "redirect", url: "https://x" } },
    });
    expect(next.content.successAction).toEqual({
      kind: "redirect",
      url: "https://x",
    });
  });
});

describe("lib/collect/types — deepEqual", () => {
  it("returns true for structurally identical configs", () => {
    const a = structuredClone(DEFAULT_CONFIG);
    const b = structuredClone(DEFAULT_CONFIG);
    expect(deepEqual(a, b)).toBe(true);
  });

  it("returns false when any leaf diverges", () => {
    const a = structuredClone(DEFAULT_CONFIG);
    const b = structuredClone(DEFAULT_CONFIG);
    b.branding.colors.primary = "#111111";
    expect(deepEqual(a, b)).toBe(false);
  });
});

describe("lib/collect/types — buildInitialConfig", () => {
  it("derives primary/accent colors from project brand", () => {
    const project = makeProject({
      brandColorPrimary: "#10b981",
      brandColorSecondary: "#0ea5e9",
      name: "GreenApp",
    });
    const cfg = buildInitialConfig(project);
    expect(cfg.branding.colors.primary).toBe("#10b981");
    expect(cfg.branding.colors.accent).toBe("#0ea5e9");
  });

  it("includes project name in the default header title", () => {
    const project = makeProject({ name: "Launchpad" });
    const cfg = buildInitialConfig(project);
    expect(cfg.content.headerTitle).toContain("Launchpad");
  });

  it("sets pathSuffix to the project slug", () => {
    const project = makeProject({ slug: "acme-widgets" });
    const cfg = buildInitialConfig(project);
    expect(cfg.delivery.pathSuffix).toBe("acme-widgets");
  });
});

describe("lib/collect/types — migrateLegacy", () => {
  const legacy: LegacyFormConfig = {
    headerTitle: "Old title",
    headerDescription: "Old desc",
    thankYouMessage: "Thanks old",
    enableRating: false,
    enableJobTitle: true,
    enableCompany: true,
    enableAvatar: false,
    enableVideoUrl: true,
    enableGoogleVerification: true,
    requireRating: false,
    requireJobTitle: true,
    requireCompany: false,
    requireAvatar: false,
    requireVideoUrl: true,
    requireGoogleVerification: false,
    allowAnonymousSubmissions: false,
    notifyOnSubmission: false,
    allowFingerprintOptOut: false,
  };

  it("maps flat toggle shape into the nested schema", () => {
    const cfg = migrateLegacy(legacy);
    expect(cfg.content.headerTitle).toBe("Old title");
    expect(cfg.fields.rating.enabled).toBe(false);
    expect(cfg.fields.jobTitle.enabled).toBe(true);
    expect(cfg.fields.jobTitle.required).toBe(true);
    expect(cfg.fields.videoUrl.enabled).toBe(true);
    expect(cfg.fields.videoUrl.required).toBe(true);
    expect(cfg.behavior.allowAnonymous).toBe(false);
    expect(cfg.behavior.notifyOnSubmission).toBe(false);
    expect(cfg.behavior.oauthProviders).toEqual(["google"]);
  });

  it("returns DEFAULT_CONFIG when legacy is null", () => {
    const cfg = migrateLegacy(null);
    expect(cfg).toEqual(DEFAULT_CONFIG);
  });

  it("strips Google provider when the legacy flag is off", () => {
    const cfg = migrateLegacy({
      ...legacy,
      enableGoogleVerification: false,
    });
    expect(cfg.behavior.oauthProviders).toEqual([]);
  });
});

describe("lib/collect/types — field predicates", () => {
  it("treats name and content as always enabled+required", () => {
    const cfg = structuredClone(DEFAULT_CONFIG);
    cfg.fields.email.enabled = false;
    expect(isFieldEnabled(cfg, "name")).toBe(true);
    expect(isFieldEnabled(cfg, "content")).toBe(true);
    expect(isFieldRequired(cfg, "name")).toBe(true);
    expect(isFieldRequired(cfg, "content")).toBe(true);
    expect(isFieldEnabled(cfg, "email")).toBe(false);
  });

  it("reports optional fields by their toggle state", () => {
    const cfg = structuredClone(DEFAULT_CONFIG);
    cfg.fields.avatar.enabled = true;
    cfg.fields.avatar.required = true;
    expect(isFieldEnabled(cfg, "avatar")).toBe(true);
    expect(isFieldRequired(cfg, "avatar")).toBe(true);
  });
});
