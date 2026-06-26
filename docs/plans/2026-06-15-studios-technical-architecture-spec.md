# Studios — technical architecture & data-model specification

> Date: 2026-06-15 · Status: **definitive spec of the as-built system** (no
> architecture reopened). Companion to the reconciliation roadmap
> (`2026-06-15-studios-reconciliation-and-roadmap.md`) and research notes
> (`docs/research/2026-06-15-studio-competitors/`).
>
> This is the "Define the UX architecture / shared design system / data model /
> V1-vs-later" deliverable from the brief. It documents what is **actually in the
> codebase** (verified against `packages/forms-core`, `packages/widgets-core`,
> `@workspace/brand-theme`, and `apps/web_v2`), because the studios already exist
> on a locked parametric architecture. Where the brief implied a from-scratch
> model, the on-system equivalent is given.

---

## 1. UX architecture

Both studios share one **three-axis editing model** and one **full-screen shell
pattern**. The axes map to the locked separation of concerns: you compose
*content* freely, you *pick* a layout (never arrange), and you *nudge* a few
appearance inputs (everything else is derived + AA-clamped).

### 1.1 Form Studio — `apps/web_v2/components/collect/studio/`

- **Shell**: `studio-client.tsx` → `studio-editor.tsx` + `preview-canvas.tsx`.
  Topbar (name · dirty/unpublished pill · **Save** outline + **Publish** primary ·
  Share) over a controls/preview split.
- **Panels** (tabs): **Content** (copy + after-submit behavior), **Questions**
  (the only free-compose axis — add/remove/reorder, type, required, placeholder,
  helper, choice options, conditional `showIf`), **Layout** (pick one of 4 presets
  + per-layout knobs), **Theme** (brand color + 8 derived knobs + preset seeds +
  guided-custom color overrides).
- **Preview**: true WYSIWYG — renders through the production `forms-core/render`
  path (sandboxed), desktop/mobile toggle. Preview === served form.
- **Publish/Share**: `PUT …/draft` (`{draft, expectedVersion}`) then
  `PUT …/draft/publish` (`{expectedVersion}`); publish saves first if dirty;
  "Unpublished" badge when `version > publishedVersion`. Embed = `<semblia-form>`.
- **Inspiration mapping**: Typeform → conversational preset runtime;
  Tally → fast keyboard question list (not a freeform canvas); Fillout → branding
  (logo/brand-color sync, watermark/custom-domain as paid levers).

### 1.2 Widget Studio — `apps/web_v2/components/widgets/studio/`

- **Shell**: `widget-studio-shell.tsx` — Topbar + (Rail | Controls | Preview) on
  desktop; a 4-tab body (Layout/Style/Content/Preview) on mobile (now a complete
  `tablist`/`tabpanel` ARIA pattern). Unsaved-changes guard, `⌘S`.
- **Creation**: `widget-kind-picker.tsx` — two-step modal **kind → layout**
  (Wall vs Embed; then a visual layout-glyph grid for embeds).
- **Controls** (`widget-studio-controls.tsx` accordion): **Layout** →
  **Appearance** (shared brand-theme inputs + 6 style presets + Remix) → **Wall**
  (wall-kind only) → **Content** (source/order/min-rating/handpick) →
  **Behavior** (auto-rotate/interval/branding) → **Visibility** (field toggles).
- **Preview**: `widget-studio-preview.tsx` — true WYSIWYG through
  `widgets-core/render` mounted in a real shadow root; device frames; auto-theme
  pulse (now reduced-motion-aware).
- **Share**: `widget-share-drawer.tsx` — `<script …/embed.js>` + `<semblia-widget>`.
- **Inspiration mapping**: Framer variants → layout + style presets;
  Webflow tokens → the derived brand-theme system (stronger: AA-guaranteed);
  Airtable data views → the Content axis (source/order/filter/handpick).

---

## 2. Shared design system

### 2.1 The engine — `@workspace/brand-theme`
DOM-free, isomorphic, `sideEffects:false`. `resolveBrandTheme(inputs, scheme)` →
`DerivedTheme`. Var-name-agnostic: forms emit `--semblia-form-*` (a.k.a. `--tf-*`),
widgets emit `--semblia-widget-*`. `forms-core/theme` and `widgets-core/theme`
re-export it, so both surfaces derive from **one identity**.

