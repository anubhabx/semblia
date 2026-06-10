import { DEFAULT_FORM_CONFIG, type FormConfig } from "@workspace/forms-core";
import type { FormsRuntimeServices } from "./types.js";

const mockConfig: FormConfig = {
  ...DEFAULT_FORM_CONFIG,
  brandName: "Acme Launchpad",
  headline: "How was your experience?",
  subhead:
    "Your note helps the team understand what felt clear, useful, and worth improving.",
  submitLabel: "Send feedback",
  tokens: {
    ...DEFAULT_FORM_CONFIG.tokens,
    fontHead: '"Space Grotesk", sans-serif',
    accent: "#0f766e",
    accentInk: "#ffffff",
    bg: "#eef7f4",
    surface: "#ffffff",
    ink: "#0b1f1c",
    inkSoft: "#4b635e",
    line: "#cfe4dd",
    radius: 18,
    fieldShape: "rounded",
    buttonStyle: "pill",
    shadow: "soft",
  },
  // Exercise the full hosted experience in local dev: stepped flow with a
  // loader screen, conditional follow-up, and a confetti success screen.
  layout: {
    ...DEFAULT_FORM_CONFIG.layout,
    flow: "stepped",
    container: "boxed",
    hero: "top",
  },
  loader: {
    enabled: true,
    style: "ring",
    durationMs: 900,
    message: "Loading your form…",
    useLogo: false,
    tint: "accent",
  },
  success: {
    ...DEFAULT_FORM_CONFIG.success,
    title: "Thank you!",
    message: "Your feedback has been received. We appreciate you.",
    showConfetti: true,
  },
  questions: [
    {
      id: "rating",
      type: "stars",
      label: "How would you rate your experience?",
      required: true,
    },
    {
      id: "improve",
      type: "longtext",
      label: "What could we improve?",
      description: "Shown because the rating was 3 or lower.",
      placeholder: "Be as honest as you like…",
      required: false,
      showIf: { questionId: "rating", op: "lte", value: 3 },
    },
    {
      id: "story",
      type: "longtext",
      label: "What stood out?",
      placeholder: "Tell us what worked well…",
      required: true,
    },
    {
      id: "recommend",
      type: "nps",
      label: "How likely are you to recommend us?",
      required: false,
    },
    {
      id: "authorName",
      type: "shorttext",
      label: "Your name",
      placeholder: "Jordan Rivera",
      required: true,
    },
    {
      id: "authorEmail",
      type: "email",
      label: "Email",
      placeholder: "you@example.com",
      required: false,
    },
  ],
};

export function createMockRuntimeServices(): FormsRuntimeServices {
  return {
    async resolveForm(context) {
      return {
        project: {
          id: "project_mock",
          slug: context.projectPublicSlug,
          name: "Acme Launchpad",
          publicSlug: context.projectPublicSlug,
          brandColorPrimary: mockConfig.tokens.accent,
        },
        form: {
          id: "form_mock",
          slug: context.formSlug,
          name: "Customer feedback",
          description: mockConfig.subhead,
          config: mockConfig,
          publishedAt: new Date("2026-05-30T00:00:00.000Z").toISOString(),
        },
      };
    },
    async submitForm() {
      return { redirectTo: "/?submitted=1" };
    },
  };
}
