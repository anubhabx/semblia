# Design-system unification + IA rework — decision record

Date: 2026-06-25
Surface: app-wide (web_v2) — navigation IA + shared design-system adoption
Branch: revamp/v2

## Problem (verbatim brief)

> Each page is trying its own implementation of the design system; tabs, headers,
> empty states all look different on each page. One app should follow one single
> design system all the way through... the sidebar and the sitemap need a rework.
> There is too much grouping going on... putting so many of them in one group
> makes this too cumbersome to navigate.

## Ground truth (audited 2026-06-25)

- **Top-level project sidebar is fine**: 6 flat items (Forms, Responses, Widgets,
  Analytics, Developers, Settings). Within the 3–6 recommended range.
- **Two sections explode into mega-buckets, each navigated by an 8-item
  horizontal scroll-tab strip**:
  - Settings: General · Branding · Visibility · Social · Hosts · Trust · Members · Danger
  - Developers: Overview · Keys · Agents · Webhooks · Exports · Integrations · Activity · Docs
- The two strips are **copy-pasted** `SubTabs` blocks in `settings-shell.tsx` and
  `developer-shell.tsx` — drift inside the nav layer itself.
- **The Account area already uses the target pattern**: a vertical section-rail
  driven by a single config (`components/nav/account-nav.ts` +
  `account-sidebar.tsx`). Settings/Developers diverge from it.
- **Shared page primitives exist** (`components/shared`: `PageHeader`, `PageTabs`,
  `PageBody`, `EmptyKindPicker`, `SettingsSection`, ...) but are adopted in only
  ~7 files. Most pages delegate to client components that hand-roll headers.

## Research (2026-06-25)

- **Tabs cap ~6.** Apple HIG: max 6 tabs. Material: ≤4 fixed tabs. Beyond 5–6 you
  overwhelm users. Horizontal **scrolling** tab strips are a named anti-pattern
  when the count is high. (eleken.co/blog-posts/tabs-ux)
- **>6 sections → vertical side-menu** that shows every option at once; vertical
  nav scales for broad/growing IAs. (nngroup.com/articles/vertical-nav)
- **Don't over-group either** — NN/g warns against artificial buckets that hide a
  broad space under one generic label. Keep items visible and scannable.
- **Drift prevention = single source of truth + system-first composition**: one
  canonical primitive set, pages compose them (not lookalikes), audit & deprecate
  one-offs. (uxpin design-system-governance)

## Principles (house rules going forward)

1. **One primitive per concern.** Header → `PageHeader`. In-page tabs →
   `PageTabs`. Route sub-nav → `SectionNav` (new). Empty state → `EmptyKindPicker`.
   No page hand-rolls these.
2. **Section nav with >6 destinations is vertical** (rail on desktop), driven by a
   config array — never a horizontal scroll strip.
3. **No new sub-grouping.** Existing groups (Settings, Developers) stay flat and
   scannable. A divider before destructive actions (Danger) is allowed; section
   subheadings are not.
4. **Compose, don't fork.** A shared primitive falls short → extend the primitive,
   not a per-page copy.

## Decisions

- **D1.** Create `components/shared/section-nav.tsx` — one config-driven route
  sub-nav. Vertical rail on `lg+`, horizontal scroll strip on mobile. Replaces
  both copy-pasted `SubTabs` blocks.
- **D2.** Refactor `SettingsShell` + `DeveloperShell` to: `PageHeader` (title only)
  + two-column body (`SectionNav` rail · content). Public props unchanged so call
  sites don't move.
- **D3.** Extract the two nav models to config files (`settings-nav.ts`,
  `developer-nav.ts`) mirroring `account-nav.ts`.
- **D4.** Keep items flat; only Settings gets a divider before "Danger".

## Phased plan (per-phase commits)

- **P1** — `SectionNav` primitive + settings/developer nav configs + shell refactor. ← IA rework core
- **P2** — Remove stale OpenCode delegation references repo-wide.
- **P3** — Establish `/impeccable` design-context (governance single source of truth).
- **P4+** — Normalize page client components (forms/responses/widgets/...) to compose
  `PageHeader` instead of hand-rolling. Long tail, tracked here.
</content>
</invoke>
