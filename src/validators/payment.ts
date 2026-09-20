import { z } from "zod"

export const paymentStatusSchema = z.enum([
  "succeeded",
  "pending",
  "failed",
  "canceled",
  "refunded",
  "partially_refunded",
  "disputed",
])

export const paymentMethodTypeSchema = z.enum([
  "card",
  "bank_transfer",
  "mobile_money",
  "paypal",
  "other",
])

export const createPaymentSchema = z.object({
  organizationId: z.uuid(),
  subscriptionId: z.uuid().nullable().optional(),
  provider: z.string().trim().min(1).max(100),
  providerPaymentReference: z.string().trim().max(255).nullable().optional(),
  status: paymentStatusSchema,
  currency: z.string().trim().min(3).max(3),
  amount: z.number().finite().nullable().optional(),
  paymentMethodType: paymentMethodTypeSchema.nullable().optional(),
  metadata: z.unknown().nullable().optional(),
})

export const updatePaymentSchema = z.object({
  subscriptionId: z.uuid().nullable().optional(),
  providerPaymentReference: z.string().trim().max(255).nullable().optional(),
  status: paymentStatusSchema.optional(),
  currency: z.string().trim().min(3).max(3).optional(),
  amount: z.number().finite().nullable().optional(),
  paymentMethodType: paymentMethodTypeSchema.nullable().optional(),
  metadata: z.unknown().nullable().optional(),
})

export type CreatePaymentSchema = z.infer<typeof createPaymentSchema>
export type UpdatePaymentSchema = z.infer<typeof updatePaymentSchema>

export function parseCreatePayment(input: unknown) {
  return createPaymentSchema.parse(input)
}

export function parseUpdatePayment(input: unknown) {
  return updatePaymentSchema.parse(input)
}
