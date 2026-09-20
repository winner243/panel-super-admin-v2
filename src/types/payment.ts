export type PaymentStatus =
  | "succeeded"
  | "pending"
  | "failed"
  | "canceled"
  | "refunded"
  | "partially_refunded"
  | "disputed"

export type PaymentMethodType =
  | "card"
  | "bank_transfer"
  | "mobile_money"
  | "paypal"
  | "other"

export interface Payment {
  id: string
  organizationId: string
  subscriptionId: string | null
  provider: string
  providerPaymentReference: string | null
  status: PaymentStatus
  currency: string
  amount: number | null
  paymentMethodType: PaymentMethodType | null
  metadata: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

export type CreatePaymentInput = Pick<
  Payment,
  "organizationId" | "provider" | "status" | "currency"
> & {
  subscriptionId?: string | null
  providerPaymentReference?: string | null
  amount?: number | null
  paymentMethodType?: PaymentMethodType | null
  metadata?: unknown
}

export type UpdatePaymentInput = Partial<
  Pick<
    Payment,
    | "subscriptionId"
    | "providerPaymentReference"
    | "status"
    | "currency"
    | "amount"
    | "paymentMethodType"
  >
> & {
  metadata?: unknown
}
