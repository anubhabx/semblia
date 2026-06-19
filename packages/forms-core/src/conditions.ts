import type {
  Condition,
  ConditionalRule,
  ConditionOperator,
} from "./schema/definition.js";

/**
 * Conditional follow-up logic (spec §12). Deliberately bounded: simple
 * field/operator/value conditions combined with all/any, evaluated against the
 * current answer map. Not a workflow engine.
 */

function toNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function toText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.map((v) => String(v)).join(",");
  return String(value);
}

function looseEquals(actual: unknown, expected: string | number | boolean): boolean {
  if (typeof expected === "number") {
    const n = toNumber(actual);
    return n !== null && n === expected;
  }
  if (typeof expected === "boolean") {
    if (typeof actual === "boolean") return actual === expected;
    return toText(actual).toLowerCase() === String(expected);
  }
  return toText(actual) === expected;
}

export function compare(
  actual: unknown,
  operator: ConditionOperator,
  expected: string | number | boolean,
): boolean {
  switch (operator) {
    case "equals":
      return looseEquals(actual, expected);
    case "notEquals":
      return !looseEquals(actual, expected);
    case "greaterThan":
    case "greaterThanOrEqual":
    case "lessThan":
    case "lessThanOrEqual": {
      const a = toNumber(actual);
      const b = toNumber(expected);
      if (a === null || b === null) return false;
      if (operator === "greaterThan") return a > b;
      if (operator === "greaterThanOrEqual") return a >= b;
      if (operator === "lessThan") return a < b;
      return a <= b;
    }
    case "contains":
      return toText(actual)
        .toLowerCase()
        .includes(toText(expected).toLowerCase());
    case "notContains":
      return !toText(actual)
        .toLowerCase()
        .includes(toText(expected).toLowerCase());
    default:
      return false;
  }
}

export function evaluateCondition(
  condition: Condition,
  answers: Record<string, unknown>,
): boolean {
  return compare(answers[condition.fieldId], condition.operator, condition.value);
}

export function evaluateRule(
  rule: ConditionalRule,
  answers: Record<string, unknown>,
): boolean {
  if (rule.conditions.length === 0) return true;
  return rule.match === "any"
    ? rule.conditions.some((c) => evaluateCondition(c, answers))
    : rule.conditions.every((c) => evaluateCondition(c, answers));
}

/**
 * Whether a field is currently visible given the conditional rules and answers.
 * Fields are visible by default; matching `hide` rules hide them, and a field
 * that is the target of any `show` rule is hidden until at least one matches.
 */
export function isFieldVisible(
  fieldId: string,
  rules: ConditionalRule[],
  answers: Record<string, unknown>,
): boolean {
  const targeting = rules.filter((r) => r.targetFieldId === fieldId);
  if (targeting.length === 0) return true;

  const showRules = targeting.filter((r) => r.action === "show");
  const hideRules = targeting.filter((r) => r.action === "hide");

  if (hideRules.some((r) => evaluateRule(r, answers))) return false;
  if (showRules.length > 0) {
    return showRules.some((r) => evaluateRule(r, answers));
  }
  return true;
}
