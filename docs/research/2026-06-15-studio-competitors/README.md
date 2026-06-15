# Studio competitor research — Form Studio & Widget Studio

> Date: 2026-06-15 · Author: senior product-design/frontend pass (autonomous session)
> Evidence: `./screens/*.png` (8 full-page captures, public surfaces only)

## Method & honest limitations

The brief asked to operate inside my live, logged-in sessions of Typeform, Tally,
Jotform, Fillout, Feathery, Webflow, Framer, and Airtable. **That was not
possible in this environment** and I did not fake it:

- `agent-browser` (the browser-automation CLI) **is** installed and working.
- It **cannot** attach to the already-running Chrome that holds your logins:
  the profile is exclusively locked by your running Chrome (`--profile Default`
  hangs on the lock — confirmed), and Chrome was not started with a
  remote-debugging port, so `--auto-connect` finds nothing on `9222`.
- Using the live logins would require either killing your running Chrome
  (destructive to your open work — not done unattended) or you relaunching
  Chrome with `--remote-debugging-port`.

So research below is from **public, unauthenticated surfaces** (marketing sites,
template galleries, product pages). The actual *builder* UIs sit behind login and
were **not** directly inspected. Where a claim rests on prior product knowledge
rather than a captured screenshot, it is marked _(general knowledge)_. Nothing
here is invented evidence.

A second, larger reality check shaped this whole pass: **Tresta already has both
studios**, built on a deliberately locked parametric architecture. See
`docs/plans/2026-06-15-studios-reconciliation-and-roadmap.md` for how each lesson
maps onto what exists. The competitor takeaways are therefore framed as *polish
and completion within the locked architecture*, not as a greenfield blueprint.

## Captured evidence

| File | Surface | Depth |
|---|---|---|
| `screens/typeform-home.png` | Typeform marketing home | captured; notes from marketing + _(general knowledge)_ |
| `screens/tally-home.png` | Tally marketing home | **viewed & analyzed** |
| `screens/jotform-templates.png` | Jotform template gallery | **viewed & analyzed** |
| `screens/fillout-templates.png` | Fillout template gallery | **viewed & analyzed** |
| `screens/framer-home.png` | Framer marketing home | captured; _(general knowledge)_ |
| `screens/webflow-home.png` | Webflow marketing home | captured; _(general knowledge)_ |
| `screens/airtable-interfaces.png` | Airtable Interface Designer product page | **viewed & analyzed** |
| `screens/feathery-home.png` | Feathery marketing home | captured; _(general knowledge)_ |

## Per-product takeaways (scoped to what Tresta should borrow)

### Typeform — respondent experience
- One-question-at-a-time, conversational pacing; large type; generous whitespace;
  keyboard-first (`Enter` to advance, letter keys to choose). _(general knowledge)_
- A submission feels like a conversation, not a database form.
- **For Tresta:** this is already the intent of the **conversational layout
  preset** in forms-v4 (`packages/forms-core/src/render`). Borrow the *runtime
  micro-feel* — step transitions, focus management, progress affordance — as a
  `/polish`+`/animate` target, **not** a new builder paradigm.

### Tally — doc-like creation _(viewed)_
- Positioning: "A form builder like no other", "Tally is doing to forms what
  Notion did to docs & sheets". Type-to-build, `/`-command insertion.
- Feature surface visible on the page: **conditional logic, calculator, hidden
  fields, answer piping, partial submissions**, embed/popup/link/subdomain/custom
  domain sharing, integrations, community templates.
- **For Tresta:** the lesson is *speed and keyboardability of the question list*,
  not a freeform canvas (Tresta has locked "no drag-and-drop, ever"). A fast,
  keyboard-driven **question-list editor** with quick add (`/`-style menu),
  inline editing, and answer-piping/conditional reveal is the on-system
  translation. Conditional reveal (`showIf`) already ships in the renderer.

