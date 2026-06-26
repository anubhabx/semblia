# Forms-v4 Studio — After (2026-06-15)

The studio was rebuilt as a self-contained, full-page editor; the forms-core
engine was extended (not replaced). Shipped across 5 commits on `revamp/v2`.

## What changed (mapped to the before-audit P0–P2)

- **[P0] Nested + whole-page scroll + layout shift** → the studio moved to the
  `(standalone)` route group (no app shell). The shell is a fixed
  viewport-height flex column; editor and preview are **independent scroll
  containers** on desktop, each under a fixed header. No device/tab jump.
- **[P0] Conditional-question foot-gun** → enabling a rule now seeds a valid,
  satisfiable default (first option / scale max / "includes" for free text), and
  the value control adapts to the controlling question's type (option picker /
  number / text). The empty-value "never show" trap is gone.
- **[P1] Branding disconnected / empty header** → forms inherit the project logo
  + brand color by default ("Synced with project branding"), with a per-form
  override (the real `FORM_BRANDING_LOGO` uploader) and a reset. A new form's
  brand name seeds from the project, so the header is never empty.
- **[P1] Native selects + jargon** → every select is the shadcn `Select`.
- **[P1] No per-layout knobs; theme too restrictive** → each preset has a
  contextual knob panel (card/inline align+width, inline show-header, split
  side/fill/content/ratio with quote+blurb, conversational progress). The Theme
  tab adds guided-custom color overrides (accent/background/surface/text) with an
  Auto reset and a live AA contrast badge — all AA-clamped by the engine.
- **[P2] Preview lacked canvas intent** → a real canvas: browser-chrome window,
  fit-to-width zoom + manual steps, desktop/mobile, and two modes — the hosted
  page, or the form embedded in a faint project-type mock host page.

## Verification

- `pnpm build --filter web_v2` — **passes** (5/5 tasks).
- `pnpm exec tsc --noEmit` (web_v2) and full-app `eslint` — green.
- forms-core: `vitest` — **170 pass** (incl. new specs for color-override AA
  clamps and per-layout knobs).
- web_v2 `studio-editor` test — 6 pass (branding default-synced, tabs, layout
  switch, conditions).
- The studio route `/projects/[slug]/collect/[formId]` resolves under
  `(standalone)` and is auth-protected (307 → sign-in for anonymous).

## Deferred / follow-ups

- **Split background-image fill** needs a `FORM_PANEL_IMAGE` media purpose
  (api_v2 enum + upload-intent branch) — delegate to Codex; the `image` fill is
  intentionally not exposed until it lands.
- **Conversational welcome screen + custom Next label** would touch the
  CSP-hashed constant runtime; deferred to keep this rework render/CSS-only.
- **Live visual `/polish` pass** on the authenticated studio (screenshots) is the
  recommended next step — not run here because the studio is behind Clerk auth.
