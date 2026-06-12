# `/projects` — Revision 2 (same day, user-driven correction)

Date: 2026-06-12, late session. Trigger: direct user feedback on the structural rework
committed as `760edbdf`.

## User verdict on revision 1

> "This looks a bit off the mark on the current UI system. Most notably, the streaks, and
> AI-sloppish streak with a uppercase header, is not to my likings. I do think that
> constraints are more needed rather than a full bleed, since UX may break on larger
> screens, but the execution is poor."

Decoded:

1. **Streak + mono uppercase eyebrow = AI slop.** The `h-px w-5 bg-brand` rule plus
   `font-mono text-[10px] uppercase tracking-[0.18em]` label is a 2024–25 AI-generated-UI
   fingerprint. It appeared **three times** on this one surface: page header
   ("WORKSPACE"), `EmptyProjects` ("FIRST PROJECT · 0 OF 1"), `EmptySearch` ("NO
   MATCHES"). It also violates house principle #3 ("earn trust through restraint — no
   decorative flourishes") and the eyebrow word "Workspace" carried zero information.
2. **The constrained rail is correct; the execution was not.** Revision 1 invented a
   page-local header instead of evolving the canonical `PageHeader`, used an off-system
   type scale (`text-2xl` vs the system `text-xl`), and the sticky toolbar strip's
   `border-y` terminated at the column edge — a floating band mid-viewport on wide
   screens.

## Revision 2 changes

| # | Change | Files |
|---|--------|-------|
| 1 | `PageHeader` gains a `contained` prop: header + toolbar content constrained to the centered `max-w-6xl` rail while the band (border-b, backdrop) stays full-bleed. Reuse > extend > create. | `components/shared/page-header.tsx` |
| 2 | `/projects` returns to the canonical `PageHeader` (`contained`): summary line as `description` (with loading shimmer span — a div-based `Skeleton` is invalid inside the `<p>`), badge + CTA as `actions`, earned toolbar (≥ 6) in the `toolbar` slot. Page-local header and the floating sticky strip deleted. No eyebrow. | `components/projects/projects-client.tsx` |
| 3 | Body rails restructured to gutters-outside / rail-inside (`px-4 sm:px-6` wrapper around `mx-auto max-w-6xl`) so body content aligns to the same rail as the contained header — the single-div `max-w-6xl px-4` form was off by the padding width. | `components/projects/projects-client.tsx` |
| 4 | Streak/mono eyebrows removed from `EmptyProjects` and `EmptySearch`. Headline/title now leads each block. | `components/projects/project-empty-states.tsx` |

Kept from revision 1: centered rail concept, summary line data, grid default + ghost
tile, earned toolbar threshold, error/skeleton states, card design.

## Process correction (now codified in CLAUDE.md)

Revision 1 was designed freehand. Revision 2 ran through the repo's design skills:
`/critique` (before-audit, anti-pattern detection) → `/normalize` (system realignment
via shared primitives) → `/polish` (caught the 24px rail misalignment in #3 before it
shipped). UI work on this repo must always route through the relevant skills.

## Follow-ups (out of scope here)

- The same streak motif still exists in `components/responses/response-empty-state.tsx`
  and `app/(standalone)/welcome/_step-frame.tsx` — sweep on their next surface session.
- Mono micro-labels used as *data* (key IDs, counts) are fine and stay; only the
  decorative-eyebrow usage is banned.

## Gates

`tsc --noEmit` clean, `eslint --max-warnings 0` clean, Vitest 27 files / 96 tests green,
`pnpm build --filter web_v2` pass, indexes + graphify rebuilt. Live after-shot at
1440×900 against the dev server.
