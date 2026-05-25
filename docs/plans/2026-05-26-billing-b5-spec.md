# Billing Phase B5 — Saved Cards (read-only) + Invoice URLs

Date: 2026-05-26
Owner: Codex (delegated by orchestrator)
Branch: `revamp/v2`
Depends on: B4 (already merged into the same branch)

## Context

Locked decision (`docs/continuity/decisions.md`, 2026-05-24):

> Saved payment methods are read-only, populated from `subscription.charged`
> events. Razorpay holds the card mandate; we display brand/last4 from token
> metadata in webhook payloads. No add-card UI, no add/remove/set-default
> endpoints. Razorpay Checkout captures card-on-file per subscription.

The current API still exposes `DELETE /v2/account/payment-methods/:id` and
`POST /v2/account/payment-methods/:id/default`. Those must go away to match
the decision, and the webhook handler must start populating PaymentMethod
rows from `subscription.charged` and `payment.captured` payloads.

Invoice rows already exist locally (B3) but `Invoice.downloadUrl` is never
populated. Razorpay sends a hosted invoice URL in `invoice.paid` /
`invoice.payment_failed` events under `payload.invoice.entity.short_url`.
That should be mirrored into `Invoice.downloadUrl`, and `Invoice` rows
should be created on `invoice.paid` (today only `SubscriptionPayment` is
upserted).

## Scope

### 1. Remove read/write payment method endpoints

`apps/api_v2/src/modules/billing/billing.controller.ts` — delete the
`@Delete("payment-methods/:id")` and `@Post("payment-methods/:id/default")`
routes entirely. Keep `@Get("payment-methods")`.

`apps/api_v2/src/modules/billing/billing.service.ts` — delete
`deletePaymentMethod`, `setDefaultPaymentMethod`, and their helpers if
unused elsewhere. Keep `listPaymentMethods`.

`apps/api_v2/src/modules/billing/billing.dto.ts` — the
`paymentMethodParamsSchema` is now unused; delete it and its exported
`PaymentMethodParamsDto` type.

`apps/api_v2/src/modules/billing/billing.service.spec.ts` — remove the
delete + setDefault test cases. Keep listPaymentMethods coverage.

### 2. Webhook DTO additions

`apps/api_v2/src/modules/webhooks/webhooks.dto.ts`:

- Extend `razorpayPaymentEntitySchema` with the optional card/token fields
  Razorpay returns on `subscription.charged` and `payment.captured`:
  - `token_id: z.string().optional()`
  - `card_id: z.string().optional()`
  - `card: z.object({
       last4: z.string().optional(),
       network: z.string().optional(),
       expiry_month: z.number().int().optional(),
       expiry_year: z.number().int().optional(),
     }).passthrough().optional()`
  - `method: z.string().optional()` — only `card` is interesting for v1;
    anything else (`upi`, `netbanking`) is skipped on the upsert path.
- Extend `razorpayInvoiceEntitySchema`:
  - `short_url: z.string().url().optional()`
  - `invoice_number: z.string().optional()`
  - `description: z.string().optional()`
  - `customer_id: z.string().optional()`
- Re-export inferred types as before. No new schemas needed.

### 3. Webhook handler — payment method mirror

`apps/api_v2/src/modules/webhooks/webhooks.service.ts`:

Add a private helper:
```ts
private async upsertRazorpayPaymentMethod(
  tx: Prisma.TransactionClient,
  body: RazorpayWebhookBodyDto,
  subscription: RazorpaySubscriptionForProcessing,
) { ... }
```

Behaviour:
- Read `body.payload.payment.entity`. If absent or `entity.method !== "card"`,
  return without writes.
- Require `entity.token_id` (this is the Razorpay token row that survives
  across charges and is the durable id). If missing, return.
