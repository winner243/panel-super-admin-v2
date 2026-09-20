import type { Database } from "@/infrastructure/supabase/database"
import type {
  CreateSubscriptionInput,
  Subscription,
  UpdateSubscriptionInput,
} from "@/types/subscription"

export type SubscriptionRow = Database["public"]["Tables"]["subscriptions"]["Row"]
export type SubscriptionInsert = Database["public"]["Tables"]["subscriptions"]["Insert"]
export type SubscriptionUpdate = Database["public"]["Tables"]["subscriptions"]["Update"]

function toMetadata(value: unknown): Record<string, unknown> | null {
  if (value === null || value === undefined) return null
  if (typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }
  return null
}

export function toSubscription(row: SubscriptionRow): Subscription {
  return {
    id: row.id,
    organizationId: row.organization_id,
    planId: row.plan_id,
    status: row.status as Subscription["status"],
    startDate: row.start_date,
    endDate: row.end_date,
    renewalDate: row.renewal_date,
    canceledAt: row.canceled_at,
    providerReference: row.provider_reference,
    metadata: toMetadata(row.metadata),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function toSubscriptionInsert(input: CreateSubscriptionInput): SubscriptionInsert {
  return {
    organization_id: input.organizationId,
    plan_id: input.planId,
    status: input.status,
    start_date: input.startDate,
    end_date: input.endDate ?? null,
    renewal_date: input.renewalDate ?? null,
    canceled_at: input.canceledAt ?? null,
    provider_reference: input.providerReference ?? null,
    metadata: toMetadata(input.metadata) ?? {},
  }
}

export function toSubscriptionUpdate(input: UpdateSubscriptionInput): SubscriptionUpdate {
  return {
    ...(input.planId !== undefined && { plan_id: input.planId }),
    ...(input.status !== undefined && { status: input.status }),
    ...(input.startDate !== undefined && { start_date: input.startDate }),
    ...(input.endDate !== undefined && { end_date: input.endDate }),
    ...(input.renewalDate !== undefined && { renewal_date: input.renewalDate }),
    ...(input.canceledAt !== undefined && { canceled_at: input.canceledAt }),
    ...(input.providerReference !== undefined && { provider_reference: input.providerReference }),
    ...(input.metadata !== undefined && { metadata: toMetadata(input.metadata) ?? undefined }),
  }
}