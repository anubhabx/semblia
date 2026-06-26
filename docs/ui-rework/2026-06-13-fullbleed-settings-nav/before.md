# Before — 2026-06-13 full-bleed revert + settings/nav/defaults rework

Live walkthrough on dev (web 3002 / api 8100), test user `test+clerk_test@semblia.com`,
project `northwind-studio`. Screenshots: `baseline-0*.png` in this folder.

## 1. Contained-layout regression (the headline problem)

Commit `4401c2dd` applied a centered `max-w-6xl` (1152px) rail (`contained` prop on
PageHeader / PageBody / PageToolbar) across the app. **The band borders stayed
full-bleed.** At 1440px the 32px offset is subtle; at **1920px it's glaring** — the
header/tab borders run edge-to-edge while the title, tabs, KPI cards, and charts are
squeezed into a centered 1152 column, leaving ~270px dead gaps on each side with the
border lines extending past the content (baseline-06, baseline-07).

User decision (locked this session): **full-bleed is the chosen layout app-wide.**
Remove `contained` everywhere — primitives + every call site. Keep the structural
improvements from the /projects rework, just drop the centered rail.

## 2. Profile dropdown is sparse (baseline-02)

Account menu lists only **Profile, Billing, Sign out**. Missing Security &
Notifications (both exist in the account sidebar). Header also shows the email on
*both* lines (name line should be the user's display name).

## 3. Settings → Branding is the weakest surface (baseline-04)

- **Bad color pickers**: native OS `<input type=color>` rendered as a gray circle,
  plus a swatch that doesn't even reflect `#FF6B35`, plus a bare hex input. Ugly,
  off-system, default-browser look.
- **Flat hierarchy**: section labels are plain bold text ("Logo" → "Project logo"
  redundant nesting), no card grouping / description / divided structure.
- **Orphaned "Live preview" card** floats mid-right, disconnected from the logo block.

## 4. Account pages — section separation + save placement (baseline-03)

- Sticky "Discard / Save changes" footer collides with the sidebar "Back to projects"
  link and is clipped at the corner. Placement/affordance needs rethinking.
- Identity first/last name render empty even though onboarding set them.
- Sections (Identity / Email / Connected / Danger) aren't clearly grouped by
  category vs destructive action.

## 5. Account-level Defaults page (baseline-08) → REMOVE e2e

`/account/defaults` lets the user set brand/form/moderation/visibility defaults that
get cloned into every new project. Decision: **defaults are governed by Semblia, not
the user.** Remove the page, the account-sidebar entry, the dropdown/nav references,
the edit hooks, and stop project-create from consuming `User.defaults`.

## Reference study
Vercel (simplicity: generous full-bleed, quiet borders, card-per-section settings with
title+description+footer-action) + Clerk (structure: account area with grouped sections,
real custom controls, clear destructive separation). Personalize for Semblia's
"Quiet Precision" token system — not a copy.
