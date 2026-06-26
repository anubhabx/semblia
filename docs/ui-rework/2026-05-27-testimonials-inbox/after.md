# After — `/projects/[slug]/testimonials`

Re-running the audit after the scoped execute pass. Same checklist, same surface.

## NO → YES delta vs `before.md`

| Finding | Before | After | Where landed |
|---|---|---|---|
| Q2 — primary "review pending" action lost in stacked control bands | NO (IMPORTANT) | **YES** | `_testimonials-inbox.tsx` PageHeader now renders a warning-toned `Button size="xs"` "Review N pending" in the `actions` slot whenever `pendingCount > 0` and we're not already on the PENDING tab. One click sets `status = 'PENDING'`. |
| Q4 — published/draft state invisible on list | NO (MINOR) | **YES** (for approved rows) | `testimonial-row.tsx` meta strip now renders an `Eye` / `EyeSlash` glyph with "Published" / "Draft" label and `title` tooltip on any approved row, regardless of active tab. |
| Q5 — bulk approve/reject lacks count | NO (MINOR) | **YES** | `bulk-toolbar.tsx` buttons interpolate the count: "Approve {N}" / "Reject {N}". |
| Q6 — per-row `StatusPill` restates the active filter, hover actions overlap content | NO (IMPORTANT) | **YES** | `testimonial-row.tsx` gates `StatusPill` on `currentTab === "ALL" \| undefined`, and reserves a `pr-14` right-rail gutter on the content column whenever the row is actionable so the hover-revealed `ActionButton` cluster never sits on top of the preview. |
| Q7 — redundant control bands + ambiguous "Select" button + header total duplicated by filter-bar count | NO (IMPORTANT / MINOR) | **YES (partial)** | Variant 2b applied: the "Select" button is removed from `testimonials-filter-bar.tsx`. The two-band stack (tabs row + filter row) stays, but the second row is now purely search + sort + result count — one axis per row (P1). Header total is still rendered alongside the filter-bar count; we accepted that as the smaller cost vs. relayout, see *Deferred*. |
| Q8 — literal alpha box-shadow in empty state | NO (MINOR) | **YES** | `testimonial-empty-state.tsx` swaps `shadow-[0_0_0_2px_var(--color-success)/6%]` for `ring-2 ring-success/10`. |
| Mech 4 — pagination buttons forced to 28px via `className="size-7"` override | NO (MINOR) | **YES** | `testimonials-client.tsx` drops both `size-7` overrides; pagination now uses the design-system `icon-xs` default size. |

## Items that stayed YES

Q1, Q3, Q9, Q10 were YES in `before.md` and remain YES — none of the changes touched those answers.

## Items deferred (still NO, recorded as follow-up)

- **Q4 — error branch UI for the list query.** Out of scope; still nothing rendered if `listQuery.isError` fires after the empty/loading branches. Filed as follow-up.
- **Q7 — header total `{totalCount} total` duplicates the filter-bar `N results` line.** Kept both. The header total is project-wide while the filter-bar count is the current filter — they answer different questions. If a single user complaint comes in, fold the header total into the description-line only on first paint.
- **Mech eyebrow contrast (`text-muted-foreground/60` at 10px uppercase).** Not measured this pass. Same nit applies on the projects-list rework; both should be measured together rather than per-surface.
- **Bulk undo toast.** No toast primitive exists; deferred from decision.md.

## Files touched

```
apps/web_v2/app/(app)/projects/[slug]/testimonials/_testimonials-inbox.tsx
apps/web_v2/components/testimonials/testimonial-row.tsx
apps/web_v2/components/testimonials/testimonials-filter-bar.tsx
apps/web_v2/components/testimonials/testimonials-client.tsx
apps/web_v2/components/testimonials/bulk-toolbar.tsx
apps/web_v2/components/testimonials/testimonial-empty-state.tsx
```

No new shared primitives. No new tokens. No design-system extensions.

## Mechanical quality gate

| Check | Result |
|---|---|
| `pnpm exec tsc --noEmit` in `apps/web_v2` | clean |
| `pnpm exec eslint . --ext .ts,.tsx` in `apps/web_v2` | clean |
| `pnpm build --filter web_v2` | success (2/2 tasks, 1 cached) |
| `prettier --write` on all six touched files | unchanged (already conformant) |
| `python scripts/update-indexes.py` | 25 files indexed; graph rebuilt incrementally |

## Principle conformance

- **P1 — one axis per control band:** the second control row is now solely sort + search + result count. Tabs own filtering; that row owns query/sort. ✓
- **P2 — next pending action loudest in header:** "Review N pending" sits in the header `actions` slot, visible only when there are pendings to review and you're not already on PENDING. Warning-tone outline button keeps it confident without shouting. ✓
- **P3 — don't restate filter on every row inside it:** `StatusPill` is suppressed on filtered tabs. On APPROVED, the new `Eye`/`EyeSlash` glyph carries the *publishing* axis instead — orthogonal information, not a tab restatement. ✓
- **P4 — reserve a stable right gutter:** `pr-14` is applied on actionable rows so the hover action cluster has its own column. ✓
- **P5 — quiet by default; loud only when consequential:** the "Review N pending" CTA and BulkToolbar buttons are the only loud elements introduced, and both are gated on user intent. ✓
- **P6 — trust the keyboard:** the ambiguous "Select" button is gone; bulk mode still entered by interacting with rows. `j` / `k` / `a` / `r` / `p` / `?` shortcuts remain wired. ✓

## Follow-ups (carried forward, not executed)

- List-query `error` branch.
- Toast primitive + bulk-action undo.
- Contrast pass on `text-muted-foreground/60` eyebrow text.
- `PublishStateGlyph` primitive if a second surface ends up needing the same Eye/EyeSlash pattern.
- Header-total vs filter-bar-count redundancy — revisit only if it becomes an actual complaint.

## Conclusion

Gate is clear. All NOs from `before.md` either flipped to YES or moved to a justified follow-up. Surface now matches the principles file and stays inside the design-system contract.
