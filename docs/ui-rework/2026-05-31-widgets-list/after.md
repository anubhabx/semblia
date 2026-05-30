# After — Widgets List / Gallery

Date: 2026-05-31
File touched: `apps/web_v2/components/widgets/widgets-gallery.tsx`

## NO → YES delta

| Q | Before | After | What changed |
|---|--------|-------|--------------|
| 8 | NO | YES | Now composes from the same shared primitives as the canonical sibling: `WidgetCard` → `ItemCard` (paper-press hover), status → `StatusPill tone="success"/"muted"` (off-brand `emerald-50/700` removed), empty → `EmptyKindPicker`, `CreateRow` → centered pill row with outline `Button`s. |
| 10 | NO | YES | Widgets gallery and Collect gallery now share one design language — toggling tabs no longer reveals two different apps. |
| Dashboard Q4 | PARTIAL | YES | First-run uses `EmptyKindPicker` (brand-rule eyebrow → orienting heading → layout buttons with their own busy state). |

## Re-run — Core Questions

1. YES  2. YES  3. YES  4. YES  5. N/A  6. YES  7. YES  8. **YES**  9. YES  10. **YES**

## Re-run — Mechanical Quality Gate

1. YES  2. YES  3. YES — no off-brand colours  4. YES  5. YES — pill carries text  6. YES — grid collapses sm/lg  7. YES — create-by-layout and open flows preserved (`handleCreate` → redirect), verified via build.

## Verification

- `pnpm exec eslint` — clean (refactor dropped unused imports `Link`, `Star`, `cn`)
- `pnpm exec tsc --noEmit` — clean
- `pnpm exec prettier --write` — formatted
- `pnpm build --filter web_v2` — ✓ success (58s)

## Follow-ups

- None. The surface is now a structural mirror of `collect-forms-gallery`; if that sibling promotes its `CreateRow` to a shared primitive, this one should adopt it too.
