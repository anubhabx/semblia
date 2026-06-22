# Studios + listings rework — 2026-06-22

Goal: bring Forms Studio, Widgets Studio, and both listing pages to finished-product
quality. Clean list + card previews, minimal KPIs, keyboard nav, help, responsive
previews with correct proportions / maintained aspect ratios, no bad overflows.
Verify every visual change in the running app, not via unit tests.

## Before-audit (live app, dark theme, 1440×900)

### Forms listing (`/projects/[slug]/forms`)
- **Row-only. No card view, no ViewToggle, no thumbnail preview.** (widgets has all three) — biggest gap.
- Leading = intent glyph in a tinted square; no visual sense of the form.
- KPI = "Not published yet" / "v{n} published" only. No response count.
- Banned decoration: right-aligned mono-uppercase toolbar caption
  "COLLECT TESTIMONIALS, REVIEWS, AND FEEDBACK." + sidebar-foot "AGENCY PORTFOLIO".

### Widgets listing (`/projects/[slug]/widgets`)
- Has card + list + ViewToggle. Static `WidgetLayoutPreview` mockups read well.
- **Bug: KPI shows "undefined loads"** — `fmtNum(undefined)`; not defensive.
- **Name renders blank** in card + row even though widget name resolves to a placeholder
  ("Untitled embed") in the studio — list/row name mapping is dropping it.
- Verbose KPI string ("undefined loads · — · no loads yet").
- Banned decoration: `‹/› EMBED` ribbon, `GRID` chip (mono-uppercase), toolbar caption
  "EDITS AUTO-DEPLOY. NO RE-EMBED NEEDED.", hover "OPEN" pill.

### Forms studio (`/projects/[slug]/forms/[id]`)
- Left inspector (Content/Fields/Design/Flow) is reasonably clean.
- **Preview = a plain max-w-2xl card floating in a dark void.** Huge wasted horizontal
  space, no device/page frame, no responsive widths. Far less "real" than widget studio.
- "LIVE PREVIEW" mono-uppercase label.
- No device size switching, no help affordance.

### Widgets studio (`/projects/[slug]/widgets/[id]`)
- Strong: faux marketing-page chrome reads as real; visual layout picker.
- **Carousel preview clips the right-most card** against the frame edge (peek looks like overflow).
- Banned decoration: "● LIVE PREVIEW · ⚡ ROTATING", device pills "DESKTOP/TABLET/MOBILE",
  "1280×800" readout, "DESIGN & EMBED" eyebrow under the Widget Studio title.
- Far-left rail is a near-empty icon strip with a single widget.
- No obvious help / keyboard-shortcut affordance.

## Principles for this pass
1. **Parity.** Both listings get list + card with a real preview + ViewToggle. Both studios
   share the same preview-frame language (device-aware, realistic chrome, scaled-to-fit).
2. **KPIs are minimal + truthful.** One or two numbers max, never "undefined". Defensive formatting.
3. **Kill decorative mono-uppercase eyebrows** (ribbons/chips/captions/sidebar-foot/stage labels).
   Keep mono *metrics* (tabular-nums) — that is the house "Quiet Precision" voice.
4. **Frames look real + keep aspect ratio.** Previews scale to fit, never crop the content edge,
   never overflow the stage. Carousel peek is intentional but must not read as a clipped bug.
5. **Help + keyboard.** Each studio exposes a help/shortcut affordance and supports keyboard
   navigation between sections + the preview.
6. Verify each change visually in light AND dark before moving on.
