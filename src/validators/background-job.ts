import { z } from "zod"

export const jobStatusSchema = z.enum(["pending", "running", "completed", "failed", "cancelled"])

export const jobPrioritySchema = z.enum(["low", "normal", "high", "critical"])

export const createBackgroundJobSchema = z.object({
  organizationId: z.uuid().nullable().optional(),
  type: z.string().trim().min(1).max(100),
  priority: jobPrioritySchema.default("normal"),
  payload: z.unknown().nullable().optional(),
  maxAttempts: z.number().int().min(1).max(10).default(3),
})

export const updateBackgroundJobSchema = z.object({
  status: jobStatusSchema.optional(),
  priority: jobPrioritySchema.optional(),
  result: z.record(z.string(), z.unknown()).nullable().optional(),
  attempts: z.number().int().min(0).optional(),
  lastError: z.string().trim().max(500).nullable().optional(),
  startedAt: z.string().datetime().nullable().optional(),
  completedAt: z.string().datetime().nullable().optional(),
})

export type CreateBackgroundJobSchema = z.infer<typeof createBackgroundJobSchema>
export type UpdateBackgroundJobSchema = z.infer<typeof updateBackgroundJobSchema>

export function parseCreateBackgroundJob(input: unknown) {
  return createBackgroundJobSchema.parse(input)
}

export function parseUpdateBackgroundJob(input: unknown) {
  return updateBackgroundJobSchema.parse(input)
}
