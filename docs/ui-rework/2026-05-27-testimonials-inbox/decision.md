# Decision — `/projects/[slug]/testimonials`

## Rework-gate readout

Rule: any of Q1–5 NO, OR Q9 / Q10 NO, OR 2+ of Q6–8 NO.

| Trigger | Result |
|---|---|
| Q2 — primary action lost in stacked control bands | **NO** (Q1–5) |
| Q6 — per-row pill restates active tab; hover-actions overlap content | NO |
| Q7 — same redundancy; ambiguous "Select" header button | NO |
| Q6 + Q7 = 2 of Q6–8 | **trigger** |

**Gate clears.** Targeted rework, not a redesign.

## In-scope changes

Each item maps to a `before.md` Q-finding and a `principles.md` Pn.

| # | Change | Origin | Where |
|---|---|---|---|
| 1 | Add a header-level **"Review N pending"** button next to the description when `pendingCount > 0`. Click sets `status = 'PENDING'` and focuses the list. Disappears at zero. | Q2 / P2 | `_testimonials-inbox.tsx` PageHeader description slot |
| 2 | Collapse the two control bands into one. Move sort dropdown + search into the same row as the status tabs, OR keep `PageTabs` as the toolbar and demote the filter bar to a thin row that omits the redundant Select button. (Pick the lower-effort variant during execute — see #2a/#2b.) | Q2 / P1 | `_testimonials-inbox.tsx` + `testimonials-filter-bar.tsx` |
| 2a | Drop the standalone `TestimonialsFilterBar` "Select" button. Bulk selection enters via row interaction (hover checkbox or shift-click). | Q7 / P6 | `testimonials-filter-bar.tsx:119-129`, `testimonial-row.tsx` |
| 3 | Gate `StatusPill` rendering inside `TestimonialRow`: render only when `status === 'ALL'`. | Q6 / Q7 / P3 | `testimonial-row.tsx:110` — pass `currentTab` prop down, or read from context |
| 4 | When viewing `APPROVED` or `ALL` and a row is approved, surface a small published/draft glyph in the row meta (`Eye` / `EyeSlash` at `text-muted-foreground`, with `aria-label`). | Q4 / P3 | `testimonial-row.tsx` meta strip |
| 5 | Reserve a stable right-rail gutter (`pr-14` or equivalent) on the row content area so hover-actions don't overlap the preview clamp. | Q6 / P4 | `testimonial-row.tsx:56, 116` |
| 6 | `BulkToolbar` button copy: "Approve N" / "Reject N" interpolating the count. | Q5 / P5 | `bulk-toolbar.tsx:34, 43` |
| 7 | Pagination buttons: drop the forced `size-7` override, let `size="icon-xs"` default apply (which is already AA-correct at the design-system level). If `icon-xs` is also < 28px, leave as is and log a follow-up. | Mech 4 | `testimonials-client.tsx:223, 233` |
| 8 | Replace literal box-shadow alpha string with a token-driven utility (`ring-2 ring-success/15` or similar). | Q8 | `testimonial-empty-state.tsx:110-111` |

## Out-of-scope

- Detail panel redesign (`testimonial-detail.tsx`) — separate audit.
- Empty-state copy — already strong; the eyebrow alpha is the only nit and lives in #8.
- Mobile chevron — keep as-is; alpha contrast measured during after-audit.
- Adding a query-error UI branch — record as follow-up; not visible in normal use.
- Undo toast for bulk reject — record as follow-up; out of scope without a toast primitive review.
- Adding new shared primitives.
- Any token-system changes (palette, density, spacing scale).

## Anti-goals

- Don't redesign the row layout. The avatar / content / meta arrangement is fine — we're trimming, not rebuilding.
- Don't replace `PageTabs` with a different filter affordance (dropdown, segmented control, sidebar). The horizontal tab band is right for this surface.
- Don't add personality. No new motion, no decorative dividers, no copy flourishes.
- Don't introduce new tokens. Reuse `text-warning`, `text-muted-foreground`, `bg-warning/10`, etc.
- Don't widen the detail panel or change the master-detail breakpoint.
- Don't add a toast / snackbar system if one doesn't already exist (it does not, based on the audit). Bulk undo defers.

## Acceptance criteria

For each in-scope item to count as landed:

1. **#1 Review-pending button**: visible when `pendingCount > 0`, hidden at zero; clicking changes `status` to `PENDING`; uses existing `Button` variant + warning tones; keyboard reachable via tab order before the status tabs.
2. **#2 / #2a Control consolidation**: visible bands above the list reduced from 2 (tabs + filter) to 1 in the common case (bulk toolbar may still appear when active). Search + sort remain functional. "Select" button removed.
3. **#3 Row pill gating**: under any non-`ALL` tab, `StatusPill` does not render. Under `ALL`, it renders as before.
4. **#4 Published/draft glyph**: on approved rows, an `Eye` / `EyeSlash` icon appears in the meta strip with `aria-label` and `title`. Same `size-3` scale as other meta icons.
5. **#5 Right gutter**: hover actions never overlap the content preview when the preview is at its 2-line max. Verifiable visually at narrow widths.
6. **#6 Bulk copy**: BulkToolbar buttons read "Approve N" / "Reject N" with `N = bulkSelected.size`.
7. **#7 Pagination**: no regression in keyboard / pointer access; size matches other icon-xs buttons in the app.
8. **#8 Empty-state shadow**: no `var(--color-success)/6%` literal; uses a token utility.
9. **Mechanical**: `pnpm exec tsc --noEmit` and `pnpm exec eslint . --ext .ts,.tsx` clean in `apps/web_v2`. Format pass run.
10. **After-audit (`after.md`)**: every NO from `before.md` either flips to YES or is recorded as a justified deferral with a follow-up entry.

## Follow-ups (recorded, not executed)

- Add `error` branch UI for the testimonials list query.
- Toast primitive + bulk-action undo affordance.
- Contrast measurement pass on `text-muted-foreground/60` eyebrow alpha (applies here and in projects-list rework).
- If `Eye` / `EyeSlash` per-row glyph proves useful, consider a `PublishStateGlyph` primitive (defer until two surfaces actually use it).
