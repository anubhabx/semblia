# `/projects` — Rework decision (second pass)

Date: 2026-06-12.

## Gate readout

Before-audit: Q1, Q2, Q4, Q6, Q7, Q9, Q10 NO. Rule requires any single one. **Gate clears
for a structural rework.** User has explicitly pre-authorized "completely rework the structure
of what is broken… even if it comes to be the whole page" and named `/projects` as the start.

## In scope

| # | Change | Principle | Files |
|---|--------|-----------|-------|
| 1 | Centered `max-w-6xl` content column for header row, summary, transfers, toolbar, and content. Page-local header (brand-rule eyebrow "Workspace" + `text-xl/2xl` title + summary line) replaces the full-bleed sticky `PageHeader` band on this page only. | P5 | `projects-client.tsx` |
| 2 | Workspace summary line: "N project(s) · N responses · N pending review" (pending segment amber, only when > 0; "no responses yet" when 0). Skeleton line while loading. | P7 | `projects-client.tsx`, `use-projects.ts` (already computed) |
| 3 | Default view `"grid"`; persisted choice still wins; toggle still gated to ≥ 6. | P6 | `use-projects.ts` |
| 4 | Card upgrade: drop the 3px top stripe (avatar already carries brand colour); footer becomes worded stats (`N responses` / "No responses yet") + relative date, pinned via ItemCard structured `footer` slot; pending chip stays top-right; drop widgets count (inside-baseball at entry level). | P3/P6 | `project-card.tsx` |
| 5 | Dashed "New project" ghost tile as last grid cell when `!search && typeFilter === "all"`. Grid only. | P8 | `project-card.tsx` (co-located `NewProjectTile`), `projects-client.tsx` |
| 6 | List view (≥ 6 regime): rows inside a `rounded-xl border bg-card` panel; remove the doubled `divide-y` (ItemShell rows already own `border-b`; last row `last:border-b-0`). | P5 | `projects-client.tsx`, `project-row.tsx` |
| 7 | Error state: when load fails with no cached data — icon, "Couldn't load your projects", retry button wired to `refetch` (added to `useProjects` return). | P9 | `projects-client.tsx`, `use-projects.ts` |
| 8 | `RefreshingDataBadge` moves beside the header actions so refreshes are visible at all counts; stays in toolbar row too at ≥ 6? No — single location, header. | P9 | `projects-client.tsx` |
| 9 | Stagger cap: `Math.min(index, 6) × step` so late rows/cards never wait > ~400ms. | before-audit M8 | `project-row.tsx`, `project-card.tsx` |
| 10 | Skeletons rebuilt to mirror the new card/panel shapes inside the container. | P9 | `project-skeletons.tsx` |
| 11 | `IncomingTransfers` loses its own `px-4 sm:px-6` (container owns gutters). | P5 | `projects-client.tsx` |
| 12 | Header "New project" CTA hidden in the 0-project state (EmptyProjects owns the single decisive CTA). | P1 | `projects-client.tsx` |

## Out of scope

- `EmptyProjects` / `EmptySearch` internals — cleared 2026-05-23; unchanged except placement.
- Any api_v2 / DTO change. The page renders existing data only.
- The `/sign-in` POST 500 observed during the live walkthrough (recorded as follow-up).
- Topbar, account shell, project detail surfaces.
- New shared primitives or tokens — everything composes from ItemShell/ItemCard/ItemRow,
  Button, Skeleton, FilterPills, SearchField, ViewToggle, RefreshingDataBadge, PageBody.

## Anti-goals

- No dashboard-ification (charts, feeds, usage) — one summary line is the ceiling.
- No marketing copy filling the void — structure fixes it.
- No desaturating toward Linear/Vercel grayscale — Quiet Precision warmth stays.
- No new view modes, no masonry, no hero special-case for a single project.

## Acceptance criteria

1. At 1 project / 1264px: content sits in a centered column; the grid shows the project card
   + ghost tile; summary line renders; no full-bleed row; void no longer dominant.
2. Card view is the default for fresh users; a stored `"list"` choice is respected.
3. At ≥ 6 projects: toolbar appears (pills/search/toggle), list renders as a bounded panel
   with single 1px separators.
4. Error branch renders with retry; refreshing badge visible at 1 project.
5. `tsc --noEmit`, `eslint`, full Vitest, `pnpm build --filter web_v2` all pass; existing
   `empty-projects` and `search-placeholders` tests stay green (toolbar threshold unchanged).
6. Live after-audit screenshots (light/dark/mobile) show the structural NOs flipped.
