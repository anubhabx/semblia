# Web V2 API And Shared Types Gap Inventory

Date: 2026-05-08
Branch: `revamp/v2`
Current implementation anchor: `09fa77a feat(api_v2): add feedback integrity APIs`

Status: Current UI/API/types wiring inventory after V1 Task 3. This is not a replacement for the continuity ledger; use `docs/continuity/progress.md` for live phase status.

## Purpose

This document reconciles three surfaces:

- `apps/web_v2`: what the UI currently renders or simulates.
- `apps/api_v2`: the API surface implemented so far behind the `/v2` global prefix.
- `packages/types/src/v2.ts`: the shared DTOs currently available for UI wiring.

The guiding rule is still locked: backend and database contracts are canonical, and `web_v2` adapts to them. Current UI mocks should not pull the API back toward stale mock shapes.

## Executive Snapshot

`api_v2` now has real project, organization, user, testimonial, submission, form, widget, API-key, agent-access, public submit, public widget/wall, and inbound webhook surfaces. V1 Task 3 added the feedback integrity layer: immutable source submissions, workflow annotations/moderation, display suggestions, user-only display approval, and project action audit writes.

`web_v2` is still mostly mock-first. The main simulated client is `apps/web_v2/lib/api.ts`; most app routes and components still import `apps/web_v2/lib/mock-data.ts` directly or indirectly. `apps/web_v2/lib/api-client.ts` is a real fetch helper, but it is only used by `useCurrentUser()` today, and that hook currently calls `/v2/users/me` while `api_v2` exposes `/v2/me`.

`packages/types/src/v2.ts` has useful shared DTOs for core entities, feedback integrity, API keys, agent access, notifications, and subscriptions, but `web_v2` does not currently depend on or import `@workspace/types`. The shared DTO file also does not yet model the global success envelope, studio drafts, public DTOs, several request bodies, project access projection, or project member/trust-management responses.

## Current Web Client Reality

| Area | Current UI state | Gap |
|---|---|---|
| API client | `apps/web_v2/lib/api.ts` simulates latency and mutates mock data. `apps/web_v2/lib/api-client.ts` performs real fetches. | Consolidate around a real typed client that unwraps the `api_v2` success envelope and accepts Clerk tokens. |
| Shared types | UI local types are mostly `Mock*` types from `mock-data.ts` plus local studio/analytics types. | Add `@workspace/types` to `web_v2` and replace UI-facing API DTO aliases with `V2*` types where contracts exist. |
| Response shape | `api_v2` wraps most responses as `{ success, data, meta }`; paginated objects are inside `data`. | Add a shared `V2ApiEnvelope<T>` and `V2ApiMeta` type, then make the UI client return unwrapped `data` or explicitly expose envelopes. |
| Authenticated user | `useCurrentUser()` calls `apiRequest<ApiUser>("/users/me", token)`. | Backend route is `GET /v2/me`; the hook must call `/me` and unwrap the response. A shared user DTO is missing. |
| Project routing | Server components often load projects with `getProjectBySlug()` from mock data. | Project layout, switcher, pages, and breadcrumbs need real `/v2/projects` and `/v2/projects/:slug` calls or a server/client data boundary. |
| Capability gating | UI derives behavior from mock roles/state. | Backend has `CapabilityGuard`, but project responses still do not expose the locked `access` block for UI gating. |
| Dates | Mock types use `Date` instances; API responses serialize dates as strings. | UI components need date parsing/formatting boundaries rather than assuming `Date` objects. |

## Implemented API Surface Vs UI Gaps

All route paths below include the global `/v2` prefix unless marked `GET /health`.

