import type { Database } from "@/infrastructure/supabase/database"
import type {
  CreatePaymentInput,
  Payment,
  UpdatePaymentInput,
} from "@/types/payment"

export type PaymentRow = Database["public"]["Tables"]["payments"]["Row"]
export type PaymentInsert = Database["public"]["Tables"]["payments"]["Insert"]
export type PaymentUpdate = Database["public"]["Tables"]["payments"]["Update"]

function toMetadata(value: unknown): Record<string, unknown> | null {
  if (value === null || value === undefined) return null
  if (typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }
  return null
}

export function toPayment(row: PaymentRow): Payment {
  return {
    id: row.id,
    organizationId: row.organization_id,
    subscriptionId: row.subscription_id,
    provider: row.provider,
    providerPaymentReference: row.provider_payment_reference,
    status: row.status as Payment["status"],
    currency: row.currency,
    amount: row.amount != null ? Number(row.amount) : null,
    paymentMethodType: row.payment_method_type as Payment["paymentMethodType"],
    metadata: toMetadata(row.metadata),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function toPaymentInsert(input: CreatePaymentInput): PaymentInsert {
  return {
    organization_id: input.organizationId,
    subscription_id: input.subscriptionId ?? null,
    provider: input.provider,
    provider_payment_reference: input.providerPaymentReference ?? null,
    status: input.status,
    currency: input.currency,
    amount: input.amount ?? null,
    payment_method_type: input.paymentMethodType ?? null,
    metadata: toMetadata(input.metadata) ?? {},
  }
}

export function toPaymentUpdate(input: UpdatePaymentInput): PaymentUpdate {
  return {
    ...(input.subscriptionId !== undefined && { subscription_id: input.subscriptionId }),
    ...(input.providerPaymentReference !== undefined && { provider_payment_reference: input.providerPaymentReference }),
    ...(input.status !== undefined && { status: input.status }),
    ...(input.currency !== undefined && { currency: input.currency }),
    ...(input.amount !== undefined && { amount: input.amount }),
    ...(input.paymentMethodType !== undefined && { payment_method_type: input.paymentMethodType }),
    ...(input.metadata !== undefined && { metadata: toMetadata(input.metadata) ?? undefined }),
  }
}