### 2.2 Source inputs (the only raw knobs — identical across both surfaces)
| Input | Type / enum |
|---|---|
| `brandColor` | hex `#rgb`/`#rrggbb` |
| `appearance` | `light` · `dark` · `system` |
| `radius` | `0 \| 1 \| 2 \| 3 \| 4` (scale, not px) |
| `density` | `compact` · `cozy` · `spacious` |
| `typePairing` | `inherit` · `inter` · `geist` · `system` · `serif-editorial` |
| `surfaceStyle` | `flat` · `bordered` · `elevated` |
| `accentIntensity` | `subtle` · `balanced` · `bold` |
| `neutralTone` | `auto` · `pure` · `warm` · `cool` |
| `buttonStyle` | `solid` · `soft` · `outline` |

### 2.3 Derived tokens (computed + WCAG-AA-clamped, never user-set)
`colorScheme`, `accent`, `accentText`, `accentHover`, `accentActive`,
`accentSoft`, `accentSoftText`, `focusRing`, `background`, `surface`,
`surfaceRaised`, `text`, `mutedText`, `border`, `borderStrong`, `radius`,
`radiusField`, `borderWidth`, `shadow`, `buttonStyle`, `spaceUnit`, `fieldPadY`,
`fieldPadX`, `fieldGap`, `sectionGap`, `fontFamily`. (Identical token set for
forms and widgets — see `derivedFormThemeSchema` / `derivedWidgetThemeSchema`.)

### 2.4 Presets (seeds, not freeform templates)
- **Forms**: `forms-core` `PRESETS` (theme seeds; `themeDoc.preset` keeps the
  seed for telemetry + "reset to preset").
- **Widgets**: `STYLE_PRESET_LIST` — Clean · Editorial · Launch · Soft · Mono ·
  Noir (each a full `brandThemeInputs` bundle) + a "Remix" randomizer that keeps
  the user's brand color.

### 2.5 Variants
Layout presets are the "variants": Forms = `card · inline · split ·
conversational` (+ per-layout `layoutOptions` knobs: align/width/header/split
panel/progress). Widgets = `carousel · grid · masonry · list · wall`.

### 2.6 Safe overrides (tiered escape hatches — the anti-"freeform chaos" rule)
1. **Preset** (pick a seed).
2. **Theme object** (the 9 inputs).
3. **Guided-custom color overrides** (forms only): `colorOverrides {accent,
   background, surface, text}` — each nullable; publish **re-derives + re-clamps
   to AA**, so an override can never ship an inaccessible form.
4. **Headless** (consume the published `DerivedTheme` directly) — for advanced.
No drag-and-drop, no raw px/font-stack knobs, ever (locked 2026-06-10/11/14).

---

## 3. Data model (versioned envelopes)

### 3.1 Forms — `FormDefinitionDoc` (schemaVersion **2**), in `CollectionForm.config`
```
FormDefinitionDoc {
  schemaVersion: 2
  structure: { questions: Question[1..30] }      // the only free-compose axis
  layout:    { preset: card|inline|split|conversational, options: {…per-layout} }
  theme:     { preset, inputs: BrandThemeInputs, colorOverrides }
  content:   { brandName, headline, subhead, submitLabel, logoUrl, logoAssetId,
               brandingSync, loaderMessage, success: {title,message,action,
               redirectUrl,ctaLabel,ctaUrl} }
}
Question { id(slug), type, label, placeholder, description, required,
           options[≤20], showIf: { questionId, op, value } | null }
QuestionType = shorttext|longtext|email|stars|nps|emoji|radio|checkbox|dropdown|file
ShowIfOp     = eq|neq|gt|lt|gte|lte|includes
```
- **Fields/steps/logic**: questions carry type + required + options; "steps" =
  the conversational preset's stepping; "logic" = `showIf` rules (validated:
  no self-reference, must target an existing question, option-kinds need ≥2
  options). Free-form logic *builders* are intentionally out (locked).

