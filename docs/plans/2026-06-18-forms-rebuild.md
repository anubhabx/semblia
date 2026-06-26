# Semblia Forms — Full Rebuild From Scratch (Phased Plan)

Status: **active**
Owner: orchestrator (Claude)
Source spec: `docs/raw/forms_redesign_specs.md` (Semblia Forms — Feature Product Document)
Branch: `revamp/v2` · one checkpoint commit per phase/subphase.
Created: 2026-06-18

> This plan converts the product spec into an executable, checkpointed rebuild. The forms
> ("collection surface") feature is deleted to the database level and rebuilt end-to-end per the
> spec. This is a **core feature**; quality gates are mandatory at every checkpoint. No shortcuts.

---

## 0. Operating context & load-bearing assumptions

1. **Pre-launch, no production data.** The live backfill (`forms:backfill-v4`) was never run; all forms
   data is local/dev. Therefore the schema is replaced destructively (drop + recreate), **no data
   migration / dual-write / backfill** is required. This is what "delete every instance … down to the
   DB level … full rebuild from scratch" authorizes. Recorded as a decision.
2. **Route + domain conventions.** The spec writes `/api/...` and `forms.semblia.com`. We map to the
   repo's locked conventions: API under **`/v2/...`**; hosted forms at **`forms.semblia.com/f/:slug`**,
   embeds at **`forms.semblia.com/embed/:slug`**, native loader at `forms.semblia.com/loader.js`. The
   previous `*.collect.semblia.com` per-project host model is retired for forms (clean rebuild).
3. **Multiple forms per project.** The spec's `/form/draft` singular is shorthand; real use cases
   (a testimonial form *and* a feedback form in one project) require many forms per project. Routes keep
   `:formId`: `/v2/projects/:slug/forms/:formId/draft`, etc.
4. **Renderer is React, shared everywhere.** The forms-v4 "no-JS, <3 KB script-free shadow embed"
   constraint is **superseded** by this spec: a single React `forms-renderer` powers dashboard preview,
   hosted pages (SSR), iframe embeds, native injection (Shadow DOM mount), and static-preview capture.
5. **Skills-first.** UI phases route through the design skills (`/critique` or `/audit` before,
   `/normalize` `/arrange` `/typeset` during, `/polish` after). Backend security uses
   `/owasp-security-check` + the project security-watch doc.
6. **Verification gate per phase** (the "green bar"), see §8. A phase is not "done" until its gate passes
   and the checkpoint is committed. `python scripts/update-indexes.py` after source changes.

---

## 1. Product principle (from spec §2)

> Users customize **meaning, brand, and behavior**. Semblia controls **structure and quality**.

Users own: intent, content, fields, branding, theme, layout preset, flow behavior, publishing, response
handling. Semblia owns: rendering structure, responsive behavior, spacing/type scale, a11y, validation,
public-safe delivery, submission processing, snapshot consistency, security boundaries.

No drag-and-drop, no custom CSS/JS, no per-field colors, no raw HTML. Token + preset based only.

---

## 2. Target architecture (packages & services)

| Layer | Package/app | Owns | Action |
| --- | --- | --- | --- |
| Contracts/compilers | `packages/forms-core` | Zod schema types, field contracts, intent presets, default templates, validation rules, condition evaluation, **design-token compiler**, **snapshot compiler**, migrations, submission normalization | **rebuild from scratch** |
| Rendering | `packages/forms-renderer` | React rendering from a snapshot: field components, 4 layout presets, theme application, single-page + step flow, progress, thank-you, validation display, responsive, closed-form. SSR + client mount. | **new package** |
| Embed delivery | `packages/forms-embed` | `embed.js` (iframe injector + height postMessage resize) and `loader.js` / `<semblia-form>` (web component → mounts renderer in Shadow DOM) | **rebuild** |
| Public runtime | `apps/forms_runtime` | Hono Lambda: `/f/:slug`, `/embed/:slug`, `/embed.js`, `/loader.js`, snapshot resolution, runtime cache, public submission, upload presign handoff, edge checks/rate-limit, origin checks, security headers, closed-form | **rebuild** |
| API / DB | `apps/api_v2` (`forms`, `responses` modules) | DB, drafts, source schema, settings, publishing, **snapshot creation/versioning**, response storage, moderation, plan enforcement, runtime-safe snapshot contracts | **rebuild + re-point consumers** |
| Dashboard | `apps/web_v2` (Form Studio + Responses) | Studio (Build/Design/Flow/Publish/Responses), live preview via `forms-renderer`, publishing actions, response inbox + moderation, public preview controls | **rebuild** |
| Worker | `apps/api_v2` worker | Static preview generation (render snapshot → screenshot → storage → `previewImageUrl`) | **new job** |

