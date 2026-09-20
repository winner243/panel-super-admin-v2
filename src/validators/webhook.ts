import { z } from "zod"

export const webhookStatusSchema = z.enum(["active", "inactive", "failed"])

export const webhookDeliveryStatusSchema = z.enum(["pending", "success", "failed", "retrying"])

export const createWebhookSchema = z.object({
  organizationId: z.uuid(),
  source: z.string().trim().min(1).max(100),
  eventType: z.string().trim().min(1).max(100),
  endpoint: z.string().trim().min(1).max(500),
  status: webhookStatusSchema.default("active"),
  deliveryStatus: webhookDeliveryStatusSchema.default("pending"),
  metadata: z.unknown().nullable().optional(),
})

export const updateWebhookSchema = z.object({
  source: z.string().trim().min(1).max(100).optional(),
  eventType: z.string().trim().min(1).max(100).optional(),
  endpoint: z.string().trim().min(1).max(500).optional(),
  status: webhookStatusSchema.optional(),
  deliveryStatus: webhookDeliveryStatusSchema.optional(),
  attempts: z.number().int().min(0).optional(),
  lastDeliveredAt: z.string().datetime().nullable().optional(),
  nextRetryAt: z.string().datetime().nullable().optional(),
  errorCategory: z.string().trim().max(100).nullable().optional(),
  correlationId: z.string().trim().max(255).nullable().optional(),
  metadata: z.unknown().nullable().optional(),
})

export type CreateWebhookSchema = z.infer<typeof createWebhookSchema>
export type UpdateWebhookSchema = z.infer<typeof updateWebhookSchema>

export function parseCreateWebhook(input: unknown) {
  return createWebhookSchema.parse(input)
}

export function parseUpdateWebhook(input: unknown) {
  return updateWebhookSchema.parse(input)
}
