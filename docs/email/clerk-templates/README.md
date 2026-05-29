# Clerk email templates (Revolvapp markup, delivered by Clerk)

Brand-matched templates for Clerk's built-in emails. These keep **"Delivered by
Clerk" ON** — Clerk renders the variables and sends via its own infrastructure, so there
is **no extra app code, webhook, or sending cost**. Colors mirror our own Resend emails
(`apps/api_v2/src/modules/email/email-layout.ts`): brand amber `#d78951` · ink `#201914`
· body `#5f574e` · muted `#8c8377` · pale amber `#fae4cc` · page `#f7f5f2`.

## Clerk's editor is Revolvapp — read this

Clerk's email editor is the **Revolvapp** template engine, which uses its own
**`re-`-prefixed markup** (not raw HTML) and transpiles it to table-based HTML for
cross-client rendering. The rules these files follow:

1. **Full Revolvapp document**, not body-fragment HTML:
   `re-html › re-head (re-title, re-style, re-preheader) › re-body › re-container ›
   re-header / re-main / re-footer`.
2. **Semantic component tags**, not `re-table` soup: `re-block` (container),
   `re-heading`, `re-text`, `re-button`, `re-image`, `re-preheader`.
3. **Styling via element attributes, NOT `style=""`.** Supported attributes:
   - `re-block`: `padding`, `background-color`, `border`, `border-radius`, `align`, `valign`
   - `re-heading`: `level` (h1–h6), `color`, `align`, `font-weight`, `margin`
   - `re-text`: `color`, `font-size`, `font-weight`, `line-height`, `align`, `margin`, `class`
   - `re-button`: `href`, `background-color`, `color`, `border-radius`, `font-weight`, `font-size`, `margin`
   - `re-image`: `src`, `alt`, `width`, `border-radius`
   Things attributes can't do (font-family, letter-spacing) live in the `re-style` block
   in `re-head`, attached via `class`.
4. **Plain `{{variable}}` only** — Clerk does not support Handlebars block helpers
   (`{{#if}}`), so there are no conditionals.

## How to apply

1. Clerk Dashboard → **Customization → Emails**.
2. Open a template, set its **Subject** (table below).
3. Switch the editor to the **`</>` (code) view** and replace the contents with the
   matching `.html` file (it's Revolvapp markup despite the extension). Leave
   **"Delivered by Clerk" ON**.
4. Switch back to the visual view to confirm it parsed, then send yourself a test.

| File | Clerk template | Subject |
| --- | --- | --- |
| `verification-code.html` | Verification code (email OTP) | `{{otp_code}} is your {{app.name}} verification code` |
| `magic-link.html` | Magic link | `Sign in to {{app.name}}` |
| `reset-password-code.html` | Reset password code | `Reset your {{app.name}} password` |
| `invitation.html` | Invitation | `You've been invited to {{app.name}}` |
| `password-changed.html` | Password changed | `Your {{app.name}} password was changed` |

## Variables used

- `{{otp_code}}` — verification / reset code (verification-code, reset-password-code)
- `{{magic_link}}` — one-time sign-in URL (magic-link)
- `{{action_url}}` — invitation accept URL (invitation)
- `{{app.name}}` — set in Clerk Dashboard → Customization

## Notes

- **Logo:** templates use a "Tresta" text wordmark (a `re-text` in `re-header`). To use an
  image, upload it in Clerk and replace that `re-text` with
  `<re-image src="{{app.logo_image_url}}" alt="{{app.name}}" width="120px"></re-image>`.
- **"Secured by Clerk" footer:** removable on Clerk paid plans. On the free plan Clerk
  appends its own footer below ours.
- **Project-member invites** are sent by our **own** Resend pipeline
  (`EmailTemplateKey.PROJECT_MEMBER_INVITE`), not Clerk. `invitation.html` is only for
  Clerk-native (organization/app) invitations.
- After pasting, eyeball the visual view: if `re-style` letter-spacing/font-family aren't
  applied by your Clerk/Revolvapp version, the email still renders correctly on attributes
  and Revolvapp defaults.
