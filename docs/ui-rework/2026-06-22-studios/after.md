# Studios + listings rework — after-audit (2026-06-22)

All four surfaces verified live (light + dark, desktop + narrow widths). Build,
typecheck, and lint all green (`pnpm build --filter web_v2` → 6/6 successful).

## What shipped

### Widgets listing
- **Root-cause data fix:** `fetchWidgets` was typed `V2WidgetListEntry[]` but the
  API returns `V2WidgetDTO[]` ( `{ entry, config }` ). The list + studio-rail call
  sites passed the whole DTO to `dtoToWidgetListEntry`, so name/layout/theme/
  isActive/metrics all fell back to defaults → blank names, wrong "Grid/System/
  Paused" previews, and "undefined loads". Fixed the type + both call sites
  (`dto.entry`). Names, all five layouts, themes, status, and loads now render true.
- Card: removed the mono-uppercase `EMBED`/`WALL OF LOVE` ribbon + layout chip;
  preview pane now reads clean. Footer = name + Paused chip · kind·layout·theme
  meta · single **loads** KPI ("No loads yet" when zero). De-mono'd the hover pill.
- Row: KPI trimmed to a single loads metric.
- Removed the decorative mono-uppercase toolbar caption.

### Forms listing (new)
- Added a **card/grid view + ViewToggle** (was row-only). New `FormCardPreview`
  renders a clean, intent-themed mini-form (testimonial stars, review stars,
  feedback category chips, customer-story lines, custom inputs) so each card reads
  as a small real form. KPI is minimal + honest (publish version + "updated …";
  the summary DTO carries no response count, so none is fabricated).
- Extracted a shared `FormStatusBadge` used by both row + card.
- Removed the decorative mono-uppercase toolbar caption.

### Forms studio
- Replaced the card-in-a-void preview with a **real, responsive frame**: a faux
  browser window at the hosted URL on desktop and a phone frame on mobile, both
  scrolling internally — reusing the shared `BrowserChrome` (moved to
  `components/studio/`). Device + Light/Dark toggles. No more dark void, no
  "LIVE PREVIEW" mono label.
- Added `StudioHelp` (⌘S, ←→ section switch, autosave tip) and roving-tabindex +
  arrow-key navigation on the inspector tablist.

### Widgets studio
- Cleaned the stage chrome: "Live preview / Rotating" sentence-case, device pills
  de-mono'd, dimension readout softened, stage tip de-mono'd, `StudioMark` caption
  ("Design & embed") softened from mono-caps.
- Added `StudioHelp` + roving-tabindex/arrow-key section nav.
- Verified Desktop/Tablet/Mobile device frames scale with maintained aspect ratio.

## Shared / DRY
- New: `components/studio/studio-help.tsx`, `components/studio/browser-chrome.tsx`
  (relocated), `components/forms/form-status-badge.tsx`,
  `components/forms/form-card.tsx`, `components/forms/form-card-preview.tsx`.

## Not changed (deliberate)
- Carousel preview peek/scrollbar is the true widgets-core render (real WYSIWYG) —
  left as-is rather than diverging the preview from the embed.
- `HostPageChrome`'s faux-marketing-page uppercase nav/footer is intentional
  "generic host site" styling, not Semblia's own surface.
- Real response counts for forms need an API/DB change (out of scope for this
  visual pass; would be delegated per the orchestrator rule).
