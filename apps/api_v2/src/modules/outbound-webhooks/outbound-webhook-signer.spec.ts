import { describe, expect, it } from "vitest";
import {
  buildOutboundWebhookHeaders,
  signOutboundWebhookBody,
} from "./outbound-webhook-signer.js";

describe("outbound webhook signer", () => {
  it("signs timestamp and raw body with deterministic HMAC headers", () => {
    const timestamp = "2026-05-08T12:00:00.000Z";
    const rawBody = JSON.stringify({ event: "testimonial.published" });
    const secret = "whsec_test_secret";

    expect(signOutboundWebhookBody({ timestamp, rawBody, secret })).toBe(
      "363c639a0e807ca6aa969e487cd87622e64991a23ad99e89dfa47c501e3375cf",
    );

    expect(
      buildOutboundWebhookHeaders({
        eventType: "testimonial.published",
        deliveryId: "del_123",
        timestamp,
        rawBody,
        secret,
      }),
    ).toEqual({
      "Content-Type": "application/json",
      "X-Tresta-Event": "testimonial.published",
      "X-Tresta-Delivery": "del_123",
      "X-Tresta-Timestamp": timestamp,
      "X-Tresta-Signature":
        "v1=363c639a0e807ca6aa969e487cd87622e64991a23ad99e89dfa47c501e3375cf",
    });
  });
});