| Surface | Implemented API | Shared types | Current UI gap |
|---|---|---|---|
| Health | `GET /health` | None needed. | No product UI gap. |
| Current user | `GET /me`, `PATCH /me`, `POST /me/onboarding/complete` | Missing a shared `V2UserDTO`; only `V2UserPlan` exists. | `useCurrentUser()` calls the wrong path and does not unwrap the response envelope. Profile/account pages are not fully reconciled with API fields. |
| Organization | `GET /organizations/current` | `V2OrganizationDTO`, `V2CurrentOrganizationDTO`. | UI does not yet use active Clerk organization/project organization state to scope project lists or copy. |
| Projects | `GET /projects`, `POST /projects`, `GET/PATCH/DELETE /projects/:slug`, member routes, allowed-origin routes, signing-secret routes. | `V2ProjectDTO` exists but is not exact: backend returns `formConfig`; type includes `_count.forms` while backend response currently does not. Missing project member, allowed-origin, signing-secret, request DTOs, and access projection. | Project list/detail/settings still use mock data or mock update calls. UI needs slug-based real calls, response envelope handling, capability gating, trusted-origin management, and signing-secret UX. |
| Testimonials | Private list/detail, approve, reject, publish; public create/list; V1 Task 3 display suggestion create/approve/reject. | `V2TestimonialDTO`, `V2TestimonialDisplayRevisionDTO`, `V2ModerationStatus`. Missing public testimonial DTO and request DTOs. | Inbox/detail uses mock testimonial rows and optimistic mock actions. UI has no display suggestion workflow and no display revision decision UI. |
| Submissions | V1 Task 3: list/detail, create annotation, moderate submission. | `V2SubmissionDTO`, `V2SubmissionAnnotationDTO`. | No submission inbox/detail UI exists. Existing testimonial moderation UI does not expose canonical submissions, annotations, labels, sentiment, submission moderation reason, or source immutability boundaries. |
| Project action audit | V1 Task 3 writes audit rows for annotation, moderation, display suggestion decisions, publish, and unpublish. | `V2ProjectActionAuditDTO`. | There is no read endpoint or UI feed for project action audit rows yet. `agent-access/actions` currently exposes agent key usage events, not the new project action audit stream. |
| Forms | Private form list/create/detail/update/delete; form draft get/put; public form list and public form submit. | `V2CollectionFormDTO`, `V2FormConfigEntry`. Missing `V2StudioDraftDTO`, public form DTO, public submit response/body DTOs, and typed form config/mapping DTOs. | Collect pages and form studio use mock project lookup plus local studio stores. Need real form CRUD, server drafts, `expectedVersion` conflict handling, and explicit `testimonialMapping` support. |
| Widgets | Private widget list/create/detail/update/delete; widget draft get/put; public embed by widget ID; public wall by wall slug. | `V2WidgetDTO`, `V2WidgetListEntry`, `V2WidgetConfig`, widget config subtypes. Missing studio draft DTOs, public widget/wall DTOs, and request DTOs. | Widget pages/studio use mock project lookup, local widget store, and fallback testimonials. Need real widget CRUD, drafts, metrics, public URLs, and conflict handling. |
| Private API keys | `GET/POST /projects/:slug/api-keys`, rotate, revoke, events. One-time secret on create/rotate. | `V2ApiKeyDTO`, `V2CreatedApiKeyDTO`, `V2ApiKeyEventDTO`, `V2ApiKeyScope`, `V2ApiKeyStatus`, `V2ApiKeyType`. | Existing API-key UI is mock-backed and still models `publishable` vs `secret`, allowed origins/IPs, and local key events. Real private keys are scoped `SECRET` credentials; browser trust and signing secrets are separate project surfaces. |
| Agent access | `GET /projects/:slug/agent-access`, create key, revoke key, actions. Presets: `READ_ONLY`, `CONTENT_MANAGER`, `AUTOMATION_MANAGER`, `DEVELOPER`. | `V2AgentAccessPresetDTO`, `V2AgentAccessOverviewDTO`, `V2AgentAccessPresetId`. | No agent-access UI route/component exists. Need preset copy, one-time reveal, revoke flow, usage/action history, and explicit safe-scope messaging. |
| Analytics | No user-facing analytics API module yet. Existing DB/event groundwork and key usage events exist. | No analytics DTOs in `packages/types/src/v2.ts`. | Analytics dashboard is generated from mock testimonials/widgets/API keys. It must stay marked unwired until event capture/read models land. |
| Notifications | No `api_v2` notifications module is registered. | `V2NotificationDTO`, `V2NotificationType`. | Bell and account notifications use `MOCK_NOTIFICATIONS`; `/account/notifications` is mostly placeholder copy. Need list, unread count, mark-read, and preferences APIs before real wiring. |
| Billing | No `api_v2` billing module is registered. Razorpay inbound webhook exists. | `V2SubscriptionDTO`, `V2SubscriptionStatus`. Missing invoice, payment method, billing profile, and read-only billing projection DTOs. | Billing UI mutates mock subscription/payment/profile state. Current product decision is read-only billing first, so UI must disable or remove unsafe payment mutations until API/provider source-of-truth is settled. |
| Integrations, exports, outbound webhooks | Not implemented yet; V1 Task 4 is next for outbound webhook/export foundation. Inbound Clerk/Razorpay webhook routes exist. | Scope strings exist in `V2ApiKeyScope`; no destination, rule, delivery, or provider DTOs yet. | No real settings UI for integrations, exports, outbound webhook endpoints, delivery failures, CSV export, or provider setup. |
| Public hosted surfaces | Public testimonial submit/list, public form list/submit, public widget embed, and public wall routes exist. Host/trust normalization exists API-side. | Public response DTOs are incomplete or absent. | Standalone/preview public UI remains mostly design/local state. It needs host-aware API resolution, canonical URLs, idempotent submit handling, and browser/HMAC trust semantics. |
| Admin/ops alerts | `_status` routes exist for alerts and ops-admin. | None for UI. | Out of scope for product UI wiring unless an internal ops UI is reopened. |

