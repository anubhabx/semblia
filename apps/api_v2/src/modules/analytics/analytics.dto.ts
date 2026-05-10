import { z } from "zod";

export const analyticsSummaryQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(366).default(30),
});

export type AnalyticsSummaryQueryDto = z.infer<
  typeof analyticsSummaryQuerySchema
>;
