import { z } from "zod";
import { SCHEMA_VERSION } from "../version.js";
import { formFieldSchema } from "./fields.js";

const httpUrl = z
  .string()
  .refine((s) => /^https?:\/\//i.test(s), "must be an http(s) URL");

/**
 * Form intent (spec §4). Mirrors the DB `FormIntent` enum so `Form.intent` and
 * the doc's intent stay in lockstep. Each intent seeds different default fields,
 * copy, layout, flow, and consent behavior (see intents.ts).
 */
export const formIntentSchema = z.enum([
  "TESTIMONIAL",
  "REVIEW",
  "PRODUCT_FEEDBACK",
  "CUSTOMER_STORY",
  "CUSTOM",
]);
export type FormIntent = z.infer<typeof formIntentSchema>;

/** Layout presets (spec §11) — never free-form, never rearrangeable. */
export const layoutPresetSchema = z.enum([
  "centeredCard",
  "fullPage",
  "splitHero",
  "oneQuestion",
]);
export type LayoutPreset = z.infer<typeof layoutPresetSchema>;

// ── Conditional flow (spec §12) ───────────────────────────────────────────────

export const conditionOperatorSchema = z.enum([
  "equals",
  "notEquals",
  "greaterThan",
  "greaterThanOrEqual",
  "lessThan",
  "lessThanOrEqual",
  "contains",
  "notContains",
]);
export type ConditionOperator = z.infer<typeof conditionOperatorSchema>;

export const conditionSchema = z.object({
  fieldId: z.string().min(1),
  operator: conditionOperatorSchema,
  value: z.union([z.string(), z.number(), z.boolean()]),
});
export type Condition = z.infer<typeof conditionSchema>;

/** Show/hide `targetFieldId` when the conditions match (AND/OR via `match`). */
export const conditionalRuleSchema = z.object({
  targetFieldId: z.string().min(1),
  action: z.enum(["show", "hide"]).default("show"),
  match: z.enum(["all", "any"]).default("all"),
  conditions: z.array(conditionSchema).min(1),
});
export type ConditionalRule = z.infer<typeof conditionalRuleSchema>;

// ── Flow behavior (spec §12) ──────────────────────────────────────────────────

export const flowModeSchema = z.enum(["single", "step"]);
export type FlowMode = z.infer<typeof flowModeSchema>;

export const consentPlacementSchema = z.enum([
  "beforeSubmit",
  "finalStep",
  "inline",
]);
export type ConsentPlacement = z.infer<typeof consentPlacementSchema>;

export const flowSchema = z.object({
  mode: flowModeSchema.default("single"),
  progressIndicator: z.boolean().default(true),
  autoAdvance: z.boolean().default(false),
  consentPlacement: consentPlacementSchema.default("beforeSubmit"),
  conditionalRules: z.array(conditionalRuleSchema).default([]),
});
export type FormFlow = z.infer<typeof flowSchema>;

// ── Design tokens (spec §10) ──────────────────────────────────────────────────
//
// Token-based, never CSS. The compiler (design.ts) maps these onto the shared
// @workspace/brand-theme engine, which derives + AA-clamps every dependent token
// from a single brand color. `fieldStyle` and `backgroundStyle` are forms-level
// tokens the renderer reads directly (brand-theme models the card, not fields).

export const displayModeSchema = z.enum(["light", "dark", "system"]);
export const radiusSchema = z.enum(["sharp", "soft", "rounded"]);
export const densitySchema = z.enum(["compact", "comfortable", "spacious"]);
export const buttonStyleSchema = z.enum(["filled", "outline", "soft"]);
export const fieldStyleSchema = z.enum(["outlined", "filled", "underline"]);
export const backgroundStyleSchema = z.enum(["plain", "gradient", "softPattern"]);
export const fontPairingSchema = z.enum([
  "inter",
  "geist",
  "system",
  "serifEditorial",
]);

export type DisplayMode = z.infer<typeof displayModeSchema>;
export type RadiusToken = z.infer<typeof radiusSchema>;
export type DensityToken = z.infer<typeof densitySchema>;
export type ButtonStyleToken = z.infer<typeof buttonStyleSchema>;
export type FieldStyle = z.infer<typeof fieldStyleSchema>;
export type BackgroundStyle = z.infer<typeof backgroundStyleSchema>;
export type FontPairing = z.infer<typeof fontPairingSchema>;

export const designSchema = z.object({
  themeId: z.string().default("clean"),
  brandColor: z.string().default("#6366f1"),
  mode: displayModeSchema.default("light"),
  radius: radiusSchema.default("soft"),
  density: densitySchema.default("comfortable"),
  buttonStyle: buttonStyleSchema.default("filled"),
  fieldStyle: fieldStyleSchema.default("outlined"),
  backgroundStyle: backgroundStyleSchema.default("plain"),
  fontPairing: fontPairingSchema.default("inter"),
  logoAssetId: z.string().nullable().default(null),
  logoUrl: z.string().nullable().default(null),
  backgroundImageAssetId: z.string().nullable().default(null),
  backgroundImageUrl: z.string().nullable().default(null),
});
export type FormDesign = z.infer<typeof designSchema>;

// ── Content (spec §5.1) ───────────────────────────────────────────────────────

export const contentSchema = z.object({
  title: z.string().default(""),
  description: z.string().default(""),
  introText: z.string().default(""),
  submitButtonText: z.string().default("Submit"),
  successMessage: z.string().default("Thanks for your response!"),
  successAction: z.enum(["message", "redirect"]).default("message"),
  redirectUrl: httpUrl.nullable().default(null),
  closedMessage: z
    .string()
    .default("This form is no longer accepting responses."),
});
export type FormContent = z.infer<typeof contentSchema>;

// ── Settings (spec §13, §14.3, §26) ───────────────────────────────────────────

export const captchaModeSchema = z.enum(["off", "suspicious", "always"]);
export type CaptchaMode = z.infer<typeof captchaModeSchema>;

export const settingsSchema = z.object({
  attribution: z.boolean().default(true),
  allowAnonymous: z.boolean().default(true),
  requireConsent: z.boolean().default(false),
  captchaMode: captchaModeSchema.default("off"),
  uploadsAllowed: z.boolean().default(true),
  embedAllowed: z.boolean().default(true),
  allowedOrigins: z.array(z.string()).default([]),
  /** Minimum completion time (ms) before a submission is accepted — anti-bot. */
  minCompletionMs: z.number().int().nonnegative().default(2000),
  honeypot: z.boolean().default(true),
  blockedWords: z.array(z.string()).default([]),
});
export type FormSettings = z.infer<typeof settingsSchema>;

/**
 * The editable source object (spec §14.1). `Form.draft` stores exactly this.
 * Versioned by `schemaVersion`; `migrateFormDoc` projects older docs forward.
 */
export const formDefinitionDocSchema = z.object({
  schemaVersion: z.string().default(SCHEMA_VERSION),
  intent: formIntentSchema.default("CUSTOM"),
  layoutPreset: layoutPresetSchema.default("centeredCard"),
  fields: z.array(formFieldSchema).default([]),
  // `.prefault` (not `.default`) so an empty/partial object is fed *through*
  // parsing and each nested schema applies its own field defaults. In Zod v4
  // `.default(value)` short-circuits parsing and requires the full output shape.
  flow: flowSchema.prefault({}),
  design: designSchema.prefault({}),
  content: contentSchema.prefault({}),
  settings: settingsSchema.prefault({}),
});
export type FormDefinitionDoc = z.infer<typeof formDefinitionDocSchema>;
