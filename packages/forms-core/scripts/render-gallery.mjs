/**
 * Visual iteration harness — renders the REAL production forms-core output to
 * static HTML so the rendered forms can be screenshotted without auth/servers.
 * Not shipped; lives here so `@workspace/brand-theme` resolves via node_modules.
 *
 *   node scripts/render-gallery.mjs   →  writes .preview/*.html at repo root
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { renderPublishedFormPage } from "../dist/render/index.js";
import {
  defaultFormDefinition,
  publishFormDefinition,
} from "../dist/schema/index.js";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, "../../../.preview");
mkdirSync(outDir, { recursive: true });

const BRAND = "#4f46e5";

/** A rich form exercising every question type + a real header. */
function kitchenSink(overrides = {}) {
  return {
    schemaVersion: 2,
    structure: {
      questions: [
        { id: "content", type: "longtext", label: "What did you think of the workshop?", placeholder: "Tell us what stood out…", description: "A sentence or two is plenty.", required: true, options: [], showIf: null },
        { id: "authorName", type: "shorttext", label: "Your name", placeholder: "Jane Doe", description: "", required: true, options: [], showIf: null },
        { id: "authorEmail", type: "email", label: "Email", placeholder: "jane@example.com", description: "We'll only use this to follow up.", required: false, options: [], showIf: null },
        { id: "rating", type: "stars", label: "Overall rating", description: "", required: true, placeholder: "", options: [], showIf: null },
        { id: "recommend", type: "nps", label: "How likely are you to recommend us?", description: "0 = not at all, 10 = absolutely.", required: false, placeholder: "", options: [], showIf: null },
        { id: "mood", type: "emoji", label: "How did it leave you feeling?", description: "", required: false, placeholder: "", options: [], showIf: null },
        { id: "role", type: "radio", label: "What best describes you?", description: "", required: false, placeholder: "", options: ["Founder", "Designer", "Engineer", "Other"], showIf: null },
        { id: "topics", type: "checkbox", label: "Which topics interested you?", description: "Pick all that apply.", required: false, placeholder: "", options: ["Pricing", "Onboarding", "Integrations", "Support"], showIf: null },
        { id: "source", type: "dropdown", label: "How did you hear about us?", description: "", required: false, placeholder: "Choose one…", options: ["Search", "A friend", "Social media", "An event"], showIf: null },
      ],
    },
    layout: { preset: "card" },
    theme: { preset: "default", inputs: { brandColor: BRAND, appearance: "light", radius: 2, density: "cozy", typePairing: "geist", surfaceStyle: "bordered", accentIntensity: "balanced", neutralTone: "auto", buttonStyle: "solid" } },
    content: {
      brandName: "Northwind Studio",
      headline: "Share your experience",
      subhead: "Your feedback shapes what we build next. It takes about two minutes.",
      submitLabel: "Send feedback",
      logoUrl: null,
      loaderMessage: "",
      success: { title: "Thank you!", message: "Your feedback has been received.", action: "message", redirectUrl: "", ctaLabel: "", ctaUrl: "" },
    },
    ...overrides,
  };
}

const targets = [];

// The default form, exactly as a freshly-created form looks (preset "clean").
targets.push(["default-fresh", defaultFormDefinition({ brandName: "Northwind Studio" })]);

// Kitchen sink across all four layout presets (theme preset "default").
for (const preset of ["card", "inline", "split", "conversational"]) {
  const doc = kitchenSink({ layout: { preset } });
  targets.push([`sink-${preset}`, doc]);
}

// Success state on the default card.
targets.push(["success", kitchenSink()]);

// Dark appearance (respondent dark mode differentiator).
{
  const doc = kitchenSink();
  doc.theme.inputs.appearance = "dark";
  targets.push(["sink-dark", doc]);
}

// A warmer non-indigo brand to prove the engine isn't tied to one hue.
{
  const doc = kitchenSink({
    content: {
      brandName: "Olive & Ember",
      headline: "How was dinner?",
      subhead: "We read every note — it shapes the next menu.",
      submitLabel: "Send feedback",
      logoUrl: null,
      loaderMessage: "",
      success: { title: "Thank you!", message: "Your feedback has been received.", action: "message", redirectUrl: "", ctaLabel: "", ctaUrl: "" },
    },
  });
  doc.theme.inputs.brandColor = "#b4530a"; // warm terracotta
  targets.push(["sink-warm", doc]);
}

for (const [name, def] of targets) {
  const published = publishFormDefinition(def);
  const submitted = name === "success";
  const { html } = renderPublishedFormPage(published, {
    formPath: "/feedback",
    brandFallback: "Northwind Studio",
    submitted,
    watermark: true,
  });
  const file = resolve(outDir, `${name}.html`);
  writeFileSync(file, html, "utf8");
  console.log("wrote", file);
}