- Extract brand from `entity.card.network` (Razorpay returns values like
  `"Visa"`, `"MasterCard"`, `"RuPay"`, `"American Express"`). Map to
  `PaymentMethodBrand` enum (`VISA` | `MASTERCARD` | `RUPAY` | `AMEX`).
  If the network is something else, return (don't write a row).
- Build the data:
  - `userId: subscription.userId`
  - `brand`
  - `last4: entity.card?.last4 ?? "0000"` (only write if present;
    if not present, return)
  - `expMonth`, `expYear` from `entity.card?.expiry_month` /
    `entity.card?.expiry_year`; required (return if missing).
  - `razorpayTokenId: entity.token_id`
- Upsert by `razorpayTokenId` (it's `@unique`). `create` includes
  `isDefault: !existsDefaultForUser` (compute via
  `tx.paymentMethod.count({ where: { userId, isDefault: true } }) === 0`)
  so the first card becomes default. `update` only refreshes
  `brand/last4/expMonth/expYear` — `isDefault` is preserved.

Call this helper from inside `handleRazorpaySubscriptionCharged` (after the
existing `upsertRazorpayPayment` call) and `handleRazorpayPaymentEvent`
when `paymentStatus === "captured"`. Skip on `payment.failed`.

### 4. Webhook handler — invoice URL mirror

`apps/api_v2/src/modules/webhooks/webhooks.service.ts`:

Add a private helper `upsertLocalInvoice` that, given an
`invoice.entity`, writes/updates a row in `Invoice` keyed by
`razorpayInvoiceId @unique`. Fields:
- `userId: subscription.userId`
- `number: entity.invoice_number ?? entity.id` (truncate to 120 chars to
  fit the column)
- `issuedAt: toUnixDate(entity.issued_at ?? entity.created_at) ?? new Date()`
- `amount: entity.amount_paid ?? entity.amount ?? 0`
- `currency: entity.currency ?? "INR"`
- `status: invoice.status === "paid" ? "PAID" : (status === "issued" ? "OPEN" : status === "expired" ? "VOID" : "OPEN")`
  — use the existing `InvoiceStatus` enum.
- `planName`: resolve via the local Plan by `subscription.planId` (use
  `tx.plan.findUnique({...select: { type: true } })` → pretty name `"PRO"` → `"Pro"`, `"BUSINESS"` → `"Business"`, `"FREE"` → `"Free"`). Fall back to `subscription.userPlan` if Plan is missing.
- `razorpayInvoiceId: entity.id`
- `downloadUrl: entity.short_url ?? null`

Call from `handleRazorpayInvoicePaid` (after the existing
`subscriptionPayment.upsert`). Also call from a NEW handled event
`invoice.payment_failed`:
- Add `"invoice.payment_failed"` to the handled event list in
  `webhooks.service.ts` (`HANDLED_RAZORPAY_EVENTS` and the type union).
- Handler: same DTO lookup as `invoice.paid`, upsert local Invoice with
  status mapped from the entity (`issued` → `OPEN`, etc.), and do **not**
  modify the subscription's `lastInvoiceStatus` beyond `"failed"`.

### 5. PaymentMethod DTO unchanged

`V2PaymentMethodDTO` shape stays as-is. `isDefault` continues to flow from
the DB (the first card per user is the default; nothing else mutates it
because the mutator endpoints are gone).

### 6. Tests

`apps/api_v2/src/modules/billing/billing.service.spec.ts`:
- Drop the existing delete + setDefault test cases.
- `listPaymentMethods` still tested.

`apps/api_v2/src/modules/webhooks/webhooks.service.spec.ts`: add cases
that mirror the existing event tests:
- `subscription.charged` with a card payload writes a PaymentMethod row
  with the mapped brand/last4/exp/token id, marked as default when no
  other rows exist.
- `subscription.charged` with a non-card method (`method: "upi"`) does
  not write a PaymentMethod.
- `subscription.charged` with a duplicate token id updates last4 only
  (simulate exp month change), preserves `isDefault`.
- `invoice.paid` writes an Invoice row with the short_url as
  `downloadUrl` and status `PAID`.
- `invoice.payment_failed` writes/updates the Invoice with status `OPEN`
  (or `VOID` — pick what your status map produces and assert that).
- Existing `subscription.charged` test that asserts period refresh still
  passes.

### 7. Verification

```
pnpm.cmd --filter @workspace/types build
pnpm.cmd --filter api_v2 typecheck
pnpm.cmd --filter api_v2 lint
pnpm.cmd --filter api_v2 test
pnpm.cmd build --filter api_v2
python scripts/update-indexes.py
```

Total API test count should rise — B4 + B5 combined should put the count
in the 350-360 range. Do not assert an exact number; just report it.

### 8. Doc updates

`docs/continuity/progress.md`:
- Bump "Last updated" to `2026-05-26 (Billing Phase B5 — saved cards mirror + invoice URLs)`.
- Add a B5 line in the "Billing track" bullet, in the same shape as
  B1-B4. Mention the removed mutator endpoints, the new
  `invoice.payment_failed` handled event, and the new test count.
- Append a "Billing Phase B5 verification passed" entry under "Latest
  Verification" with the actual numbers reported.

`docs/continuity/decisions.md`: no edits — the 2026-05-24 row already
covers this.

Do **not** create a commit.

## Non-goals

- No web_v2 changes (B6 will fix any UI that still calls
  delete/setDefault).
- No payment method dedupe across multiple users.
- No PCI-sensitive raw data — only brand/last4/exp/token id which
  Razorpay considers safe to store and return.
- No CRUD on Invoice rows beyond webhook-driven upserts.

## Done definition

All verification commands pass, `progress.md` is updated, and the diff
contains the deletions, the webhook DTO extensions, the new
PaymentMethod and Invoice upsert helpers, the `invoice.payment_failed`
handler, and the new tests.
