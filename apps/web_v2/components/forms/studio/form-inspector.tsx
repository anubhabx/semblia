"use client";

/**
 * FormInspectorPanel — the studio's editing surface. Renders one section's
 * controls (Content / Fields / Style / Flow) from the shared studio control
 * primitives; section navigation is owned by the shared StudioRail in the shell,
 * so the Form Studio reads as the same instrument as the Widget Studio. Every
 * edit mutates the working draft immutably; the parent owns persistence.
 */

import * as React from "react";
import {
  TextAlignLeftIcon,
  ListBulletsIcon,
  PaintBrushBroadIcon,
  FlowArrowIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { type StudioSection } from "@/components/studio/studio-rail";
import type {
  FormDefinitionDoc,
  FormField,
  LayoutPreset,
  DisplayMode,
  RadiusToken,
  DensityToken,
  ButtonStyleToken,
  FieldStyle,
  BackgroundStyle,
  FontPairing,
  FlowMode,
  ConsentPlacement,
} from "@workspace/forms-core";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Section,
  Field,
  Segmented,
  OptionCardGroup,
  SwitchRow,
  SelectField,
} from "@/components/studio/controls";

export type FormSectionId = "content" | "fields" | "design" | "flow";

/** Section model consumed by the shared StudioRail. */
export const FORM_SECTIONS: ReadonlyArray<StudioSection<FormSectionId>> = [
  { id: "content", label: "Content", icon: TextAlignLeftIcon },
  { id: "fields", label: "Fields", icon: ListBulletsIcon },
  { id: "design", label: "Style", icon: PaintBrushBroadIcon },
  { id: "flow", label: "Flow", icon: FlowArrowIcon },
];

const FIELD_TYPE_LABEL: Record<FormField["type"], string> = {
  shortText: "Short text",
  longText: "Long text",
  rating: "Rating",
  name: "Name",
  email: "Email",
  company: "Company",
  role: "Role",
  website: "Website",
  singleSelect: "Single select",
  multiSelect: "Multi select",
  imageUpload: "Image upload",
  fileUpload: "File upload",
  consent: "Consent",
  hidden: "Hidden",
};

const PLACEHOLDER_TYPES: ReadonlySet<FormField["type"]> = new Set([
  "shortText",
  "longText",
  "name",
  "email",
  "company",
  "role",
  "website",
]);

/**
 * FormInspectorPanel — renders the active section's controls. Section navigation
 * is owned by the shared StudioRail in the shell, so this is panel content only.
 */
export function FormInspectorPanel({
  section,
  doc,
  onChange,
}: {
  section: FormSectionId;
  doc: FormDefinitionDoc;
  onChange: (next: FormDefinitionDoc) => void;
}) {
  return (
    <div className="p-4">
      {section === "content" && <ContentPanel doc={doc} onChange={onChange} />}
      {section === "fields" && <FieldsPanel doc={doc} onChange={onChange} />}
      {section === "design" && <DesignPanel doc={doc} onChange={onChange} />}
      {section === "flow" && <FlowPanel doc={doc} onChange={onChange} />}
    </div>
  );
}

// ── Content ─────────────────────────────────────────────────────────────────

function ContentPanel({
  doc,
  onChange,
}: {
  doc: FormDefinitionDoc;
  onChange: (next: FormDefinitionDoc) => void;
}) {
  const set = (patch: Partial<FormDefinitionDoc["content"]>) =>
    onChange({ ...doc, content: { ...doc.content, ...patch } });

  return (
    <div className="flex flex-col gap-6">
      <Section title="Header" description="The first thing respondents read.">
        <Field label="Title" htmlFor="f-title">
          <Input
            id="f-title"
            value={doc.content.title}
            onChange={(e) => set({ title: e.target.value })}
            placeholder="Share your experience"
          />
        </Field>
        <Field label="Description" htmlFor="f-desc">
          <Textarea
            id="f-desc"
            rows={2}
            value={doc.content.description}
            onChange={(e) => set({ description: e.target.value })}
            placeholder="A short line of context under the title."
          />
        </Field>
        <Field
          label="Intro text"
          htmlFor="f-intro"
          hint="Optional longer note shown above the fields."
        >
          <Textarea
            id="f-intro"
            rows={2}
            value={doc.content.introText}
            onChange={(e) => set({ introText: e.target.value })}
          />
        </Field>
      </Section>

      <Section title="Submission" description="Button + the thank-you moment.">
        <Field label="Submit button" htmlFor="f-submit">
          <Input
            id="f-submit"
            value={doc.content.submitButtonText}
            onChange={(e) => set({ submitButtonText: e.target.value })}
            placeholder="Submit"
          />
        </Field>
        <Field label="Success message" htmlFor="f-success">
          <Textarea
            id="f-success"
            rows={2}
            value={doc.content.successMessage}
            onChange={(e) => set({ successMessage: e.target.value })}
          />
        </Field>
        <Field
          label="Closed message"
          htmlFor="f-closed"
          hint="Shown when the form is no longer accepting responses."
        >
          <Textarea
            id="f-closed"
            rows={2}
            value={doc.content.closedMessage}
            onChange={(e) => set({ closedMessage: e.target.value })}
          />
        </Field>
      </Section>
    </div>
  );
}

