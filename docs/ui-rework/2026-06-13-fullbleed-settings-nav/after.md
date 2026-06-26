# After — 2026-06-13 full-bleed revert + settings/nav/defaults rework

Verified live on dev (web 3002 / api 8100), test user `test+clerk_test@semblia.com`,
project `northwind-studio`. Screenshots: `after-0*.png` in this folder.

## 1. Full-bleed restored app-wide (locked decision)

`contained` was removed entirely from the three layout primitives
(`page-body`, `page-toolbar`, `page-header`) and **every** call site (~30 files,
scripted strip + manual cleanup). The `/projects` workspace-home also dropped its
centered `max-w-6xl` rails (kept the structural rework: grid default, ghost tile,
stat footers, error state; grid now `xl:grid-cols-4` to use the regained width).
Confirmed at 1920px (`after-10`): analytics/title/tabs/KPI cards now fill the full
width and the header/tab borders line up with content — the headline regression is
gone. tsc/eslint/vitest all green after the strip.

**Full-bleed is the chosen layout. Do not reintroduce a `contained`/centered rail
on top-level pages.** (Recorded in `decisions.md`.)

## 2. Profile dropdown expanded (`after-09`)

New shared model `components/nav/account-nav.ts` is the single source of truth for
the account area; the avatar dropdown and the account sidebar both consume it.
Dropdown now lists Profile · Security · Notifications · Billing (with active-state),
an "All projects" link, and Sign out. Fixed the duplicated-email header (name line
only renders when a real name exists). Defaults entry dropped everywhere.

## 3. Settings hierarchy + color picker (`after-01..08`)

- **`SettingsSection` is now a card** (border + `bg-card`, header with title +
  description divided from the body), with a `danger` tone and a `flush` option for
  edge-to-edge divided lists. Lifts hierarchy across every settings + account page
  at once (Clerk-like structure, Vercel-like restraint).
- **New `ColorPicker` primitive** (`components/ui/color-picker.tsx`): swatch trigger
  → popover with a curated 12-swatch preset grid, a `#`-prefixed hex input, a
  "Custom" OS-picker fallback, an EyeDropper button (when supported), and a clear
  control. Replaces the raw `<input type=color>` gray circle. Verified: presets
  apply, hex typing updates the swatch + live preview. Logo preview is
  `object-contain` (never cover-crops a brand mark).
- **`SettingsFooter`** is now a Vercel-style save bar with a left "You have unsaved
  changes" indicator.
- Account pages (`profile`) flattened: email/connected lists are edge-to-edge
  divided rows inside their card; Danger zone uses `tone="danger"` so destructive
  actions are clearly separated by category.

## 4. Account-level defaults removed (answer to open question)

Decision: project defaults are **platform-governed, not user-settable**.
- Web (complete): deleted `/account/defaults` page, the `useAccountDefaults` /
  `useUpdateAccountDefaults` hooks + file, the `fetchAccountDefaults` /
  `updateAccountDefaults` client fns + query key, the DTO imports, and the sidebar
  entry.
- api_v2 (complete at the contract level): deleted `AccountDefaultsController` +
  `AccountDefaultsModule` (the `GET/PATCH /v2/account/defaults` routes are gone),
  stripped the user read/write service methods, and switched project creation to
  `parseAccountDefaults(null)` (canonical system defaults — no `User.defaults` read,
  no default-logo clone). The default *values* are retained as platform constants.

## Deferred (dedicated backend pass — Codex-owned, CLI unavailable this session)

Physical DB/type hygiene, intentionally not blended into this UI session:
- Drop the now-unread `User.defaults` column, the `accountDefaultsLogoAssetId` /
  `accountDefaultsLogoAsset` relation, and the `MediaAssetPurpose.ACCOUNT_DEFAULTS_LOGO`
  enum value (+ migration on the drift-prone local DB).
- Prune the now-internal-only `V2AccountDefaultsDTO` / `V2UpdateAccountDefaultsBody`
  family and `updateAccountDefaultsBodySchema` once the column is gone.

## Known dev-only noise
The Next.js dev-tools + theme floating widget overlaps the bottom-right Save button
in screenshots; it does not ship in production.