**Preview accuracy rule (spec §27):** dashboard preview, hosted page, embed, injection, and static
preview all render the *same snapshot shape* with the *same renderer*. The renderer never cares about the
snapshot's origin.

---

## 3. Canonical data model (replaces the collection models)

Drop (Phase 1 migration): `CollectionForm`, `CollectionFormSubmission`,
`CollectionFormSubmissionAnnotation`, `SubmissionPrivateMetadata`, `SubmissionModerationRun`,
`FormImpression`; the `FORM` value usage of `StudioDraft` (model stays for widgets). Keep
`PublicSubmitTrustMode`; retire `ModerationStatus` (replaced by review/publish status enums).

Add (Phase 2):

- **`Form`** — editable draft source. `id, projectId, intent (FormIntent), name, slug?, status
  (FormStatus), description, draft (Json = FormDefinitionDoc), currentVersion Int?, publishedVersionId?,
  open Boolean, settings…, timestamps`. Unique `[projectId, slug]`. Relations: `versions`, `responses`,
  `mediaAssets`.
- **`FormVersion`** — immutable published snapshot. `id (snapshotId), formId, projectId, slug, version
  Int, schemaVersion, rendererVersion, coreVersion, status, snapshot (Json = PublicSnapshot), checksum,
  previewImageUrl?, publishedAt`. Unique `[formId, version]`.
- **`FormResponse`** — canonical feedback record (replaces `CollectionFormSubmission`).
  `id, projectId, formId, versionId (FormVersion), version Int, answers (Json = stored answer[]),
  ratingValue?, ratingScale?, authorName?, authorRole?, authorCompany?, authorAvatarAssetId?` (denormed
  display fields for widgets/listing), `consent (Json), reviewStatus (FormResponseReviewStatus),
  publishStatus (FormResponsePublishStatus), trustMode, trustedOriginId?, signingSecretId?,
  idempotencyKey?, payloadHash?, sourceMetadata (Json), moderation summary fields, timestamps`.
- **`FormResponsePrivateMetadata`** (replaces `SubmissionPrivateMetadata`): encrypted/hashed
  email/ip/ua, retentionUntil, consentSnapshot.
- **`FormResponseAnnotation`** (replaces `CollectionFormSubmissionAnnotation`).
- **`FormModerationRun`** (replaces `SubmissionModerationRun`, FK → `FormResponse`).
- **`FormView`** (replaces `FormImpression`): analytics impression event.

Enums: `FormIntent {TESTIMONIAL, REVIEW, PRODUCT_FEEDBACK, CUSTOMER_STORY, CUSTOM}`,
`FormStatus {DRAFT, PUBLISHED, CLOSED, ARCHIVED}`,
`FormResponseReviewStatus {PENDING, APPROVED, REJECTED, SPAM, ARCHIVED}`,
`FormResponsePublishStatus {PRIVATE, PUBLISHABLE, PUBLISHED, UNPUBLISHED}`.

**Answer shape** (spec §8): `{ fieldId, type, labelSnapshot, value, private, publishable, usedInWidget }`.
**Consent shape** (spec §9): `{ canPublishText, canPublishName, canPublishCompany, canPublishRole,
canPublishAvatar, canEditForClarity }`. A response is publicly displayable only if required consent holds.
**Snapshot shape**: spec §14.3 (`fields, screens, flow, design{themeId,tokens,layout}, settings, assets,
security, checksum, publishedAt`). Runtime snapshot must be public-safe (spec §26 exclusions).

---

## 4. Consumer re-point map (the risky part)

These read the old collection records and must move to `FormResponse`/`FormView` (restored in Phase 6
after Phase 1 temporarily darkens them):

