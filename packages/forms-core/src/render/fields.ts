/**
 * Field renderers — shared by every layout preset.
 *
 * The four presets differ only in their outer shell and CSS; the controls
 * themselves render identically here so behaviour, validation, focus order, and
 * accessibility are guaranteed across presets (docs/DESIGN.md §7, §8).
 *
 * Every control submits under `answers[<questionId>]`, matching the runtime
 * submit parser. Reserved ids (content / authorName / authorEmail / rating …)
 * are recognised by the API from that same key, so no special-casing is needed
 * in markup.
 */

import type { FormQuestion } from "../schema/structure.js";
import { escapeAttr, escapeHtml } from "./escape.js";

const NPS_SCALE = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
const EMOJI_SCALE: ReadonlyArray<{ value: number; glyph: string; label: string }> = [
  { value: 1, glyph: "😞", label: "Very unhappy" },
  { value: 2, glyph: "🙁", label: "Unhappy" },
  { value: 3, glyph: "😐", label: "Neutral" },
  { value: 4, glyph: "🙂", label: "Happy" },
  { value: 5, glyph: "😄", label: "Very happy" },
];
const STAR_SCALE = [5, 4, 3, 2, 1] as const; // reversed so pure-CSS fill works

function fieldName(id: string): string {
  return `answers[${id}]`;
}

function labelBlock(q: FormQuestion): string {
  const req = q.required
    ? ` <span class="sf-req" aria-hidden="true">*</span>`
    : "";
  const desc = q.description.trim()
    ? `<p class="sf-desc" id="${escapeAttr(q.id)}-desc">${escapeHtml(q.description)}</p>`
    : "";
  return `<span class="sf-label" id="${escapeAttr(q.id)}-label">${escapeHtml(q.label)}${req}</span>${desc}`;
}

function describedBy(q: FormQuestion): string {
  return q.description.trim() ? ` aria-describedby="${escapeAttr(q.id)}-desc"` : "";
}

function renderTextual(q: FormQuestion, type: "text" | "email"): string {
  const inputType = type === "email" ? "email" : "text";
  const ph = q.placeholder.trim()
    ? ` placeholder="${escapeAttr(q.placeholder)}"`
    : "";
  return `<input class="sf-input" type="${inputType}" id="${escapeAttr(q.id)}" name="${escapeAttr(fieldName(q.id))}"${ph}${q.required ? " required" : ""}${describedBy(q)} autocomplete="${type === "email" ? "email" : "off"}">`;
}

function renderTextarea(q: FormQuestion): string {
  const ph = q.placeholder.trim()
    ? ` placeholder="${escapeAttr(q.placeholder)}"`
    : "";
  return `<textarea class="sf-input sf-textarea" id="${escapeAttr(q.id)}" name="${escapeAttr(fieldName(q.id))}" rows="4"${ph}${q.required ? " required" : ""}${describedBy(q)}></textarea>`;
}

function renderStars(q: FormQuestion): string {
  const items = STAR_SCALE.map((value) => {
    const inputId = `${q.id}-star-${value}`;
    return `<input class="sf-vh" type="radio" id="${escapeAttr(inputId)}" name="${escapeAttr(fieldName(q.id))}" value="${value}"${q.required ? " required" : ""}>` +
      `<label class="sf-star" for="${escapeAttr(inputId)}" title="${value} star${value === 1 ? "" : "s"}"><span class="sf-vh">${value} star${value === 1 ? "" : "s"}</span>★</label>`;
  }).join("");
  return `<div class="sf-stars" role="radiogroup" aria-labelledby="${escapeAttr(q.id)}-label">${items}</div>`;
}

function renderScale(
  q: FormQuestion,
  scale: ReadonlyArray<number>,
  className: string,
): string {
  const items = scale
    .map((value) => {
      const inputId = `${q.id}-opt-${value}`;
      return `<input class="sf-vh" type="radio" id="${escapeAttr(inputId)}" name="${escapeAttr(fieldName(q.id))}" value="${value}"${q.required ? " required" : ""}>` +
        `<label class="sf-chip" for="${escapeAttr(inputId)}">${value}</label>`;
    })
    .join("");
  return `<div class="${className}" role="radiogroup" aria-labelledby="${escapeAttr(q.id)}-label">${items}</div>`;
}

/**
 * NPS is the 0–10 recommend scale, so it renders as a single connected segmented
 * control with anchored endpoint captions — far clearer than a wrapping grid of
 * loose chips.
 */
function renderNps(q: FormQuestion): string {
  return (
    renderScale(q, NPS_SCALE, "sf-nps") +
    `<div class="sf-scale-ends" aria-hidden="true">` +
    `<span>Not likely</span><span>Very likely</span></div>`
  );
}

function renderEmoji(q: FormQuestion): string {
  const items = EMOJI_SCALE.map(({ value, glyph, label }) => {
    const inputId = `${q.id}-emoji-${value}`;
    return `<input class="sf-vh" type="radio" id="${escapeAttr(inputId)}" name="${escapeAttr(fieldName(q.id))}" value="${value}"${q.required ? " required" : ""}>` +
      `<label class="sf-emoji" for="${escapeAttr(inputId)}" title="${escapeAttr(label)}"><span class="sf-vh">${escapeHtml(label)}</span>${glyph}</label>`;
  }).join("");
  return `<div class="sf-emojis" role="radiogroup" aria-labelledby="${escapeAttr(q.id)}-label">${items}</div>`;
}

