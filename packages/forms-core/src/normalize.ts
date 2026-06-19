import { isFieldVisible } from "./conditions.js";
import type { FormFlow } from "./schema/definition.js";
import {
  ALWAYS_PRIVATE_TYPES,
  consentSchema,
  type FormField,
  type FormResponseConsent,
  type StoredAnswer,
} from "./schema/fields.js";

/**
 * Submission normalization (spec §8, §20). Turns raw `{ fieldId: value }` input
 * into immutable StoredAnswer records carrying the field's private/publishable/
 * widget eligibility, and projects the well-known author/rating roles so widgets
 * and analytics can read them without re-deriving from the answers map.
 */

export interface NormalizedSubmission {
  answers: StoredAnswer[];
  rating: { value: number | null; scale: number | null };
  author: {
    name: string | null;
    role: string | null;
    company: string | null;
    avatarAssetId: string | null;
  };
  consent: FormResponseConsent;
}

export interface NormalizableForm {
  fields: FormField[];
  flow: FormFlow;
}

function asString(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return null;
}

function coerce(field: FormField, raw: unknown): unknown {
  switch (field.type) {
    case "rating": {
      const n = Number(raw);
      return Number.isFinite(n) ? n : null;
    }
    case "consent":
      return raw === true || raw === "true";
    case "multiSelect":
      return Array.isArray(raw) ? raw : raw == null ? [] : [raw];
    default:
      return typeof raw === "string" ? raw.trim() : raw;
  }
}

export function normalizeSubmission(
  form: NormalizableForm,
  rawAnswers: Record<string, unknown>,
  rawConsent?: unknown,
): NormalizedSubmission {
  const answers: StoredAnswer[] = [];
  let rating: NormalizedSubmission["rating"] = { value: null, scale: null };
  const author: NormalizedSubmission["author"] = {
    name: null,
    role: null,
    company: null,
    avatarAssetId: null,
  };

  const rules = form.flow.conditionalRules;

  for (const field of form.fields) {
    const present = Object.prototype.hasOwnProperty.call(rawAnswers, field.id);
    const visible =
      field.type === "hidden" || isFieldVisible(field.id, rules, rawAnswers);
    if (!present || !visible) continue;

    const value = coerce(field, rawAnswers[field.id]);
    const isPrivate = field.private || ALWAYS_PRIVATE_TYPES.has(field.type);
    const publishable = !isPrivate && field.publishable;

    answers.push({
      fieldId: field.id,
      type: field.type,
      role: field.role,
      labelSnapshot: field.label,
      value,
      private: isPrivate,
      publishable,
      usedInWidget: publishable && field.widgetEligible,
    });

    if (field.type === "rating" && rating.value === null) {
      const n = Number(value);
      rating = {
        value: Number.isFinite(n) ? n : null,
        scale: field.ratingScale ?? 5,
      };
    }
    if (field.role === "authorName" && !author.name) author.name = asString(value);
    if (field.role === "authorRole" && !author.role) author.role = asString(value);
    if (field.role === "authorCompany" && !author.company) {
      author.company = asString(value);
    }
    if (field.role === "authorAvatar" && !author.avatarAssetId) {
      author.avatarAssetId = asString(value);
    }
  }

  const consent = consentSchema.parse(
    rawConsent && typeof rawConsent === "object" ? rawConsent : {},
  );

  return { answers, rating, author, consent };
}
