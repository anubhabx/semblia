import { describe, expect, it } from "vitest";
import {
  hexAlpha as formsCoreHexAlpha,
  textureBg as formsCoreTextureBg,
  tokensToCssVars as formsCoreTokensToCssVars,
} from "@workspace/forms-core";
import {
  hexAlpha,
  textureBg,
  tokensToCssVars,
} from "@/lib/collect/studio-token-css";
import { buildDefaultFormConfig } from "@/lib/collect/studio-presets";
import type { DesignTokens } from "@/lib/collect/studio-types";

describe("studio token CSS helpers", () => {
  it("uses the shared forms-core variable mapping and keeps dark color scheme", () => {
    const tokens: DesignTokens = {
      ...buildDefaultFormConfig().tokens,
      accent: "#3366ff",
      bg: "#101010",
      dark: true,
      sizeBase: 17,
      brandName: "Studio-only brand",
    };

    expect(tokensToCssVars(tokens)).toEqual({
      ...formsCoreTokensToCssVars(tokens),
      colorScheme: "dark",
    });
    expect(formsCoreTokensToCssVars(tokens)["--f-accent-16"]).toBe("#3366ff29");
  });

  it("keeps the helper exports available to studio consumers", () => {
    expect(hexAlpha).toBe(formsCoreHexAlpha);
    expect(textureBg).toBe(formsCoreTextureBg);
    expect(hexAlpha("#3366ff", 0.16)).toBe("#3366ff29");
    expect(textureBg("none", "#111111")).toBe("none");
  });
});
