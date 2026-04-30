import { z } from "zod";

export const razorpayWebhookBodySchema = z
  .object({
    event: z.string().min(1),
    account_id: z.string().optional(),
    payload: z.record(z.string(), z.unknown()).optional(),
    created_at: z.number().int().optional(),
  })
  .passthrough();

export type RazorpayWebhookBodyDto = z.infer<typeof razorpayWebhookBodySchema>;
