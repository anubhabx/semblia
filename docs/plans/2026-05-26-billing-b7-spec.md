# Billing Phase B7 — Security audit + final verification

Date: 2026-05-26
Owner: Codex (delegated by orchestrator)
Branch: `revamp/v2`
Depends on: B4 + B5 + B6 already landed.

## Goal

End-to-end audit + verification of the Razorpay billing track. Produce a
short audit report at `docs/billing-security-audit-2026-05-26.md` and
fix any P0/P1 findings inline. Defer P2/P3 findings as recorded items
in `docs/continuity/open-questions.md`.

## Audit checklist

For each item: read the code, decide pass/fail, log the finding. Fix
P0/P1 inline. Mark P2/P3 as open questions.

### Auth + actor isolation

- All `/v2/account/subscription/*`, `/account/payment-methods`,
  `/account/invoices`, `/account/billing-profile` routes require a Clerk
  user session — they are user-scoped, not project-scoped, and must not
  be accessible to API keys or agent keys. Confirm the controller-level
  guard chain.
- Confirm that `BillingService.getSubscription(userId)` etc. cannot
  return another user's data. Look for any `findFirst({ where: { id } })`
  that doesn't also bind `userId`. (The existing `deletePaymentMethod`
  used a `userId` filter — that path is gone in B5 but verify the
  list/upsert paths.)
- Verify the webhook handler creates `SubscriptionPayment`,
  `PaymentMethod`, and `Invoice` rows bound to the correct
  `subscription.userId` and not to a notes-derived id (notes are
  attacker-controllable since Razorpay echoes them — they should only be
  used as a tiebreaker when the external subscription id can't be
  resolved).

### Webhook signature + idempotency

- Razorpay webhook signature verification is enforced before any DB
  write happens. (Trace `webhooks.controller.ts` → service.)
- Replay handling: a duplicate `providerEventId` must be a noop, not a
  re-write. Test exists already; re-run.
- Verify the signature secret comes from `RAZORPAY_WEBHOOK_SECRET` (or
  whatever the env name is) and `B1` env-required hardening still
  rejects production startup if missing.

### Secret handling

- `RAZORPAY_KEY_SECRET` must never be sent to the browser. Grep all of
  `apps/web_v2/` for that name and any heuristic substrings.
- `razorpayKeyId` (publishable) IS allowed client-side — only via the
  `V2SubscriptionCheckoutDTO`. Confirm it is not also leaked through any
  other endpoint response (subscription GET, invoice listing, etc.).
- No secrets in logs. Grep for `console.log` and `logger.*` calls in the
  billing/webhook modules and check the surrounding context.

### Race conditions

- Two concurrent `subscription.charged` events for the same
  `paymentId` — verify the upsert by
  `provider_externalPaymentId` makes this safe (test exists; re-verify).
- Two concurrent checkout calls for the same user — the second call
  returns the active subscription id (existing B2 happy path test).
  Re-verify after B4 added scheduled fields.
- A user clicks "Switch plan" twice in quick succession — B4 cleanup
  cancels the previous scheduled sub. Verify a test covers it.
- Webhook activates the scheduled sub at the same moment a fresh
  scheduled switch is being created — last-write-wins on the
  `scheduledRazorpaySubscriptionId` slot. Document the failure mode in
  the audit report. (No fix required for v1; just a known concern.)

### Money + currency

- All `Subscription.amount` / `Plan.price` / `Invoice.amount` reads and
  writes treat the value as **paise** (integer). No `* 100` or `/ 100`
  conversions in the API service layer beyond DTO rendering. UI formats
  via `formatINR`. Grep for any `parseFloat`, `Number(`, or `/100` in
  the billing/webhook modules and confirm.
- `currency` is always `"INR"`. The DTO type lock to `"INR"` should
  prevent non-INR data from being stored. Spot-check the webhook upsert
  paths — any place that pulls `entity.currency` directly should
  default to `"INR"` rather than `null` to avoid weird display states.

### CORS + CSRF

- `/v2/account/subscription/*` routes are authenticated via Clerk JWT
  bearer (not cookies), so CSRF is not a concern; confirm there is no
  cookie-auth fallback.
- The Razorpay webhook endpoint is open by design — verify it does NOT
  reflect arbitrary input back to the client (no echo path).

### Dependency audit

```
pnpm.cmd audit --prod --json
pnpm.cmd audit --json
```

Filter advisories that touch `apps/api_v2`, `apps/web_v2`,
`packages/database`, `packages/types`, or the new
`razorpay` dependency itself. Pre-existing legacy/admin/widget
advisories may be ignored as long as they don't move into the V2
workspaces.

### Hosted Razorpay checkout

- `apps/web_v2/lib/razorpay-checkout.ts` script src must be
  `https://checkout.razorpay.com/v1/checkout.js` exactly. Pin the
  string. Confirm no other Razorpay JS is loaded.
- `apps/web_v2/next.config.*` — if there is a CSP, confirm
  `https://checkout.razorpay.com` is allowed. If there is no CSP, log
  this as a P2 open question (CSP hardening is a future task).

## Final verification

Run from repo root:

```
pnpm.cmd --filter @workspace/database generate
pnpm.cmd --filter @workspace/database exec prisma validate
pnpm.cmd --filter @workspace/types build
pnpm.cmd --filter api_v2 typecheck
pnpm.cmd --filter api_v2 lint
pnpm.cmd --filter api_v2 test
pnpm.cmd build --filter api_v2
cd apps/web_v2 && pnpm.cmd exec tsc --noEmit
cd apps/web_v2 && pnpm.cmd exec eslint . --ext .ts,.tsx
pnpm.cmd --filter web_v2 format
pnpm.cmd --filter web_v2 test
pnpm.cmd build --filter web_v2
python scripts/update-indexes.py
python scripts/rebuild-graphify.py
```

All must pass. Report total test counts (api_v2 + web_v2) and the
merged graph node/edge counts from `update-indexes.py` and
`rebuild-graphify.py`.

## Audit report

Create `docs/billing-security-audit-2026-05-26.md` with sections:

- Summary (one sentence, plus pass/fail count per severity)
- Methodology (the checklist above, condensed)
- Findings table: id, severity (P0/P1/P2/P3), area, description,
  current status (fixed inline / open question / not-applicable)
- Fixes applied (diff summary)
- Open items (referenced into `docs/continuity/open-questions.md`)

## Doc updates

`docs/continuity/progress.md`:
- Bump "Last updated" header to `2026-05-26 (Billing track complete — B7 audit + verification)`.
- In the "Current Snapshot" bullet, mark the Razorpay billing track as
  done (B1-B7) and update the "Next implementation checkpoint" to the
  analytics dashboard wiring leg.
- Append a B7 line in the "Billing track" bullet that summarises the
  audit outcome and points to the new audit report.
- Append a "Billing Phase B7 verification passed" entry under "Latest
  Verification" with all the final numbers.

`docs/continuity/open-questions.md`:
- Append any new P2/P3 audit items that aren't fixed inline.

`docs/continuity/decisions.md`: no edits.

Do **not** create a commit.

## Non-goals

- No new feature work.
- No reorganising older legacy/admin/widget audit findings — only the
  V2 billing surface is in scope.
- No live testing against the real Razorpay API in this audit (we don't
  have a sandbox in this environment); behaviour is asserted through
  unit tests + spec'd webhook payloads.

## Done definition

All verification commands pass. The audit report exists. P0/P1 findings
are fixed inline. P2/P3 findings are recorded in
`open-questions.md`. Continuity docs reflect a closed billing track.