| Module | Current use | Target |
| --- | --- | --- |
| `widgets.service.ts` (`collectionFormSubmission.findMany`) | pick approved testimonials to display | read `FormResponse` where `reviewStatus=APPROVED` and publishable/published + consent satisfied |
| `analytics.service.ts` (submission + `formImpression`) | KPIs, daily, content rows, impression create | `FormResponse` + `FormView` |
| `exports.service.ts` | CSV of submissions | `FormResponse` (display-safe projection) |
| `billing.service.ts` | submission count vs plan | `FormResponse` count |
| `projects.service.ts` | per-project submission counts + default form on create | `FormResponse` counts; default `Form` seed (intent CUSTOM) |
| `submission-moderation.service.ts` | moderation runs | `FormModerationRun` + `FormResponse` |
| `storage/media.service.ts` | media links to form/submission | `Form` / `FormResponse` relations |

---

## 5. API surface (target, `/v2`)

Authenticated (project-scoped, capability-guarded):
```
GET    /v2/projects/:slug/forms                       list
POST   /v2/projects/:slug/forms                       create (intent → template seed)
GET    /v2/projects/:slug/forms/:formId               get
DELETE /v2/projects/:slug/forms/:formId               delete
GET    /v2/projects/:slug/forms/:formId/draft         get draft
PATCH  /v2/projects/:slug/forms/:formId/draft         save draft (optimistic version)
POST   /v2/projects/:slug/forms/:formId/publish       compile + store immutable snapshot, bump pointer
GET    /v2/projects/:slug/forms/:formId/versions      version history
GET    /v2/projects/:slug/forms/:formId/versions/:n   single version snapshot
```
Response management:
```
GET    /v2/projects/:slug/responses
GET    /v2/projects/:slug/responses/:id
PATCH  /v2/projects/:slug/responses/:id/status        (approve/reject/spam/archive)
PATCH  /v2/projects/:slug/responses/:id/publish       (publish/unpublish — consent-gated)
DELETE /v2/projects/:slug/responses/:id
POST   /v2/projects/:slug/responses/:id/annotations   reviewer notes (kept from current)
```
Runtime (signed, called by `forms_runtime`):
```
GET    /v2/runtime/forms/:slug/snapshot               current published snapshot (public-safe)
GET    /v2/runtime/snapshots/:snapshotId              snapshot by id (immutable)
POST   /v2/runtime/forms/:slug/submissions            validate vs snapshot → store FormResponse
POST   /v2/runtime/forms/:slug/uploads/presign        presign scoped to submit principal
```

---

## 6. Phases (each = one checkpoint commit + tests + green gate)

### Phase 0 — Plan & continuity  ✅ (this doc)
- This plan + continuity updates (decisions/progress/open-questions). Commit `docs(forms-rebuild): …`.

### Phase 1 — Demolition (clean slate to DB level)
- Delete: `packages/forms-core/src/*` internals, `packages/forms-embed/src/*`, `apps/forms_runtime/src/*`,
  `api_v2/modules/forms/*`, `api_v2/modules/responses/*`, `web_v2` collect + responses surfaces, forms/
  response sections of `packages/types/src/v2.ts`.
- DB migration dropping the collection models (§3 drop list).
- Neutralize consumers (widgets/exports/analytics/billing/projects/storage/moderation) so the tree
  compiles with the feature **absent** (submission-derived data temporarily returns empty; default-form
  seed removed). Track each darkened capability for restoration in Phase 6/later.
- Remove module registrations (`app.module.ts`), nav entries/routes that 404, dead query keys/hooks.
- **Gate:** prisma validate+generate; all workspace typecheck + lint + test (adjusted) + builds green.
- Commit `refactor(forms)!: demolish legacy collection surface to clean slate`.

### Phase 2 — DB foundation (new schema)
- Add §3 models/enums + indexes (preserve consumer-relevant query columns: rating, author, createdAt,
  reviewStatus). Migration. `@workspace/database` generate/validate/build.
- **Gate:** prisma validate+generate+build; types build.
- Commit `feat(db): forms rebuild schema — Form/Version/Response/Moderation/View`.

