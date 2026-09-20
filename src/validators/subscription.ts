import { z } from "zod"

export const subscriptionStatusSchema = z.enum([
  "active",
  "canceled",
  "past_due",
  "trialing",
  "incomplete",
  "incomplete_expired",
  "unpaid",
  "paused",
])

export const createSubscriptionSchema = z.object({
  organizationId: z.uuid(),
  planId: z.string().trim().min(1).max(100),
  status: subscriptionStatusSchema,
  startDate: z.string().datetime(),
  endDate: z.string().datetime().nullable().optional(),
  renewalDate: z.string().datetime().nullable().optional(),
  canceledAt: z.string().datetime().nullable().optional(),
  providerReference: z.string().trim().max(255).nullable().optional(),
  metadata: z.unknown().nullable().optional(),
})

export const updateSubscriptionSchema = z.object({
  planId: z.string().trim().min(1).max(100).optional(),
  status: subscriptionStatusSchema.optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().nullable().optional(),
  renewalDate: z.string().datetime().nullable().optional(),
  canceledAt: z.string().datetime().nullable().optional(),
  providerReference: z.string().trim().max(255).nullable().optional(),
  metadata: z.unknown().nullable().optional(),
})

export type CreateSubscriptionSchema = z.infer<typeof createSubscriptionSchema>
export type UpdateSubscriptionSchema = z.infer<typeof updateSubscriptionSchema>

export function parseCreateSubscription(input: unknown) {
  return createSubscriptionSchema.parse(input)
}

export function parseUpdateSubscription(input: unknown) {
  return updateSubscriptionSchema.parse(input)
}