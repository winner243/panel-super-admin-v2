import { z } from "zod"

export const notificationChannelSchema = z.enum(["in_app", "email", "sms", "push"])

export const notificationTypeSchema = z.enum([
  "system",
  "billing",
  "security",
  "membership",
  "subscription",
  "payment",
  "custom",
])

export const notificationStatusSchema = z.enum(["unread", "read", "archived"])

export const createNotificationSchema = z.object({
  organizationId: z.uuid().nullable().optional(),
  recipientId: z.uuid(),
  type: notificationTypeSchema,
  title: z.string().trim().min(1).max(200),
  message: z.string().trim().min(1).max(2000),
  channel: notificationChannelSchema,
  metadata: z.unknown().nullable().optional(),
})

export const updateNotificationSchema = z.object({
  status: notificationStatusSchema.optional(),
  metadata: z.unknown().nullable().optional(),
})

export type CreateNotificationSchema = z.infer<typeof createNotificationSchema>
export type UpdateNotificationSchema = z.infer<typeof updateNotificationSchema>

export function parseCreateNotification(input: unknown) {
  return createNotificationSchema.parse(input)
}

export function parseUpdateNotification(input: unknown) {
  return updateNotificationSchema.parse(input)
}
