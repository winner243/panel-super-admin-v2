import type { Database } from "@/infrastructure/supabase/database"
import type {
  CreateWebhookInput,
  UpdateWebhookInput,
  Webhook,
} from "@/types/webhook"

export type WebhookRow = Database["public"]["Tables"]["webhooks"]["Row"]
export type WebhookInsert = Database["public"]["Tables"]["webhooks"]["Insert"]
export type WebhookUpdate = Database["public"]["Tables"]["webhooks"]["Update"]

function toMetadata(value: unknown): Record<string, unknown> | null {
  if (value === null || value === undefined) return null
  if (typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }
  return null
}

export function toWebhook(row: WebhookRow): Webhook {
  return {
    id: row.id,
    organizationId: row.organization_id,
    source: row.source,
    eventType: row.event_type,
    endpoint: row.endpoint,
    status: row.status as Webhook["status"],
    deliveryStatus: row.delivery_status as Webhook["deliveryStatus"],
    attempts: row.attempts,
    lastDeliveredAt: row.last_delivered_at,
    nextRetryAt: row.next_retry_at,
    errorCategory: row.error_category,
    correlationId: row.correlation_id,
    metadata: toMetadata(row.metadata),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function toWebhookInsert(input: CreateWebhookInput): WebhookInsert {
  return {
    organization_id: input.organizationId,
    source: input.source,
    event_type: input.eventType,
    endpoint: input.endpoint,
    status: input.status ?? "active",
    delivery_status: input.deliveryStatus ?? "pending",
    metadata: toMetadata(input.metadata) ?? {},
  }
}

export function toWebhookUpdate(input: UpdateWebhookInput): WebhookUpdate {
  return {
    ...(input.source !== undefined && { source: input.source }),
    ...(input.eventType !== undefined && { event_type: input.eventType }),
    ...(input.endpoint !== undefined && { endpoint: input.endpoint }),
    ...(input.status !== undefined && { status: input.status }),
    ...(input.deliveryStatus !== undefined && { delivery_status: input.deliveryStatus }),
    ...(input.attempts !== undefined && { attempts: input.attempts }),
    ...(input.lastDeliveredAt !== undefined && { last_delivered_at: input.lastDeliveredAt }),
    ...(input.nextRetryAt !== undefined && { next_retry_at: input.nextRetryAt }),
    ...(input.errorCategory !== undefined && { error_category: input.errorCategory }),
    ...(input.correlationId !== undefined && { correlation_id: input.correlationId }),
    ...(input.metadata !== undefined && { metadata: toMetadata(input.metadata) ?? undefined }),
  }
}
