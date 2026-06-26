# Form Studio & Widget Studio — reconciliation and roadmap

> Date: 2026-06-15 · Status: **planning / reconciliation** (no architecture
> reopened). Companion to `docs/research/2026-06-15-studio-competitors/README.md`.
> This doc reconciles a "design & build the studios" brief with the **already-shipped,
> locked** parametric architecture, then lays out only **non-conflicting** work.

## 0. Why this doc exists

A brief arrived asking to research competitors and then *design and build* Form
Studio and Widget Studio from scratch — forms "like the Tally drag-drop builder,"
widgets "like freeform Framer/Webflow token editors." Taken literally that would
**rewrite work shipped this week** and **violate four locked decisions**
(`docs/continuity/decisions.md`):

- 2026-06-10 — *Parametric theming over a freeform builder; **no drag-and-drop, ever.***
- 2026-06-11 — *The freeform layer was **hard-deleted**, not frozen.*
- 2026-06-14 — *Widgets use the same parametric brand-theme architecture as forms.*
- open-questions — *Do **not** reintroduce freeform token/composition controls in the widget studio.*

Per `CLAUDE.md` ("Do not blindly rewrite… reuse > extend > create") and the
"user retains business/architecture ownership" decision, this session does **not**
rebuild. It honors the *intent* — make the studios inspiration-grade — within the
locked model, and records the conflict so the user can re-scope when back.

## 1. What already exists (verified in code, 2026-06-15)

### Shared engine
- **`@workspace/brand-theme`** — DOM-free derivation engine. A few brand inputs →
  a full OKLCH, **AA-clamped** `DerivedTheme`. Var-name-agnostic (forms emit
  `--semblia-form-*`, widgets `--semblia-widget-*`). One brand identity, two
  surfaces, guaranteed-coherent output.

### Form Studio (Collect) — **shipped**
- `@workspace/forms-core` — `schema` (`FormDefinitionDoc` v2: structure / layout /
  theme / content), `theme` (re-exports brand-theme), `render` (4 hand-designed
  preset renderers: **card, inline, split, conversational**, progressive-enhancement
  SSR), `telemetry`.
- `@workspace/forms-embed` — `<semblia-form>` Shadow-DOM custom element, ~1.1 KB
  gzip (3 KB budget), one SSR fragment round-trip.
- `apps/web_v2/components/collect/studio/*` — parametric WYSIWYG studio
  (`studio-client`, `studio-editor`, `preview-canvas`), Publish + "Unpublished"
  badge, per-question file upload.
- `apps/forms_runtime` — public runtime; per-response CSP; server-rendered success.

### Widget Studio — **parametric rewrite substantially in place**
- `@workspace/widgets-core` — `schema` (`WidgetDefinitionDoc` v1 +
  `definition`/`migrate`/`publish`), `theme` (re-exports brand-theme), `render`
  (`renderPublishedWidgetFragment`), `telemetry`.
- `@workspace/widgets-embed` — `<semblia-widget>` loader.
- `apps/web_v2/components/widgets/studio/*`:
  - `controls-appearance.tsx` — **the derived brand-input control set** the plan
    asked for (brandColor + appearance + surfaceStyle + radius 0–4 + density +
    typePairing + accentIntensity + neutralTone + buttonStyle, plus style presets
    + "Remix"). The five-hex flat model is gone from the active path.
  - `controls-layout/content/behavior/visibility/wall` — the Content + Layout +
    field-visibility axes.
  - `widget-studio-preview.tsx` — **true WYSIWYG**: `publishWidgetDefinition` →
    `composePublishedWidgetDoc` → `renderPublishedWidgetFragment`, mounted in a
    real shadow root. Preview = production render path.
- api_v2 + Prisma: `Widget.config` (versioned doc) + `Widget.publishedSnapshot`
  (derived theme at publish); flat columns kept as compatibility mirrors; public
  fragment endpoint scoped to project slug (`30726011`).

### Drift found (and corrected this session)
- `progress.md`/`decisions.md` say the widget "Studio rewrite [is] in-tree / done."
  Mostly true, but **dead code was left behind**: `controls-color/shape/style/
  typography/theme/density.tsx` (the old flat-token controls) have **zero
  importers** (verified) — the plan said *delete*. Cleaned up this session.
- Widget Studio still persists to a **local zustand draft store**
  (`lib/widgets/widget-studio-store.ts`), not API-backed save/publish — the one
  real functional gap vs. forms (which wired server publish). Tracked below.

## 2. UX architecture (current → forward)

Both studios share one **three-axis model**, re-labeled per surface:

| Axis | Form Studio | Widget Studio | User control |
|---|---|---|---|
| **Structure / Content** | Questions, logic (`showIf`), required | Curation: source, order, min-rating, max, handpick + field visibility | *What*, never raw layout |
| **Layout** | card · inline · split · conversational | carousel · grid · masonry · list · wall | Pick one preset, never arrange |
| **Appearance** | shared `resolveBrandTheme` | shared `resolveBrandTheme` | A few inputs; rest derived + AA-clamped |

