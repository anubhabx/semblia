import { describe, expect, it } from "vitest";
import { createFormTemplate } from "./intents.js";
import { parseFormDoc } from "./migrate.js";
import { normalizeSubmission } from "./normalize.js";
import type { StoredAnswer } from "./schema/fields.js";

const byId = (answers: StoredAnswer[], id: string) =>
  answers.find((a) => a.fieldId === id);

describe("normalizeSubmission", () => {
  const form = createFormTemplate("TESTIMONIAL");

  it("stamps private/publishable/widget eligibility per field", () => {
    const { answers } = normalizeSubmission(form, {
      rating: 5,
      testimonial: "The team shipped twice as fast after switching.",
      name: "Jane Doe",
      role: "Head of Product",
      company: "Acme",
      consent: true,
    });

    const body = byId(answers, "testimonial");
    expect(body).toMatchObject({ private: false, publishable: true, usedInWidget: true });

    const name = byId(answers, "name");
    expect(name).toMatchObject({ publishable: true, usedInWidget: true });

    // Consent is always private and never publishable / widget-eligible.
    const consent = byId(answers, "consent");
    expect(consent).toMatchObject({ private: true, publishable: false, usedInWidget: false });
    expect(consent?.value).toBe(true);
  });

  it("projects the rating and author roles for widgets/analytics", () => {
    const { rating, author } = normalizeSubmission(form, {
      rating: "4",
      testimonial: "Solid product.",
      name: "Sam Lee",
      role: "CTO",
      company: "Globex",
      consent: true,
    });
    expect(rating).toEqual({ value: 4, scale: 5 });
    expect(author).toMatchObject({ name: "Sam Lee", role: "CTO", company: "Globex" });
  });

  it("treats email as always-private even if marked publishable", () => {
    const feedback = createFormTemplate("PRODUCT_FEEDBACK");
    const { answers } = normalizeSubmission(feedback, {
      category: "bug",
      rating: 2,
      feedback: "Crashed on save.",
      email: "person@example.com",
    });
    const email = byId(answers, "email");
    expect(email).toMatchObject({ private: true, publishable: false });
  });

  it("never persists answers for conditionally hidden fields", () => {
    const feedback = createFormTemplate("PRODUCT_FEEDBACK");
    // `improvement` only shows when rating <= 3; a high rating hides it, so a
    // value smuggled into the payload must be dropped, not stored.
    const { answers } = normalizeSubmission(feedback, {
      category: "praise",
      rating: 5,
      feedback: "Love it.",
      improvement: "should-be-ignored",
    });
    expect(byId(answers, "improvement")).toBeUndefined();
  });

  it("coerces a single multiSelect value into an array", () => {
    const doc = parseFormDoc({
      fields: [
        {
          id: "tags",
          type: "multiSelect",
          options: [
            { value: "a", label: "A" },
            { value: "b", label: "B" },
          ],
        },
      ],
    });
    const { answers } = normalizeSubmission(doc, { tags: "a" });
    expect(byId(answers, "tags")?.value).toEqual(["a"]);
  });

  it("parses consent flags and defaults the rest to false", () => {
    const { consent } = normalizeSubmission(
      form,
      { rating: 5, testimonial: "Great.", name: "Jo", consent: true },
      { canPublishText: true, canPublishName: true },
    );
    expect(consent.canPublishText).toBe(true);
    expect(consent.canPublishName).toBe(true);
    expect(consent.canPublishAvatar).toBe(false);
    expect(consent.canEditForClarity).toBe(false);
  });
});
