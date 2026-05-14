# API-Only Wiring And UI Deferrals

Date: 2026-05-14

## Scope

This pass continues the `web_v2` API wiring without changing UI pages, layout, visual components, or product flows. The safe implementation boundary is the typed API client plus React Query hook layer.

## API-Only Wiring Added

- `apps/web_v2/lib/tresta-api.ts` now exposes typed functions for backend routes that already exist but were not yet available to `web_v2` consumers:
  - current organization summary
  - notifications list, unread count, mark-read, mark-all-read, and preferences
  - project analytics summary and public analytics event capture
  - public surface host resolution
  - project action-audit reads
  - outbound webhook endpoints, deliveries, retry, and secret rotation
  - CSV export delivery creation and reads
  - native integration connections and one-way export delivery creation
- `apps/web_v2/hooks/api/*` now exposes hook-level seams for those same domains using the shared live-query options and centralized query keys.

## Live Hook Usage Added

- 2026-05-15 follow-up: `apps/web_v2/components/nav/notification-bell.tsx` and `apps/web_v2/app/(account-shell)/account/notifications/page.tsx` now use the live notification hooks instead of `MOCK_NOTIFICATIONS`/`getUnreadNotificationCount`.
- The bell reads `useNotificationsList({ pageSize: 5 })` plus `useUnreadNotificationCount()` and marks unread linked notifications through `useMarkNotificationRead()`.
- The account notifications page renders a live notification inbox with `useNotificationsList({ pageSize: 20 })`, unread count, notification preferences read status, `useMarkNotificationRead()`, and `useMarkAllNotificationsRead()`.

## Phase 1 Completion (2026-05-14)

The following items from the original "UI Rework Skipped" list have been completed:

- **API keys**: All 4 components (`api-keys-client.tsx`, `api-key-list-item.tsx`, `api-key-detail-client.tsx`, `create-key-dialog.tsx`) fully rewritten to use `V2ApiKeyDTO`, `useApiKeysList`, `useRevokeApiKey`, `useRotateApiKey`, `useCreateApiKey`, and `useApiKeyEvents`. Legacy `use-api-keys.ts` has no remaining consumers.
- **Page-level identity**: All 10 `[slug]` server pages now use `serverFetchProjectBySlug` instead of `getProjectBySlug`. No server component imports `mock-data.ts`.
- **Shared utilities**: `timeAgo`, `PROJECT_TYPE_LABELS`, `MODERATION_STATUS_LABELS` centralized in `lib/format.ts`. All `components/` consumers updated.

## UI Rework Still Needed (Phase 2)

The following surfaces still depend on mock-data or mock-shaped component props at the **component** level. Server pages pass `V2ProjectDTO` via `as unknown as MockProject` casts.

| Area | Current mock dependency | Why deferred |
| --- | --- | --- |
| Testimonials inbox/list/detail | `apps/web_v2/components/testimonials/*`, `apps/web_v2/hooks/use-testimonial-moderation.ts` | Components depend on `MockTestimonial` and older status/action helpers. Moving to `V2TestimonialDTO` needs component-level prop and moderation-flow changes. Awaiting Codex consultation on field mapping. |
| Analytics dashboard | `apps/web_v2/components/analytics/analytics-dashboard.tsx` | Dashboard computes mock time series locally. The new `useAnalyticsSummary` hook is ready, but chart/data mapping is UI work. |
| Widget studio internals | `apps/web_v2/components/widgets/studio/*`, `apps/web_v2/components/widgets/preview-renderers/*` | Widget previews use `MockProject`/`MockTestimonial` in local draft assumptions. Typed widget/draft hooks exist, but store and preview props need a separate pass. |
| Project settings form | `apps/web_v2/components/settings/settings-client.tsx` | The settings client deeply uses `MockProject`, `SocialLinks`, `ProjectVisibility` types. Converting requires form-state and permission-display changes. |

Surfaces with no existing first-class page yet:

- Action audit, outbound webhook deliveries, CSV export deliveries, and native integration delivery streams have typed hooks, but `web_v2` does not currently expose dedicated pages/components for them. Adding those views is product/UI work, so this follow-up does not invent new screens.

## Deferred API/UI Boundary Questions

- Authenticated CSV download currently returns `text/csv` from `GET /v2/projects/:slug/exports/deliveries/:deliveryId/download`. A future UI pass should decide whether to fetch the file directly with a Clerk token, proxy through a Next route handler, or expose a short-lived download URL from `api_v2`.
- Billing remains blocked on the source-of-truth decision recorded in `docs/continuity/open-questions.md`; this pass does not add billing client behavior beyond the existing read-only placeholders.

## Next Safe Step

API keys and notifications are now fully live. The next safest surface to wire is **analytics** (the `useAnalyticsSummary` hook exists, and chart mapping is bounded). After that, the **testimonials** components can be migrated once Codex confirms the `MockTestimonial` → `V2TestimonialDTO` field mapping. Settings should be last due to the deep form-state coupling.