Studio shell pattern (shared, keep consistent): full-screen overlay · Topbar
(name, dirty, Save/Publish, Share) · left **rail** · **controls** (sectioned
accordion) · **preview** (device frames, real render path) · unsaved-changes
guard · `⌘S`. This is already consistent across both — protect it.

### Forward UX moves (non-conflicting)
1. **Starter gallery at creation** (Jotform/Fillout lesson) — pick a curated
   *preset × theme* card with a live thumbnail instead of starting blank. These
   are **curated combinations of existing presets**, not freeform templates, so
   they fit the locked model. Applies to both studios.
2. **Runtime polish on form presets** (Typeform lesson) — step transitions, focus
   management, progress affordance on the conversational/split presets. `/polish`
   + `/animate`, render-layer only.
3. **Publish parity for widgets** (Framer lesson) — confident publish moment +
   draft/published state, matching forms' Publish/Unpublished pattern.
4. **Data-view feel for widget Content** (Airtable lesson) — filter + sort + pick
   with immediate visual result; the sections exist, tighten the interaction.

## 3. Technical architecture (current, for reference)

```
@workspace/brand-theme            ← shared derivation (OKLCH + AA clamp), DOM-free
  ├── forms-core/theme  (re-export)         widgets-core/theme  (re-export)
@workspace/forms-core             @workspace/widgets-core
  schema  FormDefinitionDoc v2      schema  WidgetDefinitionDoc v1 (+migrate/publish)
  render  4 preset SSR fns          render  preset SSR fns (carousel/grid/…)
  telemetry                         telemetry
@workspace/forms-embed            @workspace/widgets-embed
  <semblia-form> (≤3KB)             <semblia-widget> (≤3KB)
apps/forms_runtime  (public HTTP) apps/api_v2  (resolve/submit/publish, trust, ETag)
apps/web_v2/components/collect/studio   apps/web_v2/components/widgets/studio
```

- **Write-time validation** (Zod at the boundary) → a saved doc is always renderable.
- **Publish stamps a derived snapshot** → serve path never re-derives; preview
  can't disagree with production.
- **Zero framework on the wire**; Shadow-DOM mount; system fonts default, webfonts
  opt-in; CI size budgets.

## 4. Data model (current, for reference)

- `CollectionForm.config: Json` — `FormDefinitionDoc` (schemaVersion 2). Publish
  stamps resolved theme snapshot. `slug` unique per project; `abWeight` per form.
- `Widget.config: Json` (`WidgetDefinitionDoc` v1) + `Widget.publishedSnapshot:
  Json?` (derived theme @ publish). `wallSlug` (unique), `isActive`, `projectId`,
  `name` stay columns; flat theme columns are read-deprecated mirrors pending a
  cleanup migration.
- `CollectionFormSubmission` — canonical, **immutable** feedback source; answers,
  ratings, trust metadata. Widgets read **approved** submissions.
- `WidgetAnalytics` — impression/load metrics (real wiring best-effort per plan).
- Theme telemetry → `ProjectActionAudit` rows (no new table).

## 5. V1 vs. later

### V1 — this/next sessions (non-conflicting, sanctioned)
- [x] **Dead-code cleanup** — delete orphaned flat-token widget controls (done).
- [x] **Continuity drift fix** — record true state (done).
- [ ] **`/audit` + `/polish` pass** on both studio chromes (skills-routed).
- [ ] **Starter gallery at creation** (preset × theme cards) — mocks-first,
      reuses existing presets; biggest product win.
- [ ] **Widget Studio publish parity** — API-backed save/publish (Codex lane for
      api_v2; Claude wires UI), matching forms' Publish flow.

### Later — needs product/user decision or larger lift
- Hosted Wall page (`semblia.com/wall/[slug]`) — embeds-first; deferred by plan.
- Custom embed domains (CDK guard stays).
- AI brand-import into theme (shareable via `brand-theme`).
- `spotlight` / `marquee` widget presets (guarded `WidgetNotImplementedError`).
- Video-testimonial rendering polish beyond poster frame.
- `packages/embed-core` loader consolidation (stretch).
- Presets × themes visual-regression matrix.

### Explicitly NOT doing (locked-closed; reopen only with user)
- Drag-and-drop / freeform form canvas.
- Freeform widget token/composition editor (raw hex/px/font-stack knobs).
- A second token system divergent from `brand-theme`.

## 6. Process for the work above
Repo norms (`CLAUDE.md`, widgets-parametric §8): backend/DB → Codex
(`codex:codex-rescue`); UI → Claude via design skills (`/critique`/`/audit`
before, `/normalize`/`/polish` after); new UI **mocks-first**; every phase
formats + lints + typechecks green and runs `python scripts/update-indexes.py`;
**per-phase commits**; `pnpm build --filter web_v2` must pass before session end.