function renderChoice(q: FormQuestion, multiple: boolean): string {
  const type = multiple ? "checkbox" : "radio";
  const name = multiple ? `answers[${q.id}][]` : fieldName(q.id);
  const requiredGroup =
    multiple && q.required ? " data-required-checkbox" : "";
  const items = q.options
    .map((option, i) => {
      const inputId = `${q.id}-choice-${i}`;
      return `<label class="sf-choice" for="${escapeAttr(inputId)}">` +
        `<input class="sf-choice-input" type="${type}" id="${escapeAttr(inputId)}" name="${escapeAttr(name)}" value="${escapeAttr(option)}"${q.required && !multiple ? " required" : ""}>` +
        `<span class="sf-choice-mark" aria-hidden="true"></span>` +
        `<span class="sf-choice-text">${escapeHtml(option)}</span>` +
        `</label>`;
    })
    .join("");
  const role = multiple ? "group" : "radiogroup";
  return `<div class="sf-choices" role="${role}" aria-labelledby="${escapeAttr(q.id)}-label"${requiredGroup}>${items}</div>`;
}

function renderDropdown(q: FormQuestion): string {
  const placeholder = q.placeholder.trim() || "Select an option…";
  const options = q.options
    .map((option) => `<option value="${escapeAttr(option)}">${escapeHtml(option)}</option>`)
    .join("");
  // A wrapped native select + inline SVG chevron: the chevron inherits the theme
  // (currentColor) so it reads correctly in light and dark, unlike a fixed-color
  // background triangle.
  return (
    `<span class="sf-select-wrap">` +
    `<select class="sf-input sf-select" id="${escapeAttr(q.id)}" name="${escapeAttr(fieldName(q.id))}"${q.required ? " required" : ""}${describedBy(q)}>` +
    `<option value="" disabled selected hidden>${escapeHtml(placeholder)}</option>${options}</select>` +
    `<svg class="sf-select-chevron" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6.5 8 10.5 12 6.5"/></svg>` +
    `</span>`
  );
}

/**
 * The content types the API accepts for a SUBMISSION_ATTACHMENT
 * (`StorageService.allowedContentTypes`): images, audio, and video. Used for the
 * native `accept` filter and the client-side upload guard.
 */
export const FILE_ACCEPT = "image/*,audio/*,video/*";

function renderFile(q: FormQuestion, interactive: boolean): string {
  // Embeds run no script (no shadow-root execution) and cannot presign an
  // upload, so a file question degrades to an honest note pointing at the full
  // hosted form instead of an inert picker.
  if (!interactive) {
    return (
      `<p class="sf-file-fallback" role="note">Attaching files isn't available here. ` +
      `Open the full form to add an attachment.</p>`
    );
  }
  // The control posts under `answers[<id>]`; the runtime replaces that value
  // with the uploaded asset id before submit. `data-sf-file` marks it for the
  // runtime, and the status line + `<noscript>` make the JS requirement honest.
  return (
    `<input class="sf-input sf-file" type="file" id="${escapeAttr(q.id)}" name="${escapeAttr(fieldName(q.id))}" accept="${FILE_ACCEPT}"${q.required ? " required" : ""}${describedBy(q)} data-sf-file>` +
    `<span class="sf-file-status" data-sf-file-status hidden></span>` +
    `<noscript><span class="sf-file-noscript">File uploads need JavaScript enabled.</span></noscript>`
  );
}

function renderControl(q: FormQuestion, interactive: boolean): string {
  switch (q.type) {
    case "shorttext":
      return renderTextual(q, "text");
    case "email":
      return renderTextual(q, "email");
    case "longtext":
      return renderTextarea(q);
    case "stars":
      return renderStars(q);
    case "nps":
      return renderNps(q);
    case "emoji":
      return renderEmoji(q);
    case "radio":
      return renderChoice(q, false);
    case "checkbox":
      return renderChoice(q, true);
    case "dropdown":
      return renderDropdown(q);
    case "file":
      return renderFile(q, interactive);
    default: {
      // Exhaustiveness guard — a new question type must add a renderer.
      const never: never = q.type;
      throw new Error(`forms-v4: no field renderer for "${String(never)}"`);
    }
  }
}

/**
 * Render one question as a labelled field wrapper. `showIf` is carried as data
 * for the runtime. `interactive` is false for embeds (no executable script), so
 * file questions render a fallback note rather than an inert picker.
 */
export function renderField(q: FormQuestion, interactive = true): string {
  const showIf = q.showIf
    ? ` data-show-if="${escapeAttr(JSON.stringify(q.showIf))}" hidden`
    : "";
  // A grouped control (radiogroup / radios styled as stars) uses a <fieldset>
  // so the label associates with the group rather than a single input.
  const grouped =
    q.type === "stars" ||
    q.type === "nps" ||
    q.type === "emoji" ||
    q.type === "radio" ||
    q.type === "checkbox";
  if (grouped) {
    return `<fieldset class="sf-field sf-field-${q.type}" data-qid="${escapeAttr(q.id)}"${showIf}>` +
      `<legend class="sf-legend">${labelBlock(q)}</legend>${renderControl(q, interactive)}</fieldset>`;
  }
  return `<div class="sf-field sf-field-${q.type}" data-qid="${escapeAttr(q.id)}"${showIf}>` +
    `<label class="sf-field-label" for="${escapeAttr(q.id)}">${labelBlock(q)}</label>${renderControl(q, interactive)}</div>`;
}
