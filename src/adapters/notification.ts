import type { Database } from "@/infrastructure/supabase/database"
import type {
  CreateNotificationInput,
  Notification,
  UpdateNotificationInput,
} from "@/types/notification"

export type NotificationRow = Database["public"]["Tables"]["notifications"]["Row"]
export type NotificationInsert = Database["public"]["Tables"]["notifications"]["Insert"]
export type NotificationUpdate = Database["public"]["Tables"]["notifications"]["Update"]

function toMetadata(value: unknown): Record<string, unknown> | null {
  if (value === null || value === undefined) return null
  if (typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }
  return null
}

export function toNotification(row: NotificationRow): Notification {
  return {
    id: row.id,
    organizationId: row.organization_id,
    recipientId: row.recipient_id,
    type: row.type as Notification["type"],
    title: row.title,
    message: row.message,
    channel: row.channel as Notification["channel"],
    status: row.status as Notification["status"],
    metadata: toMetadata(row.metadata),
    readAt: row.read_at,
    createdAt: row.created_at,
  }
}

export function toNotificationInsert(input: CreateNotificationInput): NotificationInsert {
  return {
    organization_id: input.organizationId ?? null,
    recipient_id: input.recipientId,
    type: input.type,
    title: input.title,
    message: input.message,
    channel: input.channel,
    metadata: toMetadata(input.metadata) ?? {},
  }
}

export function toNotificationUpdate(input: UpdateNotificationInput): NotificationUpdate {
  return {
    ...(input.status !== undefined && { status: input.status }),
    ...(input.metadata !== undefined && { metadata: toMetadata(input.metadata) ?? undefined }),
  }
}