// ── Fields ──────────────────────────────────────────────────────────────────

function FieldsPanel({
  doc,
  onChange,
}: {
  doc: FormDefinitionDoc;
  onChange: (next: FormDefinitionDoc) => void;
}) {
  const fields = doc.fields;

  const updateField = (id: string, patch: Partial<FormField>) =>
    onChange({
      ...doc,
      fields: fields.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    });

  const removeField = (id: string) =>
    onChange({ ...doc, fields: fields.filter((f) => f.id !== id) });

  const moveField = (id: string, dir: -1 | 1) => {
    const idx = fields.findIndex((f) => f.id === id);
    const next = idx + dir;
    if (idx < 0 || next < 0 || next >= fields.length) return;
    const reordered = [...fields];
    const [moved] = reordered.splice(idx, 1);
    reordered.splice(next, 0, moved);
    onChange({ ...doc, fields: reordered });
  };

  return (
    <Section
      title="Fields"
      description="Edit labels, requirements, and order. Structure stays controlled — no free-form HTML."
    >
      <div className="flex flex-col gap-2.5">
        {fields.map((field, i) => (
          <FieldEditor
            key={field.id}
            field={field}
            isFirst={i === 0}
            isLast={i === fields.length - 1}
            onUpdate={(patch) => updateField(field.id, patch)}
            onRemove={() => removeField(field.id)}
            onMove={(dir) => moveField(field.id, dir)}
          />
        ))}
        {fields.length === 0 && (
          <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
            This form has no fields.
          </p>
        )}
      </div>
    </Section>
  );
}

function FieldEditor({
  field,
  isFirst,
  isLast,
  onUpdate,
  onRemove,
  onMove,
}: {
  field: FormField;
  isFirst: boolean;
  isLast: boolean;
  onUpdate: (patch: Partial<FormField>) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const showPlaceholder = PLACEHOLDER_TYPES.has(field.type);
  const isConsent = field.type === "consent";

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 px-3 py-2.5">
        <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[9.5px] font-medium uppercase tracking-wide text-muted-foreground">
          {FIELD_TYPE_LABEL[field.type]}
        </span>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="min-w-0 flex-1 truncate text-left text-xs font-medium text-foreground hover:text-foreground/80"
        >
          {field.label || "Untitled field"}
          {field.required && <span className="ml-1 text-destructive">*</span>}
        </button>
        <div className="flex shrink-0 items-center gap-0.5">
          <IconBtn
            label="Move up"
            disabled={isFirst}
            onClick={() => onMove(-1)}
          >
            <ArrowUpIcon className="size-3.5" />
          </IconBtn>
          <IconBtn
            label="Move down"
            disabled={isLast}
            onClick={() => onMove(1)}
          >
            <ArrowDownIcon className="size-3.5" />
          </IconBtn>
          <IconBtn label="Remove field" tone="danger" onClick={onRemove}>
            <TrashIcon className="size-3.5" />
          </IconBtn>
        </div>
      </div>

      {open && (
        <div className="flex flex-col gap-3 border-t border-border/60 px-3 py-3">
          <Field label="Label" htmlFor={`fl-${field.id}`}>
            <Input
              id={`fl-${field.id}`}
              value={field.label}
              onChange={(e) => onUpdate({ label: e.target.value })}
            />
          </Field>

          {isConsent ? (
            <Field label="Consent statement" htmlFor={`fc-${field.id}`}>
              <Textarea
                id={`fc-${field.id}`}
                rows={2}
                value={field.consentCopy ?? ""}
                onChange={(e) => onUpdate({ consentCopy: e.target.value })}
              />
            </Field>
          ) : (
            <Field
              label="Help text"
              htmlFor={`fh-${field.id}`}
              hint="Optional guidance under the field."
            >
              <Input
                id={`fh-${field.id}`}
                value={field.description ?? ""}
                onChange={(e) => onUpdate({ description: e.target.value })}
              />
            </Field>
          )}

          {showPlaceholder && (
            <Field label="Placeholder" htmlFor={`fp-${field.id}`}>
              <Input
                id={`fp-${field.id}`}
                value={field.placeholder ?? ""}
                onChange={(e) => onUpdate({ placeholder: e.target.value })}
              />
            </Field>
          )}

          <SwitchRow
            label="Required"
            description="Respondents must answer before submitting."
            checked={field.required}
            onCheckedChange={(required) => onUpdate({ required })}
          />
        </div>
      )}
    </div>
  );
}

