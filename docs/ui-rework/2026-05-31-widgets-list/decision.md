# Decision — Widgets List / Gallery

## Gate readout

Rework **allowed** — scoped **normalize pass** (mirror canonical sibling, no redesign):
- Q10 NO (sibling-inconsistency perceived-quality harm)
- Q8 NO (hand-rolled primitives)

## In scope

| # | Item | Ties to | Severity |
|---|------|---------|----------|
| 1 | `WidgetCard` → `ItemCard` (leading icon, title, subtitle = layout label, trailing `StatusPill`, metrics = testimonial count) | Q8/Q10 | IMPORTANT |
| 2 | Status pill `bg-emerald-50 text-emerald-700` → `StatusPill tone={published ? "success" : "muted"}` | Q8 | IMPORTANT |
| 3 | Hand-rolled empty kind picker → shared `EmptyKindPicker` | Q8/Q4 | IMPORTANT |
| 4 | `CreateRow` → centered pill row mirroring the sibling (outline `Button` per layout) | Q8 | MINOR |
| 5 | Remove now-unused imports surfaced by the refactor | lint hygiene | MINOR |

## Out of scope

- Widget layout taxonomy (wall/carousel/grid/list) and their copy.
- Create/open navigation behaviour (`window.location.href` redirect after create) — unchanged.
- The top-level loading spinner (matches the sibling exactly).

## Anti-goals

No new primitives/tokens, no layout redesign, no palette desaturation.

## Acceptance criteria

- Widgets gallery is visually indistinguishable in pattern from the Collect gallery.
- No raw Tailwind palette colours remain.
- `tsc`, `eslint`, `pnpm build --filter web_v2` pass.