### Phase 3 — `forms-core` rebuild
- Zod schema types; 13 field contracts + per-field settings; 5 intents (default fields/copy/layout/flow/
  moderation/consent); default templates; validation rules; condition evaluation (8 operators); design-
  token compiler (tokens → CompiledDesignTokens w/ AA clamp); snapshot compiler (draft → PublicSnapshot,
  checksum); submission normalization; doc migrations scaffold; public-safe stripping.
- Heavy unit tests (intents, validation, conditions, token compile w/ contrast, snapshot determinism +
  public-safety, normalization).
- **Gate:** forms-core typecheck + test + build; types build.
- Commit `feat(forms-core): schema, intents, compilers, validation, conditions`.

### Phase 4 — `forms-renderer` (new React package)
- Field components (all 13), 4 layout presets (Centered Card, Full Page Classic, Split Hero, One-Question),
  theme application from compiled tokens, single-page + step flows, progress, auto-advance, thank-you,
  client validation display, responsive, closed-form. SSR (`renderToString`) + client mount entry.
- Tests: render each preset/flow from fixture snapshots; a11y smoke; conditional reveal.
- **Gate:** forms-renderer typecheck + test + build.
- Commit `feat(forms-renderer): shared snapshot renderer (presets, flows, fields)`.

### Phase 5 — api_v2 forms domain (drafts, publish, snapshots, versions)
- Forms module: list/create(intent seed)/get/delete; draft get/save (optimistic `expectedVersion`);
  publish → compile snapshot via forms-core, store immutable `FormVersion`, bump pointer, invalidate slug
  cache; versions list/get; runtime snapshot endpoints (public-safe); slug/open-closed/embed-origins;
  plan enforcement. DTOs in `@workspace/types`.
- Tests: publish determinism + version bump + public-safety; optimistic concurrency; plan limits; runtime
  snapshot excludes private fields.
- **Gate:** api_v2 typecheck + lint + targeted test + build.
- Commit `feat(api): forms drafts, publish, immutable snapshots, versions`.

### Phase 6 — api_v2 responses + submissions + moderation + consumer re-point
- Public submission: validate vs snapshot, normalize answers, consent capture, spam rules, store
  `FormResponse` + private metadata + source metadata; idempotency + throttle reuse. Response mgmt
  (list/get/status/publish[consent-gated]/delete/annotations). Re-point moderation to `FormModerationRun`.
- **Restore** widgets/exports/analytics/billing/projects consumers onto `FormResponse`/`FormView`.
- Tests: submit→store→list; review/publish lifecycle (review vs publish separation); consent gate;
  widget pick reads only consented/published; analytics + export projections.
- **Gate:** api_v2 typecheck + lint + full test + build.
- Commit `feat(api): form responses, moderation, and consumer re-point`.

### Phase 7 — `forms_runtime` rebuild
- Hono routes `/f/:slug`, `/embed/:slug`, `/embed.js`, `/loader.js`; snapshot fetch (signed) + runtime
  cache; SSR via forms-renderer; public submission surface → API; upload presign handoff; edge rate-limit;
  origin checks for embeds; security headers/CSP; closed/unavailable form handling; mock mode for local.
- Tests: resolution, closed-form, submit proxy, presign, origin enforcement, header assertions. CDK update.
- **Gate:** forms_runtime typecheck + lint + test + build + cdk synth.
- Commit `feat(forms-runtime): hosted pages, embeds, injection, submit/upload`.

### Phase 8 — `forms-embed` rebuild
- `embed.js` (iframe injector, height postMessage). `loader.js` + `<semblia-form>` web component (fetch
  snapshot, mount renderer in Shadow DOM, isolated styles, lifecycle/height). Size budget enforced in CI.
- Tests: loader injects iframe; component mounts + isolates; resize.
- **Gate:** forms-embed typecheck + test + build.
- Commit `feat(forms-embed): iframe loader + native injection web component`.

### Phase 9 — web_v2 Form Studio + Responses  (subphased; design-skill routed)
- **9a Build + list/create:** forms list, intent-led create, Build area (intent/title/desc/intro/fields/
  order/settings/required/consent/submit/thank-you).
- **9b Design + Flow + live preview:** Design tokens area; Flow area (single/step, progress, auto-advance,
  conditionals, consent placement, redirect, closed); live preview via forms-renderer (preview snapshot
  compiled with forms-core).
