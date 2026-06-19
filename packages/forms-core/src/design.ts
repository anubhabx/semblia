import {
  derivedThemeToCssVars,
  resolveThemeSnapshot,
  type ButtonStyle as BrandButtonStyle,
  type Density as BrandDensity,
  type FormThemeInputs,
  type RadiusScale,
  type TypePairingId,
} from "@workspace/brand-theme";
import type { FormDesign } from "./schema/definition.js";
import type { CompiledDesign } from "./schema/snapshot.js";

/**
 * The design-token compiler (spec §10). It maps the constrained forms-core
 * design controls onto the shared @workspace/brand-theme engine, which derives
 * and AA-clamps every dependent visual token from a single brand color. Per the
 * locked single-brand-color model, the spec's "accent color" is derived rather
 * than set directly. `fieldStyle` and `backgroundStyle` are forms-level tokens
 * the renderer reads directly (brand-theme models the card, not the inputs).
 */

const RADIUS_MAP: Record<FormDesign["radius"], RadiusScale> = {
  sharp: 0,
  soft: 2,
  rounded: 4,
};

const DENSITY_MAP: Record<FormDesign["density"], BrandDensity> = {
  compact: "compact",
  comfortable: "cozy",
  spacious: "spacious",
};

const BUTTON_MAP: Record<FormDesign["buttonStyle"], BrandButtonStyle> = {
  filled: "solid",
  soft: "soft",
  outline: "outline",
};

const FONT_MAP: Record<FormDesign["fontPairing"], TypePairingId> = {
  inter: "inter",
  geist: "geist",
  system: "system",
  serifEditorial: "serif-editorial",
};

export function toBrandThemeInputs(design: FormDesign): FormThemeInputs {
  return {
    brandColor: design.brandColor,
    appearance: design.mode,
    radius: RADIUS_MAP[design.radius],
    density: DENSITY_MAP[design.density],
    typePairing: FONT_MAP[design.fontPairing],
    // Forms present on a lifted card by default so the form reads as a distinct
    // surface above the page background regardless of layout preset.
    surfaceStyle: "elevated",
    accentIntensity: "balanced",
    neutralTone: "auto",
    buttonStyle: BUTTON_MAP[design.buttonStyle],
  };
}

export function compileDesign(design: FormDesign): CompiledDesign {
  const theme = resolveThemeSnapshot(toBrandThemeInputs(design));
  const cssVars: CompiledDesign["cssVars"] = {};
  if (theme.schemes.light) {
    cssVars.light = derivedThemeToCssVars(theme.schemes.light);
  }
  if (theme.schemes.dark) {
    cssVars.dark = derivedThemeToCssVars(theme.schemes.dark);
  }
  return {
    themeId: design.themeId,
    mode: design.mode,
    fieldStyle: design.fieldStyle,
    backgroundStyle: design.backgroundStyle,
    theme,
    cssVars,
  };
}
