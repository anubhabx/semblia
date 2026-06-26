import { z } from "zod";

export const projectActionAuditQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  actorType: z.enum(["user", "api_key", "agent_key", "system"]).optional(),
  action: z.string().trim().min(1).max(120).optional(),
  targetType: z.string().trim().min(1).max(120).optional(),
});

export type ProjectActionAuditQueryDto = z.infer<
  typeof projectActionAuditQuerySchema
>;
