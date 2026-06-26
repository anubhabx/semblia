# `/projects` — After-audit (second pass)

Date: 2026-06-12
Reviewer: Claude (Fable 5)
Evidence basis: **live dev-server walkthrough after the rework** (screenshots in `shots/after-*`,
`shots/check-*`) + full verification gates.

## What changed (per `decision.md`)

1. **Page structure** (`projects-client.tsx`): the full-bleed sticky `PageHeader` band +
   edge-to-edge rows are gone. The page is now a centered `max-w-6xl` workspace-home column:
   brand-rule eyebrow ("Workspace"), `text-xl/2xl` title, summary line, then content. The
   header CTA, refreshing badge, transfers banner, toolbar, and content all share the column.
2. **Workspace summary line**: "N project(s) · N responses · N pending review" — pending in
   `--warning`, "no responses yet" when zero; skeleton line while loading; renders the
   previously-computed-but-unused `totalResponses`/`totalPending` from `useProjects`.
3. **Default view is the card grid** (`use-projects.ts`): `useViewMode("projects:view", "grid")`.
   Persisted user choice still wins; toggle still appears at ≥ 6 projects.
4. **Card rework** (`project-card.tsx`): top brand stripe removed (avatar already carries the
   brand colour — one signal per card); footer is now worded ("12 responses" / "No responses
   yet") + relative date, pinned with ItemCard's structured `footer` slot; widgets count
   dropped; pending chip stays top-right; brand fallback unified to `var(--brand)`.
5. **Ghost "New project" tile** (`NewProjectTile` in `project-card.tsx`): dashed tile as the
   last grid cell when no search/filter is active. Horizontal compact variant on mobile
   (`sm:` switches to the tall column tile); grid equal-rows only from `sm:` so the tile
   doesn't inflate on single-column mobile.
6. **List view** (≥ 6 regime): rows render inside a `rounded-xl border bg-card` panel; the
   doubled `divide-y` + ItemShell `border-b` is fixed (`last:border-b-0` on the row).
7. **Error state**: first-load failure renders icon + "Couldn't load your projects" + "Try
   again" wired to the new `refetch` exposed by `useProjects`. Background-refresh failures
   keep cached data (live-query policy).
8. **RefreshingDataBadge** moved beside the header CTA — visible at every project count, not
   only inside the ≥ 6 toolbar.
9. **Stagger cap** (`projectStaggerDelay`): entrance delay capped at index 6 (~360-420ms max)
   for rows and cards.
10. **Skeletons** rebuilt to mirror the new card (avatar/title/desc/stat-footer) and the
    bounded list panel; summary line gets its own skeleton.
11. **Header CTA hidden in the 0-project state** — `EmptyProjects` owns the single decisive CTA.
12. **Transfers banner** sits inside the column (`mt-6`), gutters owned by the container.

## Re-run of the before-audit NOs

| Question | Before | After | Verdict |
|---|---|---|---|
| Q1 Orientation (1-5 regime) | NO | **YES** — eyebrow/title/summary orient; card + ghost tile name the two actions that matter | flipped |
| Q2 Primary action / reading path | NO | **YES** — eye path: title → summary → card grid → ghost tile. One axis, no void-first impression | flipped |
| Q4 System state | NO | **YES** — error state designed + tested; refreshing badge visible at all counts; loading mirrors final shapes | flipped |
| Q6 Page-level hierarchy | NO | **YES** — centered bounded column gives the page a center of gravity at every viewport (live: 1264px + 390px, light + dark) | flipped |
| Q7 Missing elements | NO | **YES** — workspace totals rendered; card view reachable (default); responses/pending/updated all legible per card | flipped |
| Q9 Trust / first impression sells | NO | **YES** — entrypoint now reads as a composed product surface; live screenshots `after-light-grid.png` / `after-dark-grid.png` | flipped |
| Q10 Harm if unchanged | YES (harm) | Moot — changes landed | resolved |
| Dash-1 Most important state visible | NO | **YES** — pending totals in the summary line (amber) + per-card chip | flipped |
| Dash-3 Density without cold/overwhelm | NO | **YES** — grid + ghost tile fill the canvas honestly; below-grid space now reads as margin, not absence | flipped |
| M8 Uncapped stagger | MINOR | **YES** — capped at 6 steps | flipped |
| M9 Doubled row borders | MINOR | **YES** — single 1px separators inside the panel | flipped |

## Live verification (this session)

- Light + dark, 1264×800 and 390×844: `after-light-grid.png`, `after-dark-grid.png`,
  `after-mobile-final.png`.
- List panel: `after-dark-list.png` (forced via persisted view-mode key).
- ≥ 6 toolbar regime: `check-toolbar-list.png` (temporary threshold tweak, reverted —
  pills/search/toggle compose in the sticky container-width bar).
- Search-empty inside the column: `check-search-empty.png`.
- Error + retry: covered by the new `tests/projects/projects-client.test.tsx` (load failure →
  named failure → Try again → data renders).

## Gates

- `tsc --noEmit` ✓, `eslint . --ext .ts,.tsx` ✓ (zero warnings), Prettier ✓.
- Full Vitest: **27 files / 96 tests pass** (2 new tests in
  `tests/projects/projects-client.test.tsx`; pre-existing `empty-projects` and
  `search-placeholders` untouched and green).
- `pnpm build --filter web_v2` ✓.

## Mechanical Quality Gate (after)

1. Keyboard reachable? YES — card, ghost tile, retry, CTA are Links/Buttons.
2. Focus visible? YES — ghost tile carries explicit `focus-visible:ring-2 ring-ring/40`;
   ItemCard/Button inherit system rings.
3. Contrast? YES — summary at 13px `muted-foreground`; pending segment `--warning` with
   `font-medium`; live-checked in both themes.
4. Targets? YES — ghost tile ≥ 56px on mobile; buttons standard.
5. Status not colour-alone? YES — pending is text ("3 pending review"), not a dot.
6. Narrow viewports? YES — single column, compact horizontal ghost tile, header wraps.
7. Reduced motion? YES — all entrances use `animate-fade-up` which globals.css disables
   under `prefers-reduced-motion`.

## Net result

All 9 structural NOs and both MINORs flipped to YES. No new NOs introduced. No new shared
primitives, no new tokens — composed from ItemCard/ItemShell, Button, Skeleton, Badge,
FilterPills, SearchField, ViewToggle, RefreshingDataBadge, HeaderSep, PageBody.

## Follow-ups

- **Sign-in POST 500**: during the live walkthrough, Clerk's session activation POST to
  `/sign-in?redirect_url=…` returned 500 (client-side session still completed; navigating
  away worked). Auth surface, not this page — needs its own session.
- **PageHeader divergence**: this page now composes its own header (centered column) instead
  of the full-bleed `PageHeader` band. If a second sidebar-less workspace surface appears,
  consider a `max-width` content option on `PageHeader` instead of a third pattern.
- **`/projects` summary vs transfers**: an incoming ownership transfer for a user with zero
  projects renders banner + empty state together — verified by code, worth one live look
  whenever a transfer fixture exists.