## Shared Types Ready For UI Use

The following `packages/types/src/v2.ts` exports are immediately useful for UI contract work:

- Generic and errors: `V2PaginatedResponse<T>`, `V2ErrorResponse`.
- Project/org basics: `V2ProjectDTO`, `V2OrganizationDTO`, `V2CurrentOrganizationDTO`, `V2ProjectType`, `V2ProjectVisibility`.
- Testimonials: `V2TestimonialDTO`, `V2ModerationStatus`, `V2TestimonialType`, `V2TestimonialDisplayRevisionDTO`, `V2DisplayRevisionStatus`.
- Feedback integrity: `V2SubmissionDTO`, `V2SubmissionAnnotationDTO`, `V2ProjectActionAuditDTO`, `V2ActorType`, `V2PublicSubmitTrustMode`.
- Widgets/forms: `V2WidgetDTO`, `V2WidgetConfig`, `V2WidgetListEntry`, `V2CollectionFormDTO`, `V2FormConfigEntry`.
- Credentials/agent access: `V2ApiKeyDTO`, `V2CreatedApiKeyDTO`, `V2ApiKeyEventDTO`, `V2ApiKeyScope`, `V2ApiKeyStatus`, `V2ApiKeyType`, `V2AgentAccessOverviewDTO`, `V2AgentAccessPresetDTO`, `V2AgentAccessPresetId`.
- Future/mock-backed surfaces: `V2NotificationDTO`, `V2SubscriptionDTO`.

## Shared Type Gaps Before Broad UI Wiring

| Gap | Why it matters |
|---|---|
| `web_v2` package does not depend on `@workspace/types`. | The UI cannot safely consume shared DTOs until the dependency and import pattern are added. |
| No `V2ApiEnvelope<T>` or meta type. | Every `api_v2` response is globally wrapped unless a route already returns a `success` object. UI needs one consistent unwrap path. |
| No `V2UserDTO`. | Account/profile/current-user wiring currently relies on a local `ApiUser` interface and calls the wrong endpoint. |
| `V2ProjectDTO` drifts from backend response. | Backend returns `formConfig`; shared type omits it. Shared type includes `_count.forms`; backend response currently omits that count. |
| No `V2ProjectAccessDTO` or `access` block on `V2ProjectDTO`. | Locked decision says UI gating should come from backend-projected role/capabilities. Backend authorization exists, but the frontend contract is incomplete. |
| No project member/trusted-origin/signing-secret DTOs. | Project settings cannot wire members, browser trusted origins, or server submit secrets without local types. |
| No request body DTOs. | UI forms for create/update/mutate flows still need local schema or duplicated request types. |
| No studio draft DTO. | Forms/widgets already have draft APIs with optimistic concurrency, but UI needs a typed draft response/body contract. |
| Public DTOs are incomplete. | Public collection, public widget, public wall, public testimonial list, and public submit responses need display-safe shared types. |
| No analytics/export/outbound webhook/integration DTOs. | These product areas are either pending API work or still mock-only. |
| `V2ProjectActionAuditDTO` has no read-route contract. | Audit writes exist, but no typed list endpoint exists for UI. |

## UI Gap Inventory By Product Area

### Cross-cutting API client

- Replace `apps/web_v2/lib/api.ts` as the default product data path.
- Keep mock data only for deliberate design previews, empty-state examples, or fallback preview content.
- Make `api-client.ts` understand:
  - Clerk token retrieval.
  - `success/data/meta` response envelope.
  - typed errors from `AllExceptionsFilter`.
  - serialized date strings.
  - paginated data in `data.items`.
- Fix current-user path from `/users/me` to `/me`.

### Project shell and navigation

- Project list, project detail, project switcher, sidebar, topbar, and project layout still rely on mock project lookup.
- The UI needs real project list/detail queries by slug.
- The backend still needs a frontend-safe `access` block before controls can be confidently hidden/disabled by capability.
- Active Clerk organization state should be reflected in project scoping and empty states.

### Testimonials and feedback integrity

- Existing testimonial list/detail UI can wire to implemented private testimonial routes, but it currently uses mock types and optimistic simulated mutations.
- The new submission APIs need a UI surface:
  - submission list and detail.
  - immutable answers/rating/trust/source metadata display.
  - annotations with note, labels, sentiment, and metadata.
  - moderation status/reason changes.
