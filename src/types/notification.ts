export type NotificationChannel = "in_app" | "email" | "sms" | "push"

export type NotificationType =
  | "system"
  | "billing"
  | "security"
  | "membership"
  | "subscription"
  | "payment"
  | "custom"

export type NotificationStatus = "unread" | "read" | "archived"

export interface Notification {
  id: string
  organizationId: string | null
  recipientId: string
  type: NotificationType
  title: string
  message: string
  channel: NotificationChannel
  status: NotificationStatus
  metadata: Record<string, unknown> | null
  readAt: string | null
  createdAt: string
}

export type CreateNotificationInput = Pick<
  Notification,
  "recipientId" | "type" | "title" | "message" | "channel"
> & {
  organizationId?: string | null
  metadata?: unknown
}

export type UpdateNotificationInput = Partial<
  Pick<Notification, "status">
> & {
  metadata?: unknown
}