function IconBtn({
  label,
  children,
  onClick,
  disabled,
  tone,
}: {
  label: string;
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  tone?: "danger";
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors",
        "hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        tone === "danger" && "hover:bg-destructive/10 hover:text-destructive",
      )}
    >
      {children}
    </button>
  );
}

// ── Design ──────────────────────────────────────────────────────────────────

function layoutGlyph(preset: LayoutPreset): React.ReactNode {
  const bar = "rounded-sm bg-foreground/15";
  const accent = "rounded-sm bg-brand/60";
  const wrap =
    "flex h-full w-full items-center justify-center gap-1 bg-muted/40 p-2";
  switch (preset) {
    case "fullPage":
      return (
        <div className={cn(wrap, "flex-col")}>
          <div className={cn(bar, "h-1.5 w-2/3")} />
          <div className={cn(bar, "h-1 w-full")} />
          <div className={cn(accent, "h-1.5 w-1/3 self-start")} />
        </div>
      );
    case "splitHero":
      return (
        <div className={cn(wrap)}>
          <div className="h-full w-1/2 rounded-sm bg-brand/40" />
          <div className="flex h-full w-1/2 flex-col justify-center gap-1">
            <div className={cn(bar, "h-1 w-full")} />
            <div className={cn(accent, "h-1.5 w-1/2")} />
          </div>
        </div>
      );
    case "oneQuestion":
      return (
        <div className={cn(wrap, "flex-col justify-center")}>
          <div className={cn(bar, "h-1.5 w-3/4")} />
          <div className={cn(accent, "h-2 w-1/4")} />
        </div>
      );
    case "centeredCard":
    default:
      return (
        <div className={cn(wrap)}>
          <div className="flex h-full w-2/3 flex-col justify-center gap-1 rounded-md bg-background p-1.5 shadow-sm">
            <div className={cn(bar, "h-1 w-full")} />
            <div className={cn(accent, "h-1.5 w-1/2")} />
          </div>
        </div>
      );
  }
}

function DesignPanel({
  doc,
  onChange,
}: {
  doc: FormDefinitionDoc;
  onChange: (next: FormDefinitionDoc) => void;
}) {
  const setDesign = (patch: Partial<FormDefinitionDoc["design"]>) =>
    onChange({ ...doc, design: { ...doc.design, ...patch } });
  const setLayout = (layoutPreset: LayoutPreset) =>
    onChange({ ...doc, layoutPreset });

  return (
    <div className="flex flex-col gap-6">
      <Section title="Layout" description="The overall shape of the page.">
        <OptionCardGroup<LayoutPreset>
          ariaLabel="Layout preset"
          columns={2}
          previewClassName="aspect-[16/10]"
          value={doc.layoutPreset}
          onChange={setLayout}
          options={[
            {
              value: "centeredCard",
              label: "Centered card",
              preview: layoutGlyph("centeredCard"),
            },
            {
              value: "fullPage",
              label: "Full page",
              preview: layoutGlyph("fullPage"),
            },
            {
              value: "splitHero",
              label: "Split hero",
              preview: layoutGlyph("splitHero"),
            },
            {
              value: "oneQuestion",
              label: "One question",
              preview: layoutGlyph("oneQuestion"),
            },
          ]}
        />
      </Section>

      <Section
        title="Brand"
        description="Color drives the whole theme — we derive and AA-clamp the rest."
      >
        <Field label="Brand color">
          <ColorControl
            value={doc.design.brandColor}
            onChange={(brandColor) => setDesign({ brandColor })}
          />
        </Field>
        <Field label="Color scheme">
          <Segmented<DisplayMode>
            ariaLabel="Color scheme"
            value={doc.design.mode}
            onChange={(mode) => setDesign({ mode })}
            options={[
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
              { value: "system", label: "System" },
            ]}
          />
        </Field>
        <Field label="Typography">
          <SelectField<FontPairing>
            ariaLabel="Font pairing"
            value={doc.design.fontPairing}
            onChange={(fontPairing) => setDesign({ fontPairing })}
            options={[
              { value: "inter", label: "Inter (modern)" },
              { value: "geist", label: "Geist (clean)" },
              { value: "system", label: "System" },
              { value: "serifEditorial", label: "Serif editorial" },
            ]}
          />
        </Field>
      </Section>

      <Section
        title="Surface"
        description="Fine-tune the feel of the form chrome."
      >
        <Field label="Corners">
          <Segmented<RadiusToken>
            ariaLabel="Corner radius"
            value={doc.design.radius}
            onChange={(radius) => setDesign({ radius })}
            options={[
              { value: "sharp", label: "Sharp" },
              { value: "soft", label: "Soft" },
              { value: "rounded", label: "Rounded" },
            ]}
          />
        </Field>
        <Field label="Density">
          <Segmented<DensityToken>
            ariaLabel="Density"
            value={doc.design.density}
            onChange={(density) => setDesign({ density })}
            options={[
              { value: "compact", label: "Compact" },
              { value: "comfortable", label: "Comfort" },
              { value: "spacious", label: "Spacious" },
            ]}
          />
        </Field>
        <Field label="Buttons">
          <Segmented<ButtonStyleToken>
            ariaLabel="Button style"
            value={doc.design.buttonStyle}
            onChange={(buttonStyle) => setDesign({ buttonStyle })}
            options={[
              { value: "filled", label: "Filled" },
              { value: "outline", label: "Outline" },
              { value: "soft", label: "Soft" },
            ]}
          />
        </Field>
        <Field label="Fields">
          <Segmented<FieldStyle>
            ariaLabel="Field style"
            value={doc.design.fieldStyle}
            onChange={(fieldStyle) => setDesign({ fieldStyle })}
            options={[
              { value: "outlined", label: "Outlined" },
              { value: "filled", label: "Filled" },
              { value: "underline", label: "Underline" },
            ]}
          />
        </Field>
        <Field label="Background">
          <Segmented<BackgroundStyle>
            ariaLabel="Background style"
            value={doc.design.backgroundStyle}
            onChange={(backgroundStyle) => setDesign({ backgroundStyle })}
            options={[
              { value: "plain", label: "Plain" },
              { value: "gradient", label: "Gradient" },
              { value: "softPattern", label: "Pattern" },
            ]}
          />
        </Field>
      </Section>
    </div>
  );
}