- **9c Publish + Responses:** Publish area (link/slug/open-closed/preview/embed/origins/attribution);
  Responses inbox (filter/approve/reject/archive/spam/publish/unpublish/public-preview/copy-quote/consent/
  source).
- Tests per subphase; `/critique`+`/audit` before, `/polish` after each subphase.
- **Gate (each):** web_v2 tsc --noEmit + eslint + vitest + `pnpm build --filter web_v2`.
- Commits `feat(web): form studio — build`, `… design+flow+preview`, `… publish+responses`.

### Phase 10 — Static preview generation (worker)
- Worker job: snapshot → headless render (forms-renderer) → screenshot → storage upload → store
  `previewImageUrl`. Wire dashboard thumbnails + OG/share previews.
- Tests: job enqueues on publish; idempotent; stores url.
- **Gate:** api_v2 typecheck + worker smoke + test.
- Commit `feat(worker): static form preview generation`.

### Phase 11 — Analytics, source metadata, spam/abuse, uploads (end-to-end)
- Form view events + submission impressions + UTM/source/external-id capture; honeypot, min-time,
  rate-limit, duplicate detection, blocked words/domains, suspicious scoring, captcha modes; upload
  presign + type/size/count validation + scanning status; public/consent-dependent display of uploads.
- Tests across spam vectors + upload validation.
- **Gate:** api_v2 + forms_runtime full test + builds.
- Commit `feat(forms): analytics, spam/abuse protection, upload handling`.

### Phase 12 — Verification, security, hardening, indexes
- Full workspace build/typecheck/lint/test; `/owasp-security-check` + snapshot public-safety audit + CSP;
  reduced-motion/a11y pass; index refresh (`update-indexes.py`) + `rebuild-graphify.py`.
- Continuity close-out (progress/decisions/open-questions); success-criteria checklist (spec §30).
- Commit `chore(forms): verification, security hardening, docs`.

---

## 7. Reference study (spec §"References")

The spec already synthesized takeaways (Senja/Testimonial.to → purpose-built testimonial collection +
inbox + proof; Typeform → guided one-question flow; Tally → lightweight doc-like editing; Paperform →
branded hosted page; Fillout → controlled conditionals; Canny → response triage; Jotform → ease w/o bloat).
Do a focused Chrome reference pass **before Phase 4 (renderer)** and **before Phase 9 (studio)** to ground
respondent UX and editor ergonomics. Capture notes under `docs/research/2026-06-18-forms-references/`.

## 8. Per-phase verification gate (the green bar)

- `@workspace/database`: `prisma validate` + `generate` + `build` when schema changes.
- `@workspace/types`, `forms-core`, `forms-renderer`, `forms-embed`: `typecheck` + `test` + `build`.
- `api_v2`: `typecheck` + `lint` + `test` (targeted per phase, full at 6/11/12) + `build`.
- `web_v2`: `cd apps/web_v2 && pnpm exec tsc --noEmit` + `pnpm exec eslint . --ext .ts,.tsx` + `vitest` +
  `pnpm build --filter web_v2` (use direct `pnpm.cmd build --filter web_v2` on the Windows/corepack path).
- `forms_runtime`: `typecheck` + `lint` + `test` + `build` + `cdk synth`.
- After source edits: `python scripts/update-indexes.py`; graphify rebuild at phase 12 (and as useful).
- Never close a phase with a failing gate. `pnpm build --filter web_v2` must pass before any session end.

## 9. Risk register

- **Consumer re-point (widgets/exports/analytics/billing/projects):** darkened in P1, restored in P6;
  keep a checklist so none is forgotten. Highest regression risk.
- **Snapshot public-safety:** runtime payloads must never leak owner/billing/private/internal data
  (spec §26). Dedicated test + P12 audit.
- **Consent gating:** publish must be impossible without required consent (spec §9, §21). Test.
- **Optimistic concurrency** on draft saves (stale write must fail clearly).
- **Windows/corepack build path:** prefer direct `pnpm.cmd build --filter <app>`; `pnpm build --filter
  api_v2` can hit the nested-pnpm mismatch.
