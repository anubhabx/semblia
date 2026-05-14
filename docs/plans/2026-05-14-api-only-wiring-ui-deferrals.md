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

## Deferred API/UI Boundary Questions

- Authenticated CSV download currently returns `text/csv` from `GET /v2/projects/:slug/exports/deliveries/:deliveryId/download`. A future UI pass should decide whether to fetch the file directly with a Clerk token, proxy through a Next route handler, or expose a short-lived download URL from `api_v2`.
- Billing remains blocked on the source-of-truth decision recorded in `docs/continuity/open-questions.md`; this pass does not add billing client behavior beyond the existing read-only placeholders.

## Next Safe Step

Use the new typed hooks to replace one UI area at a time, starting with read-only list surfaces that need the least visual redesign: notifications, action audit, export deliveries, outbound webhook deliveries, or integration connections.
