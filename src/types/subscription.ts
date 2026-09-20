export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "past_due"
  | "trialing"
  | "incomplete"
  | "incomplete_expired"
  | "unpaid"
  | "paused"

export interface Subscription {
  id: string
  organizationId: string
  planId: string
  status: SubscriptionStatus
  startDate: string
  endDate: string | null
  renewalDate: string | null
  canceledAt: string | null
  providerReference: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

export type CreateSubscriptionInput = Pick<
  Subscription,
  "organizationId" | "planId" | "status" | "startDate"
> & {
  endDate?: string | null
  renewalDate?: string | null
  canceledAt?: string | null
  providerReference?: string | null
  metadata?: unknown
}

export type UpdateSubscriptionInput = Partial<
  Pick<
    Subscription,
    | "planId"
    | "status"
    | "startDate"
    | "endDate"
    | "renewalDate"
    | "canceledAt"
    | "providerReference"
  >
> & {
  metadata?: unknown
}