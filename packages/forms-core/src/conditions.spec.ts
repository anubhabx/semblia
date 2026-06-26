import { describe, expect, it } from "vitest";
import { compare, evaluateRule, isFieldVisible } from "./conditions.js";
import type { ConditionalRule } from "./schema/definition.js";

describe("compare", () => {
  it("handles equality across types", () => {
    expect(compare("bug", "equals", "bug")).toBe(true);
    expect(compare("bug", "notEquals", "idea")).toBe(true);
    expect(compare(5, "equals", 5)).toBe(true);
    expect(compare("5", "equals", 5)).toBe(true); // string coerces to number
    expect(compare(true, "equals", true)).toBe(true);
  });

  it("handles numeric comparisons", () => {
    expect(compare(3, "lessThanOrEqual", 3)).toBe(true);
    expect(compare(2, "lessThan", 3)).toBe(true);
    expect(compare(4, "greaterThan", 3)).toBe(true);
    expect(compare(3, "greaterThanOrEqual", 3)).toBe(true);
    expect(compare("not-a-number", "lessThan", 3)).toBe(false);
  });

  it("handles contains / notContains case-insensitively", () => {
    expect(compare("Hello World", "contains", "world")).toBe(true);
    expect(compare("Hello", "notContains", "bye")).toBe(true);
    expect(compare(["a", "b"], "contains", "b")).toBe(true);
  });
});

describe("isFieldVisible", () => {
  const showRule: ConditionalRule = {
    targetFieldId: "improvement",
    action: "show",
    match: "all",
    conditions: [{ fieldId: "rating", operator: "lessThanOrEqual", value: 3 }],
  };

  it("is visible by default when no rule targets it", () => {
    expect(isFieldVisible("anything", [showRule], {})).toBe(true);
  });

  it("hides a show-target until a condition matches", () => {
    expect(isFieldVisible("improvement", [showRule], { rating: 5 })).toBe(false);
    expect(isFieldVisible("improvement", [showRule], { rating: 2 })).toBe(true);
  });

  it("hides on a matching hide rule", () => {
    const hideRule: ConditionalRule = {
      targetFieldId: "company",
      action: "hide",
      match: "all",
      conditions: [{ fieldId: "anonymous", operator: "equals", value: true }],
    };
    expect(isFieldVisible("company", [hideRule], { anonymous: true })).toBe(
      false,
    );
    expect(isFieldVisible("company", [hideRule], { anonymous: false })).toBe(
      true,
    );
  });

  it("evaluateRule respects any vs all", () => {
    const anyRule: ConditionalRule = {
      targetFieldId: "x",
      action: "show",
      match: "any",
      conditions: [
        { fieldId: "a", operator: "equals", value: "1" },
        { fieldId: "b", operator: "equals", value: "2" },
      ],
    };
    expect(evaluateRule(anyRule, { a: "1", b: "9" })).toBe(true);
    expect(evaluateRule({ ...anyRule, match: "all" }, { a: "1", b: "9" })).toBe(
      false,
    );
  });
});