### Jotform — templates & business workflows _(viewed)_
- "20,000+ free templates." Left rail = **deep category taxonomy**; top =
  **search**; body = **card grid** with a live preview thumbnail, title, a colored
  **category tag**, and a single green **"Use Template"** CTA per card.
- **For Tresta:** the strongest concrete gap. Tresta form creation currently
  "posts no config" (continuity). A curated **starter gallery** — preset × theme
  combinations expressed as cards with live preview thumbnails and one-click
  "Use this" — fits the locked preset architecture perfectly (these are *curated
  combinations of existing presets/themes*, not freeform templates). This is a V1
  candidate for both studios.

### Fillout — white-label, sharing, branding _(viewed)_
- Template gallery is **dark, premium, image-led**, with vibrant gradient
  thumbnails — every template looks designed, reinforcing "it's hard to ship
  something ugly." Category sidebar + grid, same shape as Jotform but higher
  visual production value.
- **For Tresta:** matches the forms-v4 thesis ("impossible to ship something
  ugly"). Borrow the **presentation quality of the chooser** (designed
  thumbnails over wireframe placeholders) and the **branding/white-label framing**
  (logo, remove-watermark, custom domain as paid levers — already the tiering
  model in `DESIGN.md §4`).

### Framer — variants, publishing polish, CMS binding _(general knowledge)_
- Component **variants**, polished **publish** flow, CMS-bound content.
- **For Tresta:** "variants" ≈ the **layout presets** + **style presets** already
  in both studios; "CMS binding" ≈ the widget **Content** axis (source/order/count
  bound to live approved responses). The borrow is **publish polish**: a
  confident publish moment, clear published-vs-draft state, shareable result.
  Forms already added Publish + "Unpublished" badge; widgets studio still
  saves to a **local draft store** (gap — see roadmap).

### Webflow — design tokens, components, responsive _(general knowledge)_
- Token-driven styling, responsive breakpoint controls.
- **For Tresta:** the **token discipline is already won** — `@workspace/brand-theme`
  derives a whole coherent, AA-clamped system from a few inputs (stronger
  guarantee than Webflow's free-form tokens). Responsive lesson → the studio
  preview already has desktop/tablet/mobile device frames; keep that honest to
  the real embed render.

### Airtable Interface Designer — data views, moderation, filtering _(viewed)_
- "Reimagine your workflows"; list/detail/record layouts; filtering & sorting;
  "Provide the right info to the right people"; "Turn data into action."
- **For Tresta:** maps to two surfaces — (1) the **Responses moderation inbox**
  (review/approve/reject, filter by status/rating/source) and (2) the **Widget
  Content controls** (source = which responses, order = recent/rating/manual/
  shuffle, min-rating, max-items, handpick). Airtable's lesson is **make the data
  controls feel like a view builder**: filter + sort + pick, with an immediate
  visual result. Widget Studio's Content + Visibility sections are exactly this;
  Airtable validates the direction.

### Feathery — advanced logic, app-like flows _(general knowledge)_
- Multi-step, logic-heavy "data intake" flows (fintech framing).
- **For Tresta:** mostly **out of scope by decision** — Tresta is feedback/
  testimonials, not general app-form tooling, and freeform logic builders were
  retired. The defensible borrow is **multi-step pacing** (already the
  conversational preset) and **server-validated conditional reveal** (already
  shipped), not a logic canvas.

## One-line synthesis

Every theme the brief wanted to import — Typeform's runtime feel, Tally's fast
creation, Jotform/Fillout's template chooser, Framer's publish polish, Webflow's
tokens, Airtable's data views — **Tresta has already chosen an answer for**, and
in the tokens/anti-ugly dimension a *stronger* one (derive-and-clamp vs.
free tokens). The real, fundable gaps are: a **starter/preset gallery at
creation**, **runtime polish** on the form presets, and **finishing the Widget
Studio** (API-backed publish + dead-code cleanup + polish). Details and
priority in the roadmap doc.