- Display suggestions need a UI surface:
  - create suggestion.
  - show revision status.
  - approve/reject as user-only presentation copy.
  - explain that approval updates display copy, not original feedback.
- Project action audit should eventually be visible, but the read endpoint is not implemented yet.

### Forms and collection studio

- `apps/web_v2/lib/collect/*` and collect pages use local stores and mock project context.
- Implemented API supports form CRUD, public form list, public form submit, and server-side drafts.
- UI wiring needs:
  - real form list/detail/create/update/delete.
  - server draft get/put.
  - `expectedVersion` conflict UX.
  - explicit testimonial field mapping, not label inference.
  - public submit idempotency and trust-mode copy.

### Widgets and wall studio

- Widget list/studio use mock project lookup, local store state, fallback testimonials, and local preview rendering.
- Implemented API supports widget CRUD, public widget embed, public wall, and server-side drafts.
- UI wiring needs:
  - real widget list/detail/create/update/delete.
  - draft get/put and stale-version conflict handling.
  - public widget/wall URL display from canonical route/host data.
  - metrics from real widget analytics when read models land.

### Credentials and public trust settings

- Existing API-key UI is mock-backed and conflates publishable/browser keys with private API keys.
- Real private API keys are scoped `SECRET` credentials with one-time secret reveal.
- Real agent keys are separate `AGENT` credentials exposed through agent-access routes.
- Public browser trust is managed through allowed origins/trusted origins, not publishable API keys.
- Server submit trust is managed through project signing-secret routes, not private API keys.
- UI needs separate intent sections:
  - Collect in the browser: trusted origins/public hosted URLs.
  - Submit from your backend: HMAC signing secret.
  - Use the private API: scoped private API keys.
  - Let agents help: scoped agent keys and presets.

### Agent access

- Backend overview/create/revoke/actions exists.
- No UI exists yet.
- Needed UI:
  - presets with product copy.
  - key creation with one-time reveal.
  - key metadata/status/revoke.
  - usage/action feed.
  - clear exclusions for billing/member/project deletion/secret reveal/source rewrite.

### Analytics

- Analytics dashboard is entirely mock-generated from mock testimonials, widgets, and API-key data.
- Backend does not yet expose analytics summary/time-series endpoints for the dashboard.
- Event capture/read models should land before wiring this page.

### Notifications

- Notification bell and account notifications use `MOCK_NOTIFICATIONS`.
- Backend notification module is not registered.
- Required API surface remains list, unread count, mark-read, and preferences.

### Billing

- Billing UI uses mock subscription, invoices, payment methods, and billing profile mutations.
- Backend billing read projections are not implemented.
- Current locked direction is read-only billing first. UI must not expose real payment mutations until provider/source-of-truth decisions are settled.

### Integrations, exports, and outbound webhooks

- These are not implemented in `api_v2` yet, except for inbound Clerk/Razorpay webhooks.
- V1 Task 4 is the next backend checkpoint for outbound webhook/export foundation.
- UI should not build permanent provider flows until the shared destination/rule/delivery DTOs exist.

## Ready-To-Wire Vs Needs More API Work

Ready to wire with caveats:

- Current user, after path/envelope fix and shared `V2UserDTO`.
- Organizations current.
- Project list/detail/settings, after response/type drift is resolved and access projection is added.
- Testimonials list/detail/moderation/publish.
- Submissions list/detail/annotations/moderation.
- Display suggestion create/approve/reject.
- Forms and widgets CRUD/drafts, once draft DTOs are shared.
- Private API keys and agent access.

Needs more API or shared-type work first:

- Project `access` block and shared capability DTOs.
- Project action audit read endpoint.
- Notifications API.
- Billing read projections.
- Analytics event capture and read models.
- Exports, outbound webhooks, native integrations.
- Public hosted route resolution contract for `web_v2` page rendering.
- Shared envelope, user, draft, request, public, member, trusted-origin, signing-secret, delivery, analytics, notification-preference, and billing detail DTOs.

## Documentation Status

This inventory supersedes the implementation-state portions of the 2026-05-02 consolidated gap map for sessions after V1 Task 3. The older consolidated gap map remains useful for locked decisions and rationale.

Continuity status as of this document:

- `docs/continuity/progress.md` is current through `09fa77a`.
- `docs/continuity/decisions.md` is current through the V1 Task 3 feedback integrity decision.
- `docs/continuity/open-questions.md` still has the relevant user-owned decisions for billing, notifications, analytics, and native integration order.
- `docs/continuity/doc-map.md` lists this document as the current UI/API/shared-types gap inventory.