### 3.2 Widgets — `WidgetDefinitionDoc` (schemaVersion **1**), in `Widget.config`
```
WidgetDefinitionDoc {
  schemaVersion: 1
  kind:     embed | wall
  layout:   { preset: carousel|grid|masonry|list|wall }
  content:  { mode: all|handpicked, pickedIds[], order: recent|rating|manual|
              shuffle, minRating: 1..5|null, maxItems: 1..100 }   // Airtable-style
  display:  { showRating, showAvatar, showCompany, showDate, showSource }
  behavior: { autoRotate, rotateInterval: 1000..60000 }
  theme:    BrandThemeInputs
  branding: { logoUrl|null, watermark }                  // watermark forced on free tier
  wall:     { slug, title, subhead } | null              // required when kind/layout = wall
}
```

### 3.3 Themes — publish-time snapshot (both surfaces)
`publishedSnapshot { derivedTheme: { appearance, schemes:{light?,dark?} },
version, resolvedAt }`. The serving path reads the snapshot and **never
re-derives at request time** → preview and production cannot disagree.

### 3.4 Persistence & publishing
- Prisma `CollectionForm.config Json`; `Widget.config Json` +
  `Widget.publishedSnapshot Json?` (migration `20260614143000_widgets_parametric_config`).
  Queryable columns stay columns (`slug`/`wallSlug` unique, `isActive`,
  `projectId`, `name`, `abWeight`); legacy flat theme columns are read-deprecated
  mirrors pending a cleanup migration.
- **Drafts**: one shared server draft per resource, **optimistic concurrency**
  (`version`/`expectedVersion`; stale writes fail loudly). Forms wire this in the
  studio; widgets have the API + hooks (`useWidgetDraft`/`useSaveWidgetDraft`) but
  the studio still buffers in a local zustand store (the one open gap).
- **Write-time validation**: Zod at the boundary → a saved doc is always
  renderable. `migrateFormDoc` / widget `migrate` own version projection; unknown
  future versions throw, never silently project.

### 3.5 Moderation (read-only here; owned by the submissions pipeline)
Submissions are immutable (`CollectionFormSubmission`). `SubmissionModerationRun`
holds provider/op/status/decision/score/flags (AWS-first: Comprehend/Rekognition/
Transcribe). Reviewer `APPROVED`/`REJECTED` is authoritative; widgets read only
**approved** submissions. Review DTOs expose safe run summaries only.

### 3.6 Embed configs
- Loaders: `<semblia-form>` (`packages/forms-embed`, ≤3 KB gz, ~1.1 KB actual),
  `<semblia-widget>` (`packages/widgets-embed`, ≤3 KB gz, ~0.8 KB). Declarative
  Shadow DOM; host CSS can't bleed in.
- One SSR fragment round-trip; `ETag` keyed by published version; per-response
  CSP carrying the runtime script's sha256; system fonts default, webfonts an
  explicit `typePairing` opt-in; CI size budgets.
- Forms fragment from `forms_runtime */__embed`; widget fragment from
  `/v2/widget-embeds/projects/:slug/:widgetId/fragment` under project
  trusted-origin CORS.

---

## 4. V1 vs. later

**Shipped (V1, in-tree):** forms-v4 (4 preset renderers + studio + embed + file
upload); widgets parametric (schema/migrate/publish/render, derived appearance
controls, true-WYSIWYG preview, embed loader, API-backed CRUD + draft API);
moderation pipeline; analytics events; tiering via entitlements.

**Top of next (non-conflicting, sanctioned):**
1. Widget Studio **publish-parity** — wire the studio to the existing
   `useSaveWidgetDraft`/publish API (replace local-only draft store). Frontend
   wiring; backend already exists.
2. **Starter gallery at creation** (preset×theme cards) for both studios.
3. `/critique`+`/polish` chrome pass (best done where the authed studio can be rendered).

**Later (needs product/user decision):** hosted Wall page; custom embed domains;
AI brand-import into theme; `spotlight`/`marquee` presets; video-testimonial
polish; `packages/embed-core` loader consolidation; presets×themes visual-regression matrix.

**Locked-closed (reopen only with the user):** drag-and-drop / freeform canvas;
freeform widget token editor; any second token system divergent from `brand-theme`.
