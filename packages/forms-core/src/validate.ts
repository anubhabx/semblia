import { isFieldVisible } from "./conditions.js";
import type { FormFlow } from "./schema/definition.js";
import type { FormField } from "./schema/fields.js";

/**
 * Authoritative answer validation (spec §20). Runs against the published
 * snapshot's fields + flow, so the server validates exactly what was rendered.
 * Only currently-visible (per conditional rules), non-hidden fields are checked.
 */

export interface FieldError {
  fieldId: string;
  message: string;
}

export interface ValidationResult {
  ok: boolean;
  errors: FieldError[];
}

export interface ValidatableForm {
  fields: FormField[];
  flow: FormFlow;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^https?:\/\/.+/i;

function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

function validateValue(field: FormField, value: unknown): string | null {
  const label = field.label || "This field";
  switch (field.type) {
    case "email":
      if (typeof value !== "string" || !EMAIL_RE.test(value.trim())) {
        return "Enter a valid email address";
      }
      return null;
    case "website":
      if (typeof value !== "string" || !URL_RE.test(value.trim())) {
        return "Enter a valid URL (https://…)";
      }
      return null;
    case "rating": {
      const n = Number(value);
      const scale = field.ratingScale ?? 5;
      if (!Number.isFinite(n) || n < 1 || n > scale) {
        return `${label} must be between 1 and ${scale}`;
      }
      return null;
    }
    case "shortText":
    case "longText":
    case "name":
    case "company":
    case "role": {
      const s = String(value);
      if (field.minLength && s.trim().length < field.minLength) {
        return `${label} must be at least ${field.minLength} characters`;
      }
      if (field.maxLength && s.length > field.maxLength) {
        return `${label} must be at most ${field.maxLength} characters`;
      }
      return null;
    }
    case "singleSelect":
      if (field.options && !field.options.some((o) => o.value === value)) {
        return "Select a valid option";
      }
      return null;
    case "multiSelect": {
      const arr = Array.isArray(value) ? value : [value];
      if (field.options) {
        const valid = new Set(field.options.map((o) => o.value));
        if (!arr.every((v) => valid.has(v as string))) {
          return "Select valid options";
        }
      }
      if (field.maxSelections && arr.length > field.maxSelections) {
        return `Select at most ${field.maxSelections} option(s)`;
      }
      return null;
    }
    case "consent":
      if (value !== true && value !== "true") {
        return `${label} is required`;
      }
      return null;
    default:
      // uploads carry media-asset id(s) validated server-side against the
      // upload pipeline; text/name/etc. with no extra rules pass here.
      return null;
  }
}

export function validateAnswers(
  form: ValidatableForm,
  answers: Record<string, unknown>,
): ValidationResult {
  const errors: FieldError[] = [];
  const rules = form.flow.conditionalRules;

  for (const field of form.fields) {
    if (field.type === "hidden") continue;
    if (!isFieldVisible(field.id, rules, answers)) continue;

    const value = answers[field.id];
    const empty = isEmpty(value);

    if (field.required && empty) {
      errors.push({
        fieldId: field.id,
        message: `${field.label || "This field"} is required`,
      });
      continue;
    }
    if (empty) continue;

    const message = validateValue(field, value);
    if (message) errors.push({ fieldId: field.id, message });
  }

  return { ok: errors.length === 0, errors };
}
