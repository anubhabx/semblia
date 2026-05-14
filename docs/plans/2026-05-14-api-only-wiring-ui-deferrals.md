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

## UI Rework Skipped

The following surfaces still depend on mock-data or mock-shaped component props. They should be adapted in a dedicated UI pass, not as part of this API-only wiring slice.

| Area | Current mock dependency | Why skipped |
| --- | --- | --- |
| API keys | `apps/web_v2/hooks/use-api-keys.ts`, `apps/web_v2/components/api-keys/*`, `apps/web_v2/app/(app)/projects/[slug]/api-keys/**` | Existing UI expects `MockApiKey`, local lifecycle events, and plaintext handling that need a UX-safe one-time-secret adaptation. Typed credential hooks now exist under `hooks/api/use-credentials-api.ts`. |
| Testimonials inbox/list/detail | `apps/web_v2/components/testimonials/*`, `apps/web_v2/app/(app)/projects/[slug]/testimonials/**`, `apps/web_v2/hooks/use-testimonial-moderation.ts` | Components depend on `MockTestimonial` and older status/action helpers. Moving to `V2TestimonialDTO` needs component-level prop and moderation-flow changes. |
| Analytics dashboard | `apps/web_v2/components/analytics/analytics-dashboard.tsx`, `apps/web_v2/app/(app)/projects/[slug]/analytics/page.tsx` | Dashboard computes mock time series and project stats locally. The new `useAnalyticsSummary` hook is ready, but chart/data mapping is UI work. |
| Forms/collection pages | `apps/web_v2/app/(app)/projects/[slug]/collect/**` | Pages still resolve project identity from `getProjectBySlug`. Wiring forms/drafts requires page and studio-state adaptation. |
| Widgets and widget studio | `apps/web_v2/app/(app)/projects/[slug]/widgets/**`, `apps/web_v2/components/widgets/**` | Widget previews and studio state use `MockProject`/`MockTestimonial` and local draft assumptions. Typed widget and draft hooks already exist, but the store and preview props need a separate pass. |
| Project settings | `apps/web_v2/app/(app)/projects/[slug]/settings/page.tsx`, `apps/web_v2/components/settings/settings-client.tsx` | The settings client still accepts `MockProject`; converting it requires form-state and permission-display changes. |

Surfaces with no existing first-class page yet:

- Action audit, outbound webhook deliveries, CSV export deliveries, and native integration delivery streams have typed hooks, but `web_v2` does not currently expose dedicated pages/components for them. Adding those views is product/UI work, so this follow-up does not invent new screens.

## Deferred API/UI Boundary Questions

- Authenticated CSV download currently returns `text/csv` from `GET /v2/projects/:slug/exports/deliveries/:deliveryId/download`. A future UI pass should decide whether to fetch the file directly with a Clerk token, proxy through a Next route handler, or expose a short-lived download URL from `api_v2`.
- Billing remains blocked on the source-of-truth decision recorded in `docs/continuity/open-questions.md`; this pass does not add billing client behavior beyond the existing read-only placeholders.

## Next Safe Step

Use the new typed hooks to replace one UI area at a time. Notifications are now live. The next safest existing surfaces are API keys or analytics only after their mock-shaped props are adapted deliberately; action audit/export/webhook/integration delivery views need product-owned UI surfaces before they can be wired.
