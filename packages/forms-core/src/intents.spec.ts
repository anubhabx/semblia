import { describe, expect, it } from "vitest";
import { createFormTemplate, FORM_INTENTS } from "./intents.js";
import { formDefinitionDocSchema } from "./schema/definition.js";

describe("createFormTemplate", () => {
  it("seeds a valid, fully-defaulted doc for every intent", () => {
    for (const intent of FORM_INTENTS) {
      const doc = createFormTemplate(intent);
      // Re-parsing must be a no-op — the template is already canonical.
      expect(() => formDefinitionDocSchema.parse(doc)).not.toThrow();
      expect(doc.intent).toBe(intent);
      expect(doc.fields.length).toBeGreaterThan(0);
      // Every field carries a stable id (snapshot/normalize key on it).
      expect(new Set(doc.fields.map((f) => f.id)).size).toBe(doc.fields.length);
    }
  });

  it("TESTIMONIAL leads with a required primary text + consent and requests consent", () => {
    const doc = createFormTemplate("TESTIMONIAL");
    expect(doc.layoutPreset).toBe("centeredCard");
    expect(doc.settings.requireConsent).toBe(true);

    const body = doc.fields.find((f) => f.role === "primaryText");
    expect(body?.required).toBe(true);
    expect(body?.publishable).toBe(true);

    const consent = doc.fields.find((f) => f.type === "consent");
    expect(consent?.required).toBe(true);
    expect(consent?.private).toBe(true);
  });

  it("PRODUCT_FEEDBACK carries a conditional rule and a private email field", () => {
    const doc = createFormTemplate("PRODUCT_FEEDBACK");
    expect(doc.flow.conditionalRules.length).toBeGreaterThan(0);

    const email = doc.fields.find((f) => f.type === "email");
    expect(email?.private).toBe(true);
    expect(email?.publishable).toBe(false);
  });

  it("CUSTOM is a minimal, consent-free starting point", () => {
    const doc = createFormTemplate("CUSTOM");
    expect(doc.settings.requireConsent).toBe(false);
    expect(doc.fields.some((f) => f.role === "primaryText")).toBe(true);
  });
});
