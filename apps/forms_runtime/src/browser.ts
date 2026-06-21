import { mountForm } from "@workspace/forms-renderer/client";
import type { PublicSnapshot } from "@workspace/forms-core";

function readSnapshot(): PublicSnapshot {
  const el = document.getElementById("semblia-form-snapshot");
  if (!el?.textContent) {
    throw new Error("Missing Semblia form snapshot");
  }
  return JSON.parse(el.textContent) as PublicSnapshot;
}

function sourceMetadata() {
  const params = new URLSearchParams(window.location.search);
  return {
    source: "forms_runtime",
    referrer: document.referrer || undefined,
    utmSource: params.get("utm_source") ?? undefined,
    utmMedium: params.get("utm_medium") ?? undefined,
    utmCampaign: params.get("utm_campaign") ?? undefined,
    externalId: params.get("external_id") ?? undefined,
  };
}

function idempotencyKey() {
  return globalThis.crypto?.randomUUID?.() ?? `form_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

const root = document.getElementById("semblia-form-root");
if (root instanceof HTMLElement) {
  const snapshot = readSnapshot();
  const submitUrl = root.dataset.submitUrl;
  if (!submitUrl) throw new Error("Missing Semblia form submit URL");

  mountForm(root, snapshot, {
    hydrate: true,
    onSubmit: async (payload) => {
      const response = await fetch(submitUrl, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "idempotency-key": idempotencyKey(),
        },
        body: JSON.stringify({
          answers: payload.answers,
          consent: payload.consent,
          elapsedMs: payload.elapsedMs,
          honeypot: payload.honeypot,
          sourceMetadata: sourceMetadata(),
        }),
      });

      if (!response.ok) {
        throw new Error("Submission could not be saved. Please try again.");
      }
    },
  });
}
