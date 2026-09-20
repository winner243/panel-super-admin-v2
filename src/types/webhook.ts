export type WebhookStatus = "active" | "inactive" | "failed"

export type WebhookDeliveryStatus = "pending" | "success" | "failed" | "retrying"

export interface Webhook {
  id: string
  organizationId: string
  source: string
  eventType: string
  endpoint: string
  status: WebhookStatus
  deliveryStatus: WebhookDeliveryStatus
  attempts: number
  lastDeliveredAt: string | null
  nextRetryAt: string | null
  errorCategory: string | null
  correlationId: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

export type CreateWebhookInput = Pick<
  Webhook,
  "organizationId" | "source" | "eventType" | "endpoint"
> & {
  status?: WebhookStatus
  deliveryStatus?: WebhookDeliveryStatus
  metadata?: unknown
}

export type UpdateWebhookInput = Partial<
  Pick<
    Webhook,
    | "source"
    | "eventType"
    | "endpoint"
    | "status"
    | "deliveryStatus"
    | "attempts"
    | "lastDeliveredAt"
    | "nextRetryAt"
    | "errorCategory"
    | "correlationId"
  >
> & {
  metadata?: unknown
}
