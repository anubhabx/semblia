import type { StudioQuestion } from "@/lib/collect/studio-types";

export function validateQuestion(q: StudioQuestion, value: unknown): string {
  if (!q.required) return "";

  switch (q.type) {
    case "shorttext": {
      const v = typeof value === "string" ? value.trim() : "";
      if (!v) return "This field is required.";
      if (v.length > 255) return "Please keep this under 255 characters.";
      return "";
    }
    case "longtext": {
      const v = typeof value === "string" ? value.trim() : "";
      if (!v) return "This field is required.";
      if (v.length < 10) return "Please write at least 10 characters.";
      return "";
    }
    case "stars":
    case "nps":
    case "emoji": {
      if (value === null || value === undefined) return "Please make a selection.";
      return "";
    }
    case "radio":
    case "dropdown": {
      if (!value && value !== 0) return "Please make a selection.";
      return "";
    }
    case "checkbox": {
      if (!Array.isArray(value) || value.length === 0)
        return "Please select at least one option.";
      return "";
    }
    case "file": {
      if (!value) return "Please upload a file.";
      return "";
    }
    default:
      return "";
  }
}