function ColorControl({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="relative size-9 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-border">
        <span
          className="absolute inset-0"
          style={{ backgroundColor: value }}
          aria-hidden
        />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0"
          aria-label="Brand color"
        />
      </label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 font-mono text-xs uppercase"
        aria-label="Brand color hex"
      />
    </div>
  );
}

// ── Flow ────────────────────────────────────────────────────────────────────

function FlowPanel({
  doc,
  onChange,
}: {
  doc: FormDefinitionDoc;
  onChange: (next: FormDefinitionDoc) => void;
}) {
  const setFlow = (patch: Partial<FormDefinitionDoc["flow"]>) =>
    onChange({ ...doc, flow: { ...doc.flow, ...patch } });
  const setSettings = (patch: Partial<FormDefinitionDoc["settings"]>) =>
    onChange({ ...doc, settings: { ...doc.settings, ...patch } });

  return (
    <div className="flex flex-col gap-6">
      <Section
        title="Flow"
        description="How respondents move through the form."
      >
        <Field label="Mode">
          <Segmented<FlowMode>
            ariaLabel="Flow mode"
            value={doc.flow.mode}
            onChange={(mode) => setFlow({ mode })}
            options={[
              { value: "single", label: "Single page" },
              { value: "step", label: "Step by step" },
            ]}
          />
        </Field>
        {doc.flow.mode === "step" && (
          <>
            <SwitchRow
              label="Progress indicator"
              description="Show a progress bar across steps."
              checked={doc.flow.progressIndicator}
              onCheckedChange={(progressIndicator) =>
                setFlow({ progressIndicator })
              }
            />
            <SwitchRow
              label="Auto-advance"
              description="Move to the next step after a rating is chosen."
              checked={doc.flow.autoAdvance}
              onCheckedChange={(autoAdvance) => setFlow({ autoAdvance })}
            />
          </>
        )}
        <Field label="Consent placement">
          <SelectField<ConsentPlacement>
            ariaLabel="Consent placement"
            value={doc.flow.consentPlacement}
            onChange={(consentPlacement) => setFlow({ consentPlacement })}
            options={[
              { value: "beforeSubmit", label: "Before submit" },
              { value: "finalStep", label: "Final step" },
              { value: "inline", label: "Inline with fields" },
            ]}
          />
        </Field>
      </Section>

      <Section title="Behavior" description="Submission rules and footer.">
        <SwitchRow
          label="Require consent"
          description="Block submission until the respondent agrees."
          checked={doc.settings.requireConsent}
          onCheckedChange={(requireConsent) => setSettings({ requireConsent })}
        />
        <SwitchRow
          label="Allow anonymous"
          description="Let respondents submit without identifying themselves."
          checked={doc.settings.allowAnonymous}
          onCheckedChange={(allowAnonymous) => setSettings({ allowAnonymous })}
        />
        <SwitchRow
          label="Show Semblia attribution"
          description="Display a subtle “Powered by Semblia” in the footer."
          checked={doc.settings.attribution}
          onCheckedChange={(attribution) => setSettings({ attribution })}
        />
      </Section>
    </div>
  );
}
