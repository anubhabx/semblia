import { createHmac } from "node:crypto";

export type OutboundWebhookSigningInput = {
  timestamp: string;
  rawBody: string;
  secret: string;
};

export function signOutboundWebhookBody({
  timestamp,
  rawBody,
  secret,
}: OutboundWebhookSigningInput) {
  return createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`, "utf8")
    .digest("hex");
}

export function buildOutboundWebhookHeaders({
  eventType,
  deliveryId,
  timestamp,
  rawBody,
  secret,
}: OutboundWebhookSigningInput & {
  eventType: string;
  deliveryId: string;
}) {
  const signature = signOutboundWebhookBody({ timestamp, rawBody, secret });

  return {
    "Content-Type": "application/json",
    "X-Tresta-Event": eventType,
    "X-Tresta-Delivery": deliveryId,
    "X-Tresta-Timestamp": timestamp,
    "X-Tresta-Signature": `v1=${signature}`,
  };
}
