# Studios unification — one Semblia Studio, one pipeline

> Date: 2026-06-23 · Status: **approved scope, executing** · Branch: `revamp/v2`
> Supersedes the "align in place" stance of `docs/plans/2026-06-15-studios-reconciliation-and-roadmap.md`.
> Driver: the forms + widgets studios still feel like two passion projects, not one
> serious product. User approved a **full unification + pipeline framing** revamp,
> benchmarked against **Senja / Testimonial.to** (testimonial display), **Typeform /
> Tally / Fillout** (form editing), and **Framer / Webflow** (visual-editor feel).
> Explicitly NOT Linear/Stripe — the bar is a *visual editor*, not a settings panel.

## 0. The diagnosis (why it feels unserious)

Read from current code, not vibes:

1. **Different skeletons.** Forms studio = 2-pane (`Inspector 400px | Preview`).
   Widgets studio = 3-pane (`sibling-rail | Controls 380px | Preview`). Different
   widths, different structure, one has an in-editor sibling rail, the other doesn't.
2. **Incompatible save models.** Forms autosave to the server (optimistic version)
   **and** have a real Publish→immutable-snapshot lifecycle. Widgets have **no
   publish at all**; "Save" writes only to a **local zustand/localStorage store** —
   the biggest "this is a prototype" tell.
3. **Different inspector chrome.** Widget controls carry a branded `StudioMark`
   header; the forms inspector just begins. Different section taxonomies
   (Forms: Content/Fields/Design/Flow · Widgets: Layout/Style/Content).
4. **Inconsistent control language for the same job.** Widget *Style* is all visual
   pickers; forms *Design* is still text dropdowns/segmented labels ("Typography ▾",
   "Corners: Sharp·Soft·Rounded") — a settings form, not a visual editor.
5. **Fake data + scaffolding in production.** Widget preview renders demo
   testimonials (`selectPreviewTestimonials([], 12)`); the widgets list page passes a
   `MockProject` shim with a `// deferred to Phase 2` comment.

## 1. Key fact that simplifies everything

The widget **backend already exists** — no Codex build needed, this is all `web_v2`:

- `apps/api_v2 …/widgets.controller.ts`: `GET/PUT :widgetId/draft` **and**
  `PUT :widgetId/draft/publish` are implemented in `WidgetsService`.
- `apps/api_v2 …/responses.controller.ts`: `GET projects/:slug/responses` (list,
  display-safe, no PII) + `PATCH :id/status` + `PATCH :id/publish` exist.
- `web_v2 lib/semblia-api.ts` already has `fetchWidgetDraft` + `saveWidgetDraft`;
  `hooks/api` already has `useWidgetDraft` + `useSaveWidgetDraft` (wired, uncalled).

**Client gaps to close:** a `publishWidgetDraft` client + `usePublishWidgetDraft`
hook; feed the widget preview from real approved responses instead of the demo array.
Only escalate to Codex if the responses list DTO can't surface a testimonial body +
author cleanly for preview.

## 2. The target — one "Semblia Studio"

A studio shapes **one publish surface** (a form or a widget) and publishes it.
Both share the **same chrome and the same lifecycle**; internal state libs may differ.

**Shared surface model:** name · draft doc · published version/snapshot · status
(Draft / Published / Unpublished changes) · share/embed.
**Shared lifecycle:** edit → silent server autosave (optimistic version) → **Publish**
(confident moment, stamps snapshot) → Share / Get code. Dirty/saved/published shown
in the topbar. `⌘/Ctrl+S`, `beforeunload` guard, leave-confirm dialog.

**Desktop shell (≥1024):**

```
Topbar: [←] Name(inline) · status pill        [device][bg toggles] · Publish ▸ · Share
────────────┬───────────────────────┬─────────────────────────────────
 Section    │  Inspector            │  Preview canvas (THE HERO)
 rail       │  (active section's    │  large, centered, device/host
 (vertical, │   visual controls)    │  frame, REAL data, light/dark/
 icon+label)│                       │  brand/transparent background
────────────┴───────────────────────┴─────────────────────────────────
```

- **Vertical section rail** (Framer/Webflow/Linear pattern) replaces forms' horizontal
  tab strip *and* widgets' horizontal section nav *and* the in-editor sibling rail.
  Sibling switching leaves the editor (it belongs on the listing page).
- **Inspector** uses the existing shared primitives in `components/studio/controls.tsx`
  (`Section`/`Field`/`Segmented`/`OptionCardGroup`/`SwitchRow`). No new dropdowns.
- **Preview canvas is the star** — big, centered on a neutral canvas, with a
  device/width toggle and a **background toggle** (light · dark · brand · transparent,
  the Senja "preview on any background" move). Real render path, real data.

**Mobile (<1024):** topbar + bottom tab bar (sections + Preview), keep current pattern.

**Section parallelism** (chrome is identical; sections need not be):
- Forms: **Content · Fields · Style · Flow** (rename Design→Style).
- Widgets: **Content · Layout · Style** (Behavior/Wall fold into their owners).
Both lead with the same *Style* and *Content* concepts.

## 3. Pipeline framing — Collect → Manage → Display

Make the three surfaces read as one product, not three tools:
- **Collect** = Forms · **Manage** = Responses · **Display** = Widgets/Walls.
- Connective tissue: consistent naming, empty states that point to the next step,
  cross-links ("N new responses ready to feature"), and a light project overview funnel.
- No destructive nav rename unless it clearly helps; prefer additive connective tissue.

## 4. Phases (one clean commit each; build green each phase)

- **Phase 0 — Plan + design spec.** This doc. *(no code)*
- **Phase 1 — Unified `StudioShell` + lifecycle.** `components/studio/studio-shell.tsx`
  (topbar slot, vertical rail, inspector frame, preview-canvas hero w/ device + bg
  toggles) + a shared `useStudioSurface`/lifecycle hook extracted from the forms studio.
  Standalone primitives; no behavior change yet.
- **Phase 2 — Forms studio onto the shell.** Adopt `StudioShell`; rebuild Design→**Style**
  as visual pickers (typography specimens, corner glyphs, button/field/background tiles);
  preview-as-hero with background toggle.
- **Phase 3 — Widgets studio onto the shell + real lifecycle.** Adopt `StudioShell`;
  wire `useSaveWidgetDraft` + new `usePublishWidgetDraft`; add the Publish moment +
  draft/published status; feed preview with **real approved responses**; remove the
  `MockProject` shim + scaffolding comments.
- **Phase 4 — Pipeline IA.** Unify forms/widgets list pages to one pattern; add the
  Collect→Manage→Display connective tissue (cross-links, empty states, naming, overview).
- **Phase 5 — Polish + a11y + motion.** `/polish`, `/animate`, `/audit`; in-browser
  visual verification (light/dark, narrow widths); final.

## 5. Process (repo norms)

Skills-first (UI routes through `/frontend-design` → `/normalize`/`/typeset` →
`/polish`/`/audit`); per-phase commits, no consolidated commits; each phase runs
`tsc --noEmit` + `eslint` + `python scripts/update-indexes.py` green; treat security as
first-class; `pnpm build --filter web_v2` must pass before session end. Artifacts under
`docs/ui-rework/2026-06-23-studios-unification/` where a before/after is useful.
