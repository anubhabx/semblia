# Widget Studio rebuild — after (2026-06-17)

The widget studio inspector was rebuilt from a six-deep dropdown/accordion
settings panel into a focused, section-switched visual inspector — the companion
to the Form Studio rebuild (`b05c1131` + `b6d07aae`). Engine, `WidgetDefinitionDoc`
v1, the local draft store, API wiring, and the production shadow-DOM preview are
untouched — fully backward compatible.

Commits: `94c0d2d6` (rebuild) + this polish pass.

## What changed

- **`widget-theme-swatch.tsx` (new)** — `WidgetThemeSwatch`, a faithful mini
  testimonial card derived from the real engine (`resolveBrandThemeSnapshot`):
  true accent, surface, border, radius, button-style chip, type. The visual
  referent behind every preset/surface/radius/button/accent/neutral picker. It
  cannot drift from what ships. (Widget analog of the forms `ThemeSwatch`.)
- **`controls-appearance.tsx`** — every appearance choice is now visual: themed
  preset `OptionCardGroup`, segmented mode (sun/moon/system), engine-derived
  surface/button/neutral tiles, corner-radius glyphs, and real type specimens.
  The three text dropdowns (Type / Neutral / Buttons) are deleted.
- **`widget-studio-controls.tsx`** — a `Layout · Style · Content` section nav
  (tab/tabpanel) replaces the accordion; desktop and mobile share one section model.
- **Every section** (`controls-layout/behavior/content/visibility/wall`) moved to
  the shared inspector vocabulary (`Section` / `Field` / `Segmented` /
  `OptionCardGroup` / `SwitchRow`), re-exported through the widget studio's
  `studio-primitives.tsx` boundary. Orphaned accordion + dropdown/toggle/textarea
  primitives the rebuild replaced were deleted from `studio-input-primitives.tsx`.

## Live verification

Could not drive the user's logged-in Chrome (profile lock — see
`docs/research/2026-06-15-studio-competitors/` and the agent-browser session note),
and did not fabricate screenshots. Verification is the real compiled build +
type/lint/test gates below, plus the structural guarantee that the inspector's
mini-cards and the preview both call the same `resolveBrandTheme`, so what the
pickers show is what the shadow-DOM preview renders is what embeds.

## Design Health — after (~34/40, was ~25/40)

| # | Heuristic | Before | After | Note |
|---|-----------|:--:|:--:|------|
| 2 | Match real world | 2 | 4 | jargon knobs now have live themed referents |
| 4 | Consistency | 2 | 4 | one control vocabulary, shared with Form Studio |
| 6 | Recognition vs recall | 2 | 4 | no dropdowns; every choice is visible |
| 8 | Aesthetic / minimalist | 2 | 4 | focused section inspector, clear rhythm |
| 1,3,5,9,10 | (stable/strong) | — | — | live preview, AA clamp, Zod boundary kept |

## Polish pass applied

- **Focus rings** on every hand-rolled control (section-nav tabs, radius glyphs,
  type specimens, palette swatches, Remix); shared `Segmented`/`OptionCardGroup`
  already carry them.
- **Tab/tabpanel ARIA** wired on the desktop section nav (`aria-controls` +
  `aria-labelledby`), conditional so it doesn't double up inside the shell's
  mobile tabpanels.
- **Copy/consistency**: density label normalized to "Spacious" (matches the rest
  of the app); preset section retitled "Preset" to avoid echoing the "Style" tab;
  removed a dead `base` prop from the typeface picker.

## Verification

`tsc --noEmit` (clean), `eslint components/widgets/studio` (clean), `vitest`
(collect/studio-editor 6/6 — shared primitives intact), `pnpm build --filter
web_v2` (5/5), `python scripts/update-indexes.py` — all pass.

## Deliberately unchanged / deferred

- No engine/schema/API changes; no new theme knobs; no drag-and-drop; no freeform
  styling. Form Studio untouched.
- **Server-side save/publish parity** remains the open widget gap (the studio
  still persists to the local zustand draft store; `useSaveWidgetDraft` is wired
  but not called). That's the separate Codex-lane track —
  `docs/plans/2026-06-15-studios-reconciliation-and-roadmap.md` §5.
- The hand-pick reorder keeps arrow buttons (no DnD, by locked decision).
